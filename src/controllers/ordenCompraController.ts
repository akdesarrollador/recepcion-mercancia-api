import { Request, Response } from "express";
import OrdenCompraModel from "../models/OrdenCompraModel";

class OrdenCompraController {
  async get(req: Request, res: Response): Promise<void> {
    const { numeroOrden } = req.params;
    const ubicacion = (req as any).ubicacion;

    const ordenCompra = await OrdenCompraModel.get(numeroOrden, ubicacion);

    if (ordenCompra) {
      res.status(200).json(ordenCompra);
    } else {
      res.status(404).json({ error: "Orden de compra no encontrada" });
    }
  }
}

export default OrdenCompraController;
