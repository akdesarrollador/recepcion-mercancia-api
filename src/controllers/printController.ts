import { printQueue } from "../services/printQueue";
import type { Request, Response } from "express";

const PostPrintController = (req: Request, res: Response) => {
  const { codigo, zpl } = req.body;

  if (!codigo) {
    console.log('❌ No se recibió el campo "codigo"');
    return res.status(400).json({
      error: "No code provided",
      message: 'El campo "codigo" es requerido',
    });
  }

  try {
    // Cada petición HTTP agrega UN trabajo a la cola
    const jobId = printQueue.addJob(codigo, zpl);

    res.status(202).json({
      success: true,
      message: "Trabajo agregado a la cola de impresión",
      jobId: jobId,
      codigo: codigo,
      status: "pending",
    });
  } catch (error) {
    console.error("❌ Error al agregar trabajo a la cola:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error al procesar la solicitud de impresión",
    });
  }
};

export default PostPrintController;
