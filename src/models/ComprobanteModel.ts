import readSQL from "../helpers/readSQL";
import sql from "mssql";
import RecepcionModel from "./RecepcionModel";
import { poolaBC } from "../pool";
import ftp from "basic-ftp";
import config from "../config";
import { Readable } from "stream";

class ComprobanteModel {
  static async create(
    recepcion: number,
    file: Express.Multer.File,
    ubicacion: string,
    numeroOrden: string
  ): Promise<boolean> {
    try {
      const recepcionExists = await RecepcionModel.exists(recepcion);
      if (!recepcionExists) {
        throw new Error(`No existe la recepcion con id ${recepcion}`);
      }

      const originalFileName = file.originalname;
      const client = new ftp.Client();
      client.ftp.verbose = false;

      let formattedName: string;

      try {
        await client.access(config.FTP_CONFIG);

        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);

        formattedName = this.formatFileName(
          originalFileName,
          ubicacion,
          numeroOrden
        );

        await client.uploadFrom(bufferStream, formattedName);
      } catch (error) {
        throw new Error(`Error al subir el archivo: ${error}`);
      } finally {
        client.close();
      }

      const transaction = new sql.Transaction(poolaBC);
      await transaction.begin();
      try {
        await transaction
          .request()
          .input("url", sql.VarChar, formattedName)
          .input("recepcion", sql.Int, recepcion)
          .query(readSQL("comprobante/create"));

        await transaction.commit();
        return true;
      } catch (error) {
        await transaction.rollback();
        throw new Error(
          `Error al crear el comprobante en la base de datos: ${error}`
        );
      }
    } catch (error) {
      throw new Error(`Error al crear el comprobante: ${error}`);
    }
  }

  static formatFileName(
    originalName: string,
    location: string,
    orderNumber: string
  ): string {
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, "");

    // Simple hash using a combination of input and timestamp
    const hashSource = `${originalName}-${location}-${orderNumber}-${date.getTime()}`;
    let hash = 0;
    for (let i = 0; i < hashSource.length; i++) {
      hash = (hash << 5) - hash + hashSource.charCodeAt(i);
      hash |= 0;
    }
    const uniqueId = Math.abs(hash).toString(36).slice(0, 8);

    return `${location}_${orderNumber}_${formattedDate}_${uniqueId}`;
  }
}

export default ComprobanteModel;
