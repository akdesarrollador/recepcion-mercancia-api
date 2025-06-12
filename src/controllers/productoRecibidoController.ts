import { Request, Response } from "express";
import ProductoRecibidoModel from "../models/ProductoRecibidoModel";

class ProductoRecibidoController {
  async create(req: Request, res: Response): Promise<void> {
    const {
      codigo,
      descripcion,
      cantidad_odc,
      recibido,
      unidades_por_bulto,
      recepcion,
    } = req.body;

    try {
      const user = (req as any).user;
      const success = await ProductoRecibidoModel.create(
        codigo,
        descripcion,
        cantidad_odc,
        recibido,
        unidades_por_bulto,
        user,
        recepcion
      );

      if (success) {
        res
          .status(201)
          .json({ message: "Producto recibido creado exitosamente" });
      } else {
        res.status(500).json({ error: "Error al crear el producto recibido" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default ProductoRecibidoController;
