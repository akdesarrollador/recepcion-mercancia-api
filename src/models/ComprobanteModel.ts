import readSQL from "../helpers/readSQL";
import sql from "mssql";
import RecepcionModel from "./RecepcionModel";
import { poolaBC } from "../pool";
import renameBillImg from "../helpers/renameBillImg";
import fs from "fs";
import path from "path";
import os from "os";

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

      // Guardar en la carpeta facturas-recepcion dentro de Documentos del usuario
      const documentsPath = path.join(
        os.homedir(),
        "Documents",
        "facturas-recepcion"
      );
      const savePath = path.join(documentsPath, renamedFileName);

      // Crear la carpeta si no existe
      await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
      await fs.promises.writeFile(savePath, file.buffer);

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
