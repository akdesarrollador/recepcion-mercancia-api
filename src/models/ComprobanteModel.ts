import readSQL from "../helpers/readSQL";
import sql from "mssql";
import RecepcionModel from "./RecepcionModel";
import { poolAK } from "../pool";

class ComprobanteModel {
  static async create(
    recepcion: number,
    file: Express.Multer.File
  ): Promise<boolean> {
    try {
      const recepcionExists = await RecepcionModel.exists(recepcion);
      if (!recepcionExists) {
        throw new Error(`No existe la recepcion con id ${recepcion}`);
      }

      const originalFileName = file.originalname;

      const transaction = new sql.Transaction(poolAK);
      await transaction.begin();
      await transaction
        .request()
        .input("url", sql.VarChar, originalFileName)
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
