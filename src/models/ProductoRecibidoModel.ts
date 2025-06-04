import { poolAK } from "../pool";
import readSQL from "../helpers/readSQL";
import sql from "mssql";
import RecepcionModel from "./RecepcionModel";

class ProductoRecibidoModel {
  static async create(
    codigo: string,
    descripcion: string,
    cantidad_odc: number,
    cantidad_recibida: number,
    receptor: number,
    recepcion: number
  ): Promise<boolean> {
    const recepcionExists = await RecepcionModel.exists(recepcion);
    if (!recepcionExists) {
      return Promise.reject(
        new Error(`No existe una recepción con el ID: ${recepcion}`)
      );
    }

    if (cantidad_recibida > cantidad_odc) {
      return Promise.reject(
        new Error("La cantidad recibida no puede ser mayor a la cantidad de la orden.")
      );
    }

    const transaction = new sql.Transaction(poolAK);
    await transaction.begin();

    try {
      await transaction
        .request()
        .input("codigo", sql.VarChar, codigo)
        .input("descripcion", sql.VarChar, descripcion)
        .input("cantidad_odc", sql.Numeric, cantidad_odc)
        .input("cantidad_recibida", sql.Numeric, cantidad_recibida)
        .input("receptor", sql.Int, receptor)
        .input("recepcion", sql.Int, recepcion)
        .query(readSQL("producto-recibido/create"));

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      return Promise.reject(
        new Error(`${error}`)
      );
    }
  }

  static async exists(codigo: string, recepcion: number): Promise<boolean> {
    try {
      const result = await poolAK
        .request()
        .input("codigo", sql.VarChar, codigo)
        .input("recepcion", sql.Int, recepcion)
        .query(readSQL("producto-recibido/exists"));

      return result.recordset.length > 0;
    } catch (error) {
      return Promise.reject(
        new Error(`Error al verificar la existencia del producto recibido: ${error}`)
      );
    }
  }
}

export default ProductoRecibidoModel;
