import { Request, Response } from "express";
import RecepcionModel from "../models/RecepcionModel";

class RecepcionController {
  async create(req: Request, res: Response): Promise<void> {
    const { numeroOrden, proveedor, sucursal, codigoProveedor } = req.body;

    try {
      const { success, id, confirmation } = await RecepcionModel.create(
        numeroOrden,
        proveedor,
        sucursal,
        codigoProveedor
      );

      if (success) {
        res.status(201).json({
          message: "Recepción creada exitosamente",
          recepcion: id,
          confirmacion: confirmation,
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default RecepcionController;
