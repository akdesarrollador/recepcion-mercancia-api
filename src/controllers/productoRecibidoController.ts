import { Request, Response } from "express";
import ProductoRecibidoModel from "../models/ProductoRecibidoModel";

class ProductoRecibidoController {
  async create(req: Request, res: Response): Promise<void> {
    const {
      codigo,
      descripcion,
      cantidad_odc,
      cantidad_recibida,
      recepcion,
    } = req.body;

    try {
      const user = (req as any).user;
      const success = await ProductoRecibidoModel.create(
        codigo,
        descripcion,
        cantidad_odc,
        cantidad_recibida,
        user,
        recepcion,
      );

      if (success) {
        res.status(201).json({ message: "Producto recibido creado exitosamente" });
      } else {
        res.status(500).json({ error: "Error al crear el producto recibido" });
      }
    } catch (error) {
      console.error("Error al crear el producto recibido:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default ProductoRecibidoController;
