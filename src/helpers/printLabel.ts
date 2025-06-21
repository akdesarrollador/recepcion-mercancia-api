import fs from "fs";
import path from "path";
import { exec } from "child_process";
import type { PrinterConfig, PrinterError } from "./types/printer";
import { checkPrinterStatus, interpretPrintError } from "./printerStatus";

const __dirname = path.resolve();

export const printLabel = async (
  zpl: string,
  tempFileName: string,
  printer: PrinterConfig,
  callback: (error: PrinterError | null) => void
): Promise<void> => {
  // Verificar estado de la impresora antes de imprimir
  try {
    const statusError = await checkPrinterStatus(printer);
    if (statusError) return callback(statusError);
  } catch (error) {
    return callback({
      type: "hardware",
      message: "Error al verificar estado de la impresora",
      recoverable: false,
    });
  }

  const tempFile = path.join(__dirname, tempFileName);

  // Crear archivo temporal
  try {
    fs.writeFileSync(tempFile, zpl);
  } catch (error) {
    console.error("❌ Error al crear archivo temporal:", error);
    return callback({
      type: "hardware",
      message: "Error al crear archivo temporal",
      recoverable: false,
    });
  }

  // Enviar a impresora
  const printCmd = `COPY /B "${tempFile}" "\\\\${printer.host}\\${printer.shareName}"`;

  exec(printCmd, { timeout: 30000 }, (error, stdout, stderr) => {
    // Limpiar archivo temporal
    try {
      fs.unlinkSync(tempFile);
    } catch (err) {
      console.error("⚠️  Error al eliminar archivo temporal:", err);
    }

    if (error) {
      const printerError = interpretPrintError(error, stderr);
      console.error(
        `❌ Error al imprimir en ${printer.name}:`,
        printerError.message
      );
      return callback(printerError);
    }
    callback(null);
  });
};

export const printTestLabel = (printer: PrinterConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const testZpl = `^XA
^FO10,200^A0N,40,40^FDPrueba - ${printer.name}^FS
^FO10,250^A0N,30,30^FD${new Date().toLocaleString()}^FS
^XZ`;
    printLabel(testZpl, `test_${printer.id}.zpl`, printer, (error) => {
      if (error) {
        console.error(
          `❌ Error en prueba para ${printer.name}:`,
          error.message
        );
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
