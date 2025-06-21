import type { Request, Response } from "express";
import { printQueue } from "../services/printQueue";
import { printerManager } from "../services/printerManager";

// Obtener todos los trabajos
export const getAllJobs = (req: Request, res: Response) => {
  const { status, printer, limit, errorType } = req.query;

  let jobs = printQueue.getAllJobs();

  if (status && typeof status === "string") {
    jobs = printQueue.getJobsByStatus(status as any);
  }

  if (printer && typeof printer === "string") {
    jobs = printQueue.getJobsByPrinter(printer);
  }

  if (errorType && typeof errorType === "string") {
    jobs = jobs.filter((job) => job.errorType === errorType);
  }

  if (limit && typeof limit === "string") {
    const limitNum = Number.parseInt(limit);
    if (!isNaN(limitNum) && limitNum > 0) {
      jobs = jobs.slice(0, limitNum);
    }
  }

  jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json({
    jobs: jobs.map((job) => {
      const assignedPrinter = job.assignedPrinter
        ? printerManager.getPrinter(job.assignedPrinter)
        : null;
      return {
        id: job.id,
        codigo: job.codigo,
        status: job.status,
        assignedPrinter: assignedPrinter
          ? {
              id: assignedPrinter.id,
              name: assignedPrinter.name,
            }
          : null,
        createdAt: job.createdAt,
        processedAt: job.processedAt,
        completedAt: job.completedAt,
        error: job.error,
        errorType: job.errorType,
        retryCount: job.retryCount,
      };
    }),
    total: jobs.length,
  });
};

// Obtener estadísticas de la cola
export const getQueueStats = (req: Request, res: Response) => {
  const stats = printQueue.getStats();
  const printerStatuses = printerManager.getAllPrinterStatus();

  // Estadísticas adicionales por tipo de error
  const jobs = printQueue.getAllJobs();
  const errorStats = {
    paper: jobs.filter((j) => j.errorType === "paper").length,
    network: jobs.filter((j) => j.errorType === "network").length,
    door: jobs.filter((j) => j.errorType === "door").length,
    ribbon: jobs.filter((j) => j.errorType === "ribbon").length,
    hardware: jobs.filter((j) => j.errorType === "hardware").length,
    unknown: jobs.filter((j) => j.errorType === "unknown").length,
  };

  const printerIssues = {
    outOfPaper: printerStatuses.filter((p) => p.status === "out_of_paper")
      .length,
    doorOpen: printerStatuses.filter((p) => p.status === "door_open").length,
    ribbonOut: printerStatuses.filter((p) => p.status === "ribbon_out").length,
    offline: printerStatuses.filter((p) => p.status === "offline").length,
    error: printerStatuses.filter((p) => p.status === "error").length,
  };

  res.json({
    ...stats,
    errorStats,
    printerIssues,
  });
};

// Limpiar trabajos antiguos
export const cleanOldJobs = (req: Request, res: Response) => {
  const { hours } = req.query;
  const hoursNum =
    hours && typeof hours === "string" ? Number.parseInt(hours) : 24;

  const removedCount = printQueue.cleanOldJobs(hoursNum);

  res.json({
    success: true,
    message: "Limpieza completada",
    removedJobs: removedCount,
    hoursThreshold: hoursNum,
  });
};

// Obtener todas las impresoras
export const getAllPrinters = (req: Request, res: Response) => {
  const printers = printerManager.getAllPrinters();
  const printersStatus = printerManager.getAllPrinterStatus();

  const printersWithStatus = printers.map((printer) => {
    const status = printersStatus.find((s) => s.id === printer.id);
    return {
      ...printer,
      status: status || {
        id: printer.id,
        name: printer.name,
        status: "unknown",
        lastCheck: new Date(),
        totalJobs: 0,
        failedJobs: 0,
        paperStatus: "unknown",
        ribbonStatus: "unknown",
        doorStatus: "unknown",
      },
    };
  });

  res.json({
    printers: printersWithStatus,
    total: printers.length,
  });
};
