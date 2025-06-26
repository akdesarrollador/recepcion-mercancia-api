import { poolaBC } from "../pool";
import readSQL from "../helpers/readSQL";
import sql from "mssql";

class RecepcionODCModel {
  static async create(
    recepcion: number,
    odc: string
  ): Promise<{ success: boolean; id?: number }> {
    const transaction = new sql.Transaction(poolaBC);
    await transaction.begin();

    try {
      const result = await transaction
        .request()
        .input("recepcion", sql.Int, recepcion)
        .input("odc", sql.VarChar, odc)
        .query(readSQL("recepcion-odc/create"));

      await transaction.commit();

      const id = result.recordset?.[0]?.id;
      return { success: true, id };
    } catch (error) {
      await transaction.rollback();
      return Promise.reject(
        new Error(`Error al crear la recepcion ODC: ${error}`)
      );
    }
  }
}

export default RecepcionODCModel;
