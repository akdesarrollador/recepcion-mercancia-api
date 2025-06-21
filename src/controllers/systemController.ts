import type { Request, Response } from "express";
import { printerManager } from "../services/printerManager";
import { printQueue } from "../services/printQueue";

export const getSystemStatus = (req: Request, res: Response) => {
  const printerStatuses = printerManager.getAllPrinterStatus();
  const queueStats = printQueue.getStats();

  const availablePrinters = printerStatuses.filter(
    (p) => p.status === "online"
  );
  const offlinePrinters = printerStatuses.filter((p) => p.status === "offline");
  const errorPrinters = printerStatuses.filter((p) =>
    ["out_of_paper", "door_open", "ribbon_out", "error"].includes(p.status)
  );

  const systemHealth = {
    status: availablePrinters.length > 0 ? "healthy" : "degraded",
    canProcessJobs: availablePrinters.length > 0,
    message:
      availablePrinters.length === 0
        ? "No hay impresoras disponibles - el sistema no puede procesar impresiones"
        : `Sistema operativo con ${availablePrinters.length} impresora(s) disponible(s)`,
  };

  res.json({
    system: systemHealth,
    printers: {
      total: printerStatuses.length,
      available: availablePrinters.length,
      offline: offlinePrinters.length,
      withErrors: errorPrinters.length,
    },
    queue: queueStats,
    timestamp: new Date().toISOString(),
  });
};

export const runPrinterDiagnostics = async (req: Request, res: Response) => {
  const printers = printerManager.getAllPrinters();
  const diagnostics = [];

  for (const printer of printers) {
    const status = printerManager.getPrinterStatus(printer.id);
    diagnostics.push({
      id: printer.id,
      name: printer.name,
      host: printer.host,
      shareName: printer.shareName,
      enabled: printer.enabled,
      status: status?.status || "unknown",
      lastCheck: status?.lastCheck,
      lastError: status?.lastError,
      totalJobs: status?.totalJobs || 0,
      failedJobs: status?.failedJobs || 0,
    });
  }

  res.json({
    diagnostics,
    summary: {
      total: printers.length,
      enabled: printers.filter((p) => p.enabled).length,
      online: diagnostics.filter((d) => d.status === "online").length,
      offline: diagnostics.filter((d) => d.status === "offline").length,
      errors: diagnostics.filter(
        (d) => d.status !== "online" && d.status !== "offline"
      ).length,
    },
    timestamp: new Date().toISOString(),
  });
};
