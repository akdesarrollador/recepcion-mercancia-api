import pool from "../pool";
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
      throw new Error(`No existe una recepción con el ID: ${recepcion}`);
    }

    const productoExists = await this.exists(codigo, recepcion);
    if (productoExists) {
      throw new Error(`El producto con código ${codigo} ya ha sido recibido en la recepción con ID: ${recepcion}`);
    }

    const transaction = new sql.Transaction(pool);
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
      throw new Error(`Error de transacción SQL: ${error}`);
    }
  }

  static async exists(codigo: string, recepcion: number): Promise<boolean> {
    try {
      const result = await pool
        .request()
        .input("codigo", sql.VarChar, codigo)
        .input("recepcion", sql.Int, recepcion)
        .query(readSQL("producto-recibido/exists"));

      return result.recordset.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar la existencia del producto recibido: ${error}`);
    }
  }
}

export default ProductoRecibidoModel;
