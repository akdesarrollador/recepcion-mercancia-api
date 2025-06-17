import { Request, Response } from "express";
import multer from "multer";
import ComprobanteModel from "../models/ComprobanteModel";

class ComprobanteController {
  async create(req: Request, res: Response) {
    try {
      const storage = multer.memoryStorage();
      const upload = multer({ storage });

      upload.array("comprobante")(req, res, async (err) => {
        if (
          !req.body.recepcion ||
          !req.body.location ||
          !req.body.numeroOrden
        ) {
          return res.status(400).json({
            message:
              "Los campos recepcion, location y numeroOrden son requeridos en el form-data.",
          });
        }

        if (err)
          return res
            .status(400)
            .json({ message: `Error al guardar los archivos: ${err}` });

        const file = req.file as Express.Multer.File;

        if (!file) {
          return res.status(400).json({ message: "No se recibió el archivo." });
        }

        await ComprobanteModel.create(
          req.body.recepcion,
          file,
          req.body.location,
          req.body.numeroOrden
        );

        return res.status(200).json({ message: "Archivo procesado" });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Error al crear el comprobante ${error}` });
    }
  }
}

export default ComprobanteController;
