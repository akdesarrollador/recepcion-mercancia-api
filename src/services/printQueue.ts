import type {
  PrintJob,
  QueueStats,
  PrinterError,
} from "../helpers/types/printer";
import { printerManager } from "./printerManager";
import { printLabel } from "../helpers/printLabel";
import { v4 as uuidv4 } from "uuid";
import config from "../config";

class PrintQueue {
  private jobs: Map<string, PrintJob> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly processInterval = 500;

  constructor() {
    this.startProcessing();
  }

  addJob(codigo: string, customZpl?: string): string {
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
      priority: "",
    };

    this.jobs.set(jobId, job);

    return jobId;
  }

  getJob(jobId: string): PrintJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): PrintJob[] {
    return Array.from(this.jobs.values());
  }

  getJobsByStatus(status: PrintJob["status"]): PrintJob[] {
    return Array.from(this.jobs.values()).filter(
      (job) => job.status === status
    );
  }

  getJobsByPrinter(printerId: string): PrintJob[] {
    return Array.from(this.jobs.values()).filter(
      (job) => job.assignedPrinter === printerId
    );
  }

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

  retryJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== "failed") {
      return false;
    }

    if (job.retryCount >= job.maxRetries) {
      return false;
    }

    job.status = "pending";
    job.assignedPrinter = undefined;
    job.error = undefined;
    job.errorType = undefined;
    job.retryCount++;

    return true;
  }

  private startProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.processInterval);
  }

  private async processQueue(): Promise<void> {
    const pendingJobs = Array.from(this.jobs.values())
      .filter((job) => job.status === "pending")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (pendingJobs.length === 0) {
      return;
    }

    for (const job of pendingJobs) {
      const availablePrinter = printerManager.getNextAvailablePrinter();
      if (!availablePrinter) {
        break;
      }

      job.assignedPrinter = availablePrinter.id;
      job.status = "processing";
      job.processedAt = new Date();

      printerManager.setPrinterBusy(availablePrinter.id, job.id);

      this.processJobAsync(job, availablePrinter);
    }
  }

  private async processJobAsync(job: PrintJob, printer: any): Promise<void> {
    try {
      await this.printJob(job, printer);

      job.status = "completed";
      job.completedAt = new Date();
      printerManager.setPrinterAvailable(printer.id);
    } catch (error) {
      const printerError = error as PrinterError;

      job.status = "failed";
      job.error = printerError.message;
      job.errorType = printerError.type;
      job.completedAt = new Date();

      printerManager.setPrinterError(printer.id, printerError);

      console.error(
        `❌ Falló ${job.id} en ${printer.name}: ${printerError.message}`
      );

      // Solo reintentar si el error es recuperable
      if (printerError.recoverable && job.retryCount < job.maxRetries) {
        const retryDelay = printerError.type === "paper" ? 30000 : 5000; // 30s para papel, 5s para otros
        setTimeout(() => {
          this.retryJob(job.id);
        }, retryDelay);
      }
    }
  }

  private printJob(job: PrintJob, printer: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const tempFileName = `job_${job.id}.zpl`;

      printLabel(job.zpl, tempFileName, printer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}

export const printQueue = new PrintQueue();
export default PrintQueue;
