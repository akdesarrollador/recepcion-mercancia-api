import readSQL from "../helpers/readSQL";
import sql from "mssql";
import RecepcionModel from "./RecepcionModel";
import { poolaBC } from "../pool";
import renameBillImg from "../helpers/renameBillImg";
import fs from "fs";
import path from "path";
import config from "../config";

class ComprobanteModel {
  static async create(
    recepcion: number,
    file: Express.Multer.File,
    location: string,
    numeroOrden: string
  ): Promise<boolean> {
    try {
      const recepcionExists = await RecepcionModel.exists(recepcion);
      if (!recepcionExists) {
        throw new Error(`No existe la recepcion con id ${recepcion}`);
      }

      const originalFileName = file.originalname;
      const extension = originalFileName.substring(
        originalFileName.lastIndexOf(".")
      );

      const newName = renameBillImg(location, numeroOrden);
      const renamedFileName = newName + extension;

      if (config.PATH_FILES) {
        try {
          await fs.promises.access(config.PATH_FILES, fs.constants.W_OK); //
        } catch (err: any) {
          console.error("No puedo acceder a la ruta:", err);
          throw new Error(`Ruta inaccesible: ${err.message}`);
        }

        const savePath = path.join(config.PATH_FILES, renamedFileName);
        try {
          await fs.promises.writeFile(savePath, file.buffer);
        } catch (err) {
          console.error("Error guardando el archivo:", err);
          throw err; // deja que el catch externo te lo capture si quieres
        }
      } else {
        throw new Error("La ruta de archivos no está configurada.");
      }

      const transaction = new sql.Transaction(poolaBC);
      await transaction.begin();
      await transaction
        .request()
        .input("url", sql.VarChar, renamedFileName)
        .input("recepcion", sql.Int, recepcion)
        .query(readSQL("comprobante/create"));

      await transaction.commit();
      return true;
    } catch (error) {
      throw new Error(`Error al crear el comprobante: ${error}`);
    }
  }
}

export default ComprobanteModel;
