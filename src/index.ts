import config from "./config";
import { server } from "./app";
import os from "os";
import { printQueue } from "./services/printQueue";
import { printerManager } from "./services/printerManager";

server.listen(config.PORT, () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (ifaceList) {
      for (const iface of ifaceList) {
        if (iface.family === "IPv4" && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }
  }

  console.log("======================================");
  console.log(`Server running on the following IPs:`);
  addresses.forEach((ip) => {
    console.log(`  http://${ip}:${config.PORT}`);
  });

  console.log("======================================");

  setInterval(() => {
    printQueue.cleanOldJobs(24);
  }, 60 * 60 * 1000);
});

// Cleanup graceful
const gracefulShutdown = () => {
  console.log("🛑 Cerrando servidor...");
  printQueue.stop();
  printerManager.stop();
  server.close(() => {
    console.log("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});
