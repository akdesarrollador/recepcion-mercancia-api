import { Request, Response } from "express";
import OrdenCompraModel from "../models/OrdenCompraModel";
import formatLocation from "../helpers/formatLocations";

class OrdenCompraController {
  async get(req: Request, res: Response): Promise<void> {
    try {
      const { numeroOrden } = req.params;
      const ordenCompra = await OrdenCompraModel.get(numeroOrden);
      if (!ordenCompra) {
        res.status(404).json({ error: "Orden de compra no encontrada" });
        return;
      }

      const ubicacion = (req as any).ubicacion;
      const productos = await OrdenCompraModel.getProductsByLocation(
        numeroOrden,
        ubicacion
      );

      res.status(200).json({
        ordenCompra: { ...ordenCompra, recibirEn: formatLocation(ubicacion) },
        productos,
      });
    } catch (error: any) {
      res.status(500).json({ error: `${error.message}` });
    }
  }
}

export default OrdenCompraController;
