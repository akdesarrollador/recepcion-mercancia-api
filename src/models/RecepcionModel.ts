import { Recepcion } from "../schemas/schemas";
import { poolaBC } from "../pool";
import readSQL from "../helpers/readSQL";
import sql from "mssql";
import OrdenCompraModel from "./OrdenCompraModel";
import generateUniqueHash from "../helpers/generateReceptionConfirmation";

class RecepcionModel {
  static async create(
    numeroOrden: string,
    proveedor: string,
    sucursal: string
  ): Promise<{ success: boolean; id?: number; confirmation?: string }> {
    const reception = await this.getByOrderNumber(numeroOrden);
    const lastModified = reception?.fecha_recepcion;
    const receptionPeriodExpired = lastModified
      ? Date.now() - new Date(lastModified).getTime() > 7 * 24 * 60 * 60 * 1000
      : false;

    if (reception && receptionPeriodExpired) {
      throw new Error(
        `Plazo de recepción expirado para la orden de compra número ${numeroOrden}.`
      );
    }

    const orderExists = await OrdenCompraModel.exists(numeroOrden);
    if (!orderExists) {
      throw new Error(`No existe la orden de compra numero ${numeroOrden}.`);
    }

    const transaction = new sql.Transaction(poolaBC);
    await transaction.begin();

    try {
      const confirmationHash = generateUniqueHash();
      const result = await transaction
        .request()
        .input("numero_orden", sql.VarChar, numeroOrden)
        .input("proveedor", sql.VarChar, proveedor)
        .input("sucursal", sql.VarChar, sucursal)
        .input("confirmacion", sql.VarChar, confirmationHash)
        .query(readSQL("recepcion/create"));

      await transaction.commit();

      const id = result.recordset?.[0]?.id;
      return { success: true, id, confirmation: confirmationHash };
    } catch (error) {
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
        sucursal: data.sucursal,
        fecha_recepcion: data.fecha_recepcion,
        procesado: data.procesado,
        confirmacion: data.confirmacion,
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
}

export default RecepcionModel;
