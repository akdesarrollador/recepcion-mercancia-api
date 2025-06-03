import { Request, Response } from "express";
import multer from "multer";
import ComprobanteModel from "../models/ComprobanteModel";

class ComprobanteController {
  async create(req: Request, res: Response) {
    try {
      const storage = multer.memoryStorage();
      const upload = multer({ storage });

      upload.array("comprobantes")(req, res, async (err) => {
        if (!req.body.recepcion) {
          return res.status(400).json({
            message: 'El campo recepcion es requerido en el form-data.',
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

        let exitosos = 0;
        let fallidos = 0;
        let errores: { filename: string, error: any }[] = [];

        for (const file of files) {
          try {
            await ComprobanteModel.create(req.body.recepcion, file);
            exitosos++;
          } catch (error) {
            fallidos++;
            errores.push({ filename: file.originalname, error });
          }
        }

        return res.status(200).json({
          message: "Archivos procesados",
          cantidad: files.length,
          exitosos,
          fallidos,
          errores,
        });
      });
    } catch (error) {
      return res.status(500).json({ error: `Error interno del servidor ${error}` });
    }
  }
}

export default ComprobanteController;
