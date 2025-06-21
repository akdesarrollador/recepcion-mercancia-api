import { exec } from "child_process";
import type { PrinterConfig, PrinterError } from "../helpers/types/printer";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

// Verificar estado de la impresora antes de imprimir
export const checkPrinterStatus = (
  printer: PrinterConfig
): Promise<PrinterError | null> => {
  return new Promise((resolve) => {
    // Crear comando ZPL para consultar estado de la impresora
    const statusZpl = `^XA^HH^XZ`; // Host Identification - devuelve estado básico
    const tempFile = path.join(__dirname, `status_check_${printer.id}.zpl`);

    try {
      fs.writeFileSync(tempFile, statusZpl);
    } catch (error) {
      resolve({
        type: "hardware",
        message: "Error al crear archivo de verificación de estado",
        recoverable: false,
      });
      return;
    }

    const printCmd = `COPY /B "${tempFile}" "\\\\${printer.host}\\${printer.shareName}"`;

    exec(printCmd, { timeout: 10000 }, (error, stdout, stderr) => {
      // Limpiar archivo temporal
      try {
        fs.unlinkSync(tempFile);
      } catch (err) {
        console.error("Error al eliminar archivo temporal de estado:", err);
      }

      if (error) {
        const printerError = interpretPrintError(error, stderr);
        resolve(printerError);
      } else {
        resolve(null); // Sin errores
      }
    });
  });
};

// Interpretar errores de impresión para detectar problemas específicos
export const interpretPrintError = (
  error: Error,
  stderr: string
): PrinterError => {
  const errorMessage = error.message.toLowerCase();
  const stderrMessage = stderr.toLowerCase();
  const combinedMessage = `${errorMessage} ${stderrMessage}`;

  // Detectar falta de papel
  if (
    combinedMessage.includes("out of paper") ||
    combinedMessage.includes("paper out") ||
    combinedMessage.includes("no paper") ||
    combinedMessage.includes("paper empty") ||
    combinedMessage.includes("load paper") ||
    combinedMessage.includes("paper jam") ||
    combinedMessage.includes("paper error")
  ) {
    return {
      type: "paper",
      message: "La impresora no tiene papel o hay un problema con el papel",
      recoverable: true,
    };
  }

  // Detectar problemas con ribbon/cinta
  if (
    combinedMessage.includes("ribbon") ||
    combinedMessage.includes("ink") ||
    combinedMessage.includes("toner") ||
    combinedMessage.includes("cartridge")
  ) {
    return {
      type: "ribbon",
      message: "Problema con la cinta de impresión o cartucho",
      recoverable: true,
    };
  }

  // Detectar puerta abierta
  if (
    combinedMessage.includes("door open") ||
    combinedMessage.includes("cover open") ||
    combinedMessage.includes("lid open") ||
    combinedMessage.includes("door") ||
    combinedMessage.includes("cover")
  ) {
    return {
      type: "door",
      message: "La puerta o cubierta de la impresora está abierta",
      recoverable: true,
    };
  }

  // Detectar problemas de red/conexión
  if (
    combinedMessage.includes("network") ||
    combinedMessage.includes("connection") ||
    combinedMessage.includes("timeout") ||
    combinedMessage.includes("unreachable") ||
    combinedMessage.includes("access denied") ||
    combinedMessage.includes("path not found") ||
    combinedMessage.includes("device not ready")
  ) {
    return {
      type: "network",
      message: "Problema de conexión con la impresora",
      recoverable: true,
    };
  }

  // Error genérico de hardware
  if (
    combinedMessage.includes("hardware") ||
    combinedMessage.includes("device error") ||
    combinedMessage.includes("printer error")
  ) {
    return {
      type: "hardware",
      message: "Error de hardware en la impresora",
      recoverable: false,
    };
  }

  // Error desconocido
  return {
    type: "unknown",
    message: `Error desconocido: ${error.message}`,
    recoverable: true,
  };
};

// Verificar estado específico de papel usando comando ZPL
export const checkPaperStatus = (
  printer: PrinterConfig
): Promise<"ok" | "low" | "out" | "unknown"> => {
  return new Promise((resolve) => {
    // Comando ZPL para verificar estado del papel
    const paperCheckZpl = `^XA^HS^XZ`; // Host Status
    const tempFile = path.join(__dirname, `paper_check_${printer.id}.zpl`);

    try {
      fs.writeFileSync(tempFile, paperCheckZpl);
    } catch (error) {
      resolve("unknown");
      return;
    }

    const printCmd = `COPY /B "${tempFile}" "\\\\${printer.host}\\${printer.shareName}"`;

    exec(printCmd, { timeout: 5000 }, (error, stdout, stderr) => {
      try {
        fs.unlinkSync(tempFile);
      } catch (err) {
        // Ignorar error de limpieza
      }

      if (error) {
        const printerError = interpretPrintError(error, stderr);
        if (printerError.type === "paper") {
          resolve("out");
        } else {
          resolve("unknown");
        }
      } else {
        // Si no hay error, asumimos que el papel está OK
        resolve("ok");
      }
    });
  });
};
