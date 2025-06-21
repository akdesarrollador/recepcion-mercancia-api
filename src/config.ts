import "dotenv/config";
import dotenv from "dotenv";
import type { PrinterConfig } from "./helpers/types/printer";

dotenv.config({ path: "../.env" });

const getPrintersConfig = (): PrinterConfig[] => {
  const printers: PrinterConfig[] = [];

  let i = 1;
  while (process.env[`PRINTER_${i}_HOST`]) {
    const printer: PrinterConfig = {
      id: `printer_${i}`,
      name: process.env[`PRINTER_${i}_NAME`] || `Impresora ${i}`,
      host: process.env[`PRINTER_${i}_HOST`]!,
      shareName: process.env[`PRINTER_${i}_SHARE`]!,
      enabled: process.env[`PRINTER_${i}_ENABLED`] !== "false",
      priority: Number.parseInt(process.env[`PRINTER_${i}_PRIORITY`] || "2"),
    };
    printers.push(printer);
    i++;
  }

  // Fallback a configuración legacy
  if (
    printers.length === 0 &&
    process.env.PRINTER_HOST &&
    process.env.PRINTER_SHARE_NAME
  ) {
    printers.push({
      id: "printer_legacy",
      name: "Impresora Principal",
      host: process.env.PRINTER_HOST,
      shareName: process.env.PRINTER_SHARE_NAME,
      enabled: true,
      priority: 1,
    });
  }

  if (printers.length === 0) {
    throw new Error(
      "No hay impresoras configuradas. Configura al menos PRINTER_1_HOST y PRINTER_1_SHARE"
    );
  }

  return printers;
};

const config = {
  PORT: process.env.PORT || 5080,
  PRINTERS: getPrintersConfig(),
  HEALTH_CHECK_INTERVAL: Number.parseInt(
    process.env.HEALTH_CHECK_INTERVAL || "30000"
  ),
  MAX_RETRIES: Number.parseInt(process.env.MAX_RETRIES || "3"),
};

config.PRINTERS.forEach((printer) => {
  console.log(
    `  - ${printer.name} (${printer.id}): \\\\${printer.host}\\${
      printer.shareName
    } [${printer.enabled ? "ACTIVA" : "INACTIVA"}]`
  );
});

export default config;
