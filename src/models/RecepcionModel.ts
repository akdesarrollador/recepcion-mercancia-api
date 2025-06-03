import { Recepcion } from "../schemas/schemas";
import pool from "../pool";
import readSQL from "../helpers/readSQL";
import sql from "mssql";
import OrdenCompraModel from "./OrdenCompraModel";

class RecepcionModel {
  static async create(
    numeroOrden: string,
    proveedor: string
  ): Promise<{ success: boolean; id?: number }> {
    const receptionExists = await this.getByOrderNumber(numeroOrden);
    if (receptionExists) {
      throw new Error(`Ya existe una recepción para la orden de compra número ${numeroOrden}.`);
    }

    const orderExists = await OrdenCompraModel.exists(numeroOrden);
    if (!orderExists) {
      throw new Error(`No existe la orden de compra numero ${numeroOrden}.`);
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const result = await transaction
        .request()
        .input("numero_orden", sql.VarChar, numeroOrden)
        .input("proveedor", sql.NVarChar(150), proveedor)
        .query(readSQL("recepcion/create"));

      await transaction.commit();

      const id = result.recordset?.[0]?.recepcion_id;
      return { success: true, id };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error de transacción SQL: ${error}`);
    }
  }

  static async getByOrderNumber(
    orderNumber: string
  ): Promise<Recepcion | null> {
    try {
      const result = await pool
        .request()
        .input("numero_orden", sql.VarChar, orderNumber)
        .query(readSQL("recepcion/getByOrderNumber"));

      if (result.recordset.length === 0) {
        throw new Error(
          `No se encontró la recepción para la orden de compra número: ${orderNumber}`
        );
      }

      const data = result.recordset[0];

      return {
        id: data.id,
        numero_orden: data.numero_orden,
        proveedor: data.proveedor,
        fecha_recepcion: data.fecha_recepcion,
        fecha_actualizacion: data.fecha_actualizacion,
      };
    } catch (error) {
      throw new Error(`Error al obtener la recepcion por numero de orden: ${error}`);
    }
  }

  static async exists(id: number): Promise<boolean> {
    try {
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(readSQL("recepcion/exists"));

      return result.recordset.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar la existencia de la recepcion: ${error}`);
    }
  }
}

export default RecepcionModel;
