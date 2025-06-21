import { Router } from "express";
import PostPrintController from "../controllers/printController";
import {
  getAllJobs,
  getQueueStats,
  cleanOldJobs,
  getAllPrinters,
} from "../controllers/queueController";
import { printerManager } from "../services/printerManager";

const indexRouter = Router();

indexRouter.get("/", (req, res) => {
  res.send("Welcome to the Print Service API");
});
indexRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
// === RUTAS DE IMPRESIÓN ===
indexRouter.post("/print", PostPrintController);
indexRouter.post("/test", printerManager.printTestLabel);

// === RUTAS DE COLA ===
indexRouter.get("/queue/stats", getQueueStats);
indexRouter.get("/queue/jobs", getAllJobs);
indexRouter.post("/queue/clean", cleanOldJobs);

// === RUTAS DE IMPRESORAS ===
indexRouter.get("/printers", getAllPrinters);

export default indexRouter;
