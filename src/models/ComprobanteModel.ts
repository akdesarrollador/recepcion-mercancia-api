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
      console.log("originalFileName: ", originalFileName);
      const extension = originalFileName.substring(
        originalFileName.lastIndexOf(".")
      );
      console.log("extension: ", extension);

      const newName = renameBillImg(location, numeroOrden);
      console.log("newName: ", newName);
      const renamedFileName = newName + extension;
      console.log("renamedFileName: ", renamedFileName);

      if (config.PATH_FILES) {
        const savePath = path.join(config.PATH_FILES, renamedFileName);
        await fs.promises.writeFile(savePath, file.buffer);
      } else {
        throw new Error("La ruta de archivos no está configurada.");
      }

      console.log("recepcion: ", recepcion);
      console.log("recepcion typeof: ", typeof recepcion);

      const transaction = new sql.Transaction(poolaBC);
      await transaction.begin();
      await transaction
        .request()
        .input("url", sql.VarChar, renamedFileName)
        .input("recepcion", sql.Int, recepcion)
        .query(readSQL("comprobante/create"));

      await transaction.commit();
      console.log("Comprobante creado exitosamente");
      return true;
    } catch (error) {
      throw new Error(`Error al crear el comprobante: ${error}`);
    }
  }
}

export default ComprobanteModel;
