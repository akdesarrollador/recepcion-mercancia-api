import readSQL from "../helpers/readSQL";
import sql from "mssql";
import RecepcionModel from "./RecepcionModel";
import { poolAK } from "../pool";
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
        const savePath = path.join(config.PATH_FILES, renamedFileName);
        await fs.promises.writeFile(savePath, file.buffer);
      } else {
        throw new Error("La ruta de archivos no está configurada.");
      }

      const transaction = new sql.Transaction(poolAK);
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
