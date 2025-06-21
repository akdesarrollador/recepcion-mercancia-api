import { PrintJob, QueueStats } from "../helpers/types/printer";
import { printerManager } from "./printerManager";
import { printLabel } from "../helpers/printLabel";
import { v4 as uuidv4 } from "uuid";
import config from "../config";

class DistributedPrintQueue {
  private jobs: Map<string, PrintJob> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly processInterval = 1000; // 1 segundo

  constructor() {
    this.startProcessing();
  }

  // Agregar trabajo a la cola
  addJob(
    codigo: string,
    customZpl?: string,
    priority: "high" | "normal" | "low" = "normal"
  ): string {
    const jobId = uuidv4();
    const zpl =
      customZpl ||
      `^XA
^FO50,50^A0N,50,50^FD${codigo}^FS
^XZ`;

    const job: PrintJob = {
      id: jobId,
      codigo,
      zpl,
      status: "pending",
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: config.MAX_RETRIES,
      priority,
    };

    this.jobs.set(jobId, job);
    return jobId;
  }

  // Agregar múltiples trabajos
  addBatchJobs(
    codigos: string[],
    customZpl?: string,
    priority: "high" | "normal" | "low" = "normal"
  ): string[] {
    const jobIds: string[] = [];

    codigos.forEach((codigo) => {
      const jobId = this.addJob(codigo, customZpl, priority);
      jobIds.push(jobId);
    });

    return jobIds;
  }

  // Obtener trabajo por ID
  getJob(jobId: string): PrintJob | undefined {
    return this.jobs.get(jobId);
  }

  // Obtener todos los trabajos
  getAllJobs(): PrintJob[] {
    return Array.from(this.jobs.values());
  }

  // Obtener trabajos por estado
  getJobsByStatus(status: PrintJob["status"]): PrintJob[] {
    return Array.from(this.jobs.values()).filter(
      (job) => job.status === status
    );
  }

  // Obtener trabajos por impresora
  getJobsByPrinter(printerId: string): PrintJob[] {
    return Array.from(this.jobs.values()).filter(
      (job) => job.assignedPrinter === printerId
    );
  }

  // Obtener estadísticas
  getStats(): QueueStats {
    const jobs = Array.from(this.jobs.values());
    const printerStatus = printerManager.getAllPrinterStatus();

    return {
      totalJobs: jobs.length,
      pendingJobs: jobs.filter((j) => j.status === "pending").length,
      processingJobs: jobs.filter((j) => j.status === "processing").length,
      completedJobs: jobs.filter((j) => j.status === "completed").length,
      failedJobs: jobs.filter((j) => j.status === "failed").length,
      activePrinters: printerStatus.filter(
        (p) => p.status === "online" || p.status === "busy"
      ).length,
      totalPrinters: printerStatus.length,
    };
  }

  // Limpiar trabajos antiguos
  cleanOldJobs(olderThanHours = 24): number {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const initialSize = this.jobs.size;

    for (const [jobId, job] of this.jobs.entries()) {
      if (
        (job.status === "completed" || job.status === "failed") &&
        job.completedAt &&
        job.completedAt < cutoffTime
      ) {
        this.jobs.delete(jobId);
      }
    }

    const removedCount = initialSize - this.jobs.size;

    return removedCount;
  }

  // Reintentar trabajo fallido
  retryJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== "failed") {
      return false;
    }

    if (job.retryCount >= job.maxRetries) return false;

    job.status = "pending";
    job.assignedPrinter = undefined;
    job.error = undefined;
    job.retryCount++;

    return true;
  }

  // Iniciar procesamiento
  private startProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.processInterval);
  }

  // Procesar cola
  private async processQueue(): Promise<void> {
    // Obtener trabajos pendientes ordenados por prioridad
    const pendingJobs = Array.from(this.jobs.values())
      .filter((job) => job.status === "pending")
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = {
          high: 1,
          normal: 2,
          low: 3,
        };
        const aPriority = a.priority ?? "normal";
        const bPriority = b.priority ?? "normal";
        if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
          return priorityOrder[aPriority] - priorityOrder[bPriority];
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    if (pendingJobs.length === 0) {
      return;
    }

    // Procesar trabajos asignándolos a impresoras disponibles
    for (const job of pendingJobs) {
      const availablePrinter = printerManager.getNextAvailablePrinter();
      if (!availablePrinter) {
        break; // No hay impresoras disponibles
      }

      // Asignar trabajo a impresora
      job.status = "assigned";
      job.assignedPrinter = availablePrinter.id;

      // Procesar trabajo de forma asíncrona
      this.processJob(job, availablePrinter);
    }
  }

  // Procesar trabajo individual
  private async processJob(job: PrintJob, printer: any): Promise<void> {
    job.status = "processing";
    job.processedAt = new Date();
    printerManager.setPrinterBusy(printer.id, job.id);

    try {
      await this.printJob(job, printer);

      job.status = "completed";
      job.completedAt = new Date();
      printerManager.setPrinterAvailable(printer.id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      job.status = "failed";
      job.error = errorMessage;
      job.completedAt = new Date();

      printerManager.setPrinterError(printer.id, {
        type: "unknown",
        message: errorMessage,
        recoverable: false,
      });

      console.error(
        `Trabajo ${job.id} falló en ${printer.name}: ${errorMessage}`
      );

      // Auto-reintento si no ha excedido el límite
      if (job.retryCount < job.maxRetries) {
        setTimeout(() => {
          this.retryJob(job.id);
        }, 5000);
      }
    }
  }

  // Imprimir trabajo (promisificado)
  private printJob(job: PrintJob, printer: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const tempFileName = `job_${job.id}_${printer.id}.zpl`;

      printLabel(job.zpl, tempFileName, printer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  // Detener procesamiento
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}

export const distributedPrintQueue = new DistributedPrintQueue();
export default DistributedPrintQueue;
