import { Request, Response } from "express";
import { NewReception, RecepcionService } from "../services/RecepcionService";

class RecepcionController {
  async create(req: Request, res: Response): Promise<void> {
    const {
      ordenes,
      proveedor,
      codigoProveedor,
      productos_recibidos: productos,
      duracion,
    } = req.body;
    const ubicacion = (req as any).ubicacion;
    const user = (req as any).user;

   try {
      const { id, confirmacion } = await RecepcionService.createFullReception({
        proveedor,
        codigoProveedor,
        sucursal: ubicacion,
        duracion,
        ordenes,
        productos,
        receptor: user,
      } as NewReception);

      res.status(201).json({
        message: "Recepción creada exitosamente",
        recepcion: id,
        confirmacion,
      });
    } catch (error: any) {
      // Diferenciamos validaciones de errores internos
      if (error.message.startsWith("Producto") || error.message.includes("ODC")) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Error interno al crear recepción", detail: error.message });
      }
    }
  }
}

export default RecepcionController;
