import readSQL from "../helpers/readSQL";
import sql from "mssql";
import RecepcionModel from "./RecepcionModel";
import { poolaBC } from "../pool";
import renameBillImg from "../helpers/renameBillImg";
import config from "../config";
import ftp from "basic-ftp";
import { Readable } from "stream";

class ComprobanteModel {
  static async create(
    recepcion: number,
    file: Express.Multer.File,
    location: string,
    numeroOrden: string
  ): Promise<boolean> {
    const transaction = new sql.Transaction(poolaBC);
    await transaction.begin();

    const client = new ftp.Client(0);
    client.ftp.verbose = false;

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

      await client.access({
        host: config.FTP.SERVER,
        user: config.FTP.USER,
        password: config.FTP.PASS,
        secure: false,
      });

      const stream = Readable.from(file.buffer);
      await client.uploadFrom(stream, renamedFileName);

      await transaction
        .request()
        .input("url", sql.VarChar, renamedFileName)
        .input("recepcion", sql.Int, recepcion)
        .query(readSQL("comprobante/create"));

      await transaction.commit();
      return true;
    } catch (error) {
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error(
            "Error al hacer rollback de la transacción:",
            rollbackError
          );
        }
      }

      throw new Error(
        error instanceof Error
          ? `Error al crear el comprobante: ${error.message}`
          : "Error desconocido al crear el comprobante"
      );
    } finally {
      if (client) {
        try {
          client.close();
        } catch (closeError) {
          console.error("Error al cerrar conexión FTP:", closeError);
        }
      }
    }
  }
}

export default ComprobanteModel;
