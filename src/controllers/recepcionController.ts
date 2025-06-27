import { Request, Response } from "express";
import RecepcionModel from "../models/RecepcionModel";
import RecepcionODCModel from "../models/RecepcionODCModel";
import ProductoRecibidoModel from "../models/ProductoRecibidoModel";

class RecepcionController {
  async create(req: Request, res: Response): Promise<void> {
    const {
      ordenes,
      proveedor,
      codigoProveedor,
      productos_recibidos,
      duracion,
    } = req.body;
    const ubicacion = (req as any).ubicacion;
    const user = (req as any).user;

    try {
      const {
        success: createRecepcionSuccess,
        id: recepcionID,
        confirmacion,
      } = await RecepcionModel.create(
        proveedor,
        codigoProveedor,
        ubicacion,
        duracion
      );

      if (!createRecepcionSuccess || !recepcionID) {
        res.status(500).json({
          message: "Error al crear la recepción",
          recepcion: recepcionID,
        });
        return;
      }

      for (let orden of ordenes) {
        await RecepcionODCModel.create(recepcionID, orden);
      }

      for (let producto of productos_recibidos) {
        await ProductoRecibidoModel.create(
          producto.codigo,
          producto.descripcion,
          producto.unidades_odc,
          producto.unidades,
          producto.unidades_por_bulto,
          user,
          recepcionID
        );
      }

      res.status(201).json({
        message: "Recepción creada exitosamente",
        recepcion: recepcionID,
        confirmacion,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default RecepcionController;
