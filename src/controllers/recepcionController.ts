import { Request, Response } from "express";
import RecepcionModel from "../models/RecepcionModel";

class RecepcionController {
  async create(req: Request, res: Response): Promise<void> {
    const { numeroOrden, proveedor } = req.body;

    try {
      const {success, id} = await RecepcionModel.create(numeroOrden, proveedor);
      if (success) {
        res.status(201).json({ message: "Recepción creada exitosamente", recepcion: id });
      } else {
        res.status(500).json({ error: "Error al crear la recepción" });
      }
    } catch (error) {
      console.error("Error al crear la recepción:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default RecepcionController;
