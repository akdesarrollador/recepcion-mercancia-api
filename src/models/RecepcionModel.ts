import { Recepcion } from "../schemas/schemas";
import { poolaBC } from "../pool";
import readSQL from "../helpers/readSQL";
import sql from "mssql";

class RecepcionModel {
  static async create(
    proveedor: string,
    codigoProveedor: string,
    sucursal: string,
    duracion: string
  ): Promise<{ success: boolean; id?: number; confirmacion?: string }> {
    const transaction = new sql.Transaction(poolaBC);
    await transaction.begin();

    try {
      const confirmacion = this.generateUniqueConfirmationNumber();
      const result = await transaction
        .request()
        .input("proveedor", sql.VarChar, proveedor)
        .input("cCodigoProveedor", sql.VarChar, codigoProveedor)
        .input("sucursal", sql.VarChar, sucursal)
        .input("confirmacion", sql.VarChar, confirmacion)
        .input("duracion", sql.VarChar, duracion)
        .query(readSQL("recepcion/create"));

      await transaction.commit();

      const id = result.recordset?.[0]?.id;
      return { success: true, id, confirmacion };
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      return Promise.reject(new Error(`Error al crear la recepcion: ${error}`));
    }
  }

  static async getByOrderNumber(
    orderNumber: string
  ): Promise<Recepcion | null> {
    try {
      const result = await poolaBC
        .request()
        .input("numero_orden", sql.VarChar, orderNumber)
        .query(readSQL("recepcion/getByOrderNumber"));

      if (result.recordset.length === 0) return null;

      const data = result.recordset[0];

      return {
        id: data.id,
        numero_orden: data.numero_orden,
        proveedor: data.proveedor,
        fecha_recepcion: data.fecha_recepcion,
        fecha_actualizacion: data.fecha_actualizacion,
      };
    } catch (error) {
      return Promise.reject(
        new Error(`Error al obtener la recepcion por numero de orden: ${error}`)
      );
    }
  }

  static async exists(id: number): Promise<boolean> {
    try {
      const result = await poolaBC
        .request()
        .input("id", sql.Int, id)
        .query(readSQL("recepcion/exists"));

      return result.recordset.length > 0;
    } catch (error) {
      return Promise.reject(
        new Error(`Error al verificar la existencia de la recepcion: ${error}`)
      );
    }
  }

  static generateUniqueConfirmationNumber(): string {
    const timestamp = Date.now().toString(32);
    return `REC-${timestamp}`.toUpperCase();
  }
}

export default RecepcionModel;
