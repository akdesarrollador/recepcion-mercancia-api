import { Request, Response } from "express";
import RecepcionModel from "../models/RecepcionModel";

class RecepcionController {
  async create(req: Request, res: Response): Promise<void> {
    const { numeroOrden, proveedor } = req.body;

    try {
      const {success, id} = await RecepcionModel.create(numeroOrden, proveedor);
      if (success) {
        res.status(201).json({ message: "Recepción creada exitosamente", recepcion: id });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default RecepcionController;
