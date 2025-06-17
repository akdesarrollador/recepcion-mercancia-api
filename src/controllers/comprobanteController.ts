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
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
          return res
            .status(400)
            .json({ message: "No se recibieron archivos." });
        }

        for (const file of files) {
          try {
            await ComprobanteModel.create(
              req.body.recepcion,
              file,
              req.body.location,
              req.body.numeroOrden
            );
          } catch (error) {
            throw new Error(
              `Error al procesar el archivo ${file.originalname}: ${error}`
            );
          }
        }

        return res.status(200).json({ message: "Archivo procesado" });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Error interno del servidor ${error}` });
    }
  }
}

export default ComprobanteController;
