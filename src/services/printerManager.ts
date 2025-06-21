import type {
  PrinterConfig,
  PrinterStatus,
  PrinterError,
} from "../helpers/types/printer";
import { exec } from "child_process";
import { checkPaperStatus } from "../helpers/printerStatus";
import config from "../config";
import { printTestLabel } from "../helpers/printLabel";

class PrinterManager {
  private printers: Map<string, PrinterConfig> = new Map();
  private printerStatus: Map<string, PrinterStatus> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private currentPrinterIndex = 0;

  constructor() {
    this.initializePrinters();
    this.startHealthCheck();
  }

  private initializePrinters(): void {
    config.PRINTERS.forEach((printer) => {
      this.printers.set(printer.id, printer);
      this.printerStatus.set(printer.id, {
        id: printer.id,
        name: printer.name,
        status: "offline",
        lastCheck: new Date(),
        totalJobs: 0,
        failedJobs: 0,
        paperStatus: "unknown",
        ribbonStatus: "unknown",
        doorStatus: "unknown",
      });
    });
    console.log(`🖨️  Inicializadas ${this.printers.size} impresoras`);
  }

  // Obtener siguiente impresora disponible (excluyendo las que tienen problemas)
  getNextAvailablePrinter(): PrinterConfig | null {
    const availablePrinters = Array.from(this.printers.values())
      .filter((printer) => {
        const status = this.printerStatus.get(printer.id);
        return (
          printer.enabled &&
          status &&
          (status.status === "online" || status.status === "busy")
        );
      })
      .sort((a, b) => a.priority - b.priority);

    if (availablePrinters.length === 0) return null;

    const selectedPrinter =
      availablePrinters[this.currentPrinterIndex % availablePrinters.length];
    this.currentPrinterIndex++;

    return selectedPrinter;
  }

  getAllPrinters(): PrinterConfig[] {
    return Array.from(this.printers.values());
  }

  getAllPrinterStatus(): PrinterStatus[] {
    return Array.from(this.printerStatus.values());
  }

  getPrinter(printerId: string): PrinterConfig | undefined {
    return this.printers.get(printerId);
  }

  getPrinterStatus(printerId: string): PrinterStatus | undefined {
    return this.printerStatus.get(printerId);
  }

  setPrinterBusy(printerId: string, jobId: string): void {
    const status = this.printerStatus.get(printerId);
    if (status) {
      status.status = "busy";
      status.currentJob = jobId;
      status.lastCheck = new Date();
    }
  }

  setPrinterAvailable(printerId: string): void {
    const status = this.printerStatus.get(printerId);
    if (status) {
      status.status = "online";
      status.currentJob = undefined;
      status.lastCheck = new Date();
      status.totalJobs++;
    }
  }

  // Actualizado para manejar errores específicos
  setPrinterError(printerId: string, error: PrinterError): void {
    const status = this.printerStatus.get(printerId);
    if (status) {
      // Mapear tipo de error a estado específico
      switch (error.type) {
        case "paper":
          status.status = "out_of_paper";
          status.paperStatus = "out";
          break;
        case "door":
          status.status = "door_open";
          status.doorStatus = "open";
          break;
        case "ribbon":
          status.status = "ribbon_out";
          status.ribbonStatus = "out";
          break;
        default:
          status.status = "error";
      }

      status.currentJob = undefined;
      status.lastError = error.message;
      status.lastCheck = new Date();
      status.failedJobs++;
    }
  }

  // Health check mejorado
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      this.checkPrintersHealth();
    }, config.HEALTH_CHECK_INTERVAL);

    setTimeout(() => this.checkPrintersHealth(), 2000);
  }

  private async checkPrintersHealth(): Promise<void> {
    const promises = Array.from(this.printers.values()).map((printer) =>
      this.checkPrinterHealth(printer)
    );
    await Promise.allSettled(promises);
  }

  private async checkPrinterHealth(printer: PrinterConfig): Promise<void> {
    if (!printer.enabled) {
      const status = this.printerStatus.get(printer.id);
      if (status) {
        status.status = "offline";
        status.lastCheck = new Date();
      }
      return;
    }

    const status = this.printerStatus.get(printer.id);
    if (!status) return;

    try {
      // Ping básico
      const pingCmd =
        process.platform === "win32"
          ? `ping -n 1 -w 1000 ${printer.host}`
          : `ping -c 1 -W 1 ${printer.host}`;

      const pingResult = await new Promise<boolean>((resolve) => {
        exec(pingCmd, (error) => {
          resolve(!error);
        });
      });

      if (!pingResult) {
        if (status.status !== "error") {
          status.status = "offline";
        }
        status.lastCheck = new Date();
        return;
      }

      // Si el ping es exitoso, verificar estado del papel
      try {
        const paperStatus = await checkPaperStatus(printer);
        status.paperStatus = paperStatus;

        if (paperStatus === "out") {
          status.status = "out_of_paper";
          status.lastError = "Sin papel";
        } else if (status.status === "offline" || status.status === "error") {
          status.status = "online";
          status.lastError = undefined;
        }
      } catch (error) {
        // Si no se puede verificar el papel pero el ping funciona, marcar como online
        if (status.status === "offline") {
          status.status = "online";
          status.lastError = undefined;
        }
      }

      status.lastCheck = new Date();
    } catch (error) {
      console.error(`❌ Error en health check de ${printer.name}:`, error);
    }
  }

  enablePrinter(printerId: string): boolean {
    const printer = this.printers.get(printerId);
    if (printer) {
      printer.enabled = true;
      console.log(`✅ Impresora ${printer.name} habilitada`);
      return true;
    }
    return false;
  }

  disablePrinter(printerId: string): boolean {
    const printer = this.printers.get(printerId);
    if (printer) {
      printer.enabled = false;
      const status = this.printerStatus.get(printerId);
      if (status) {
        status.status = "offline";
      }
      console.log(`❌ Impresora ${printer.name} deshabilitada`);
      return true;
    }
    return false;
  }

  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  async printTestLabel() {
    const printers = printerManager.getAllPrinters().filter((p) => p.enabled);

    for (const printer of printers) {
      try {
        await printTestLabel(printer);
      } catch (error) {
        console.error(`❌ Error en prueba para ${printer.name}:`, error);
      }
    }
  }
}

export const printerManager = new PrinterManager();
export default PrinterManager;
