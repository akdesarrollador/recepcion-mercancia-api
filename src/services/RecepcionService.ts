// src/services/RecepcionService.ts
import sql from "mssql";
import { poolaBC } from "../pool";
import RecepcionModel from "../models/RecepcionModel";
import readSQL from "../helpers/readSQL";

export interface NewReception {
  proveedor: string;
  codigoProveedor: string;
  sucursal: string;
  duracion: string;
  ordenes: string[];
  productos: {
    codigo: string;
    descripcion: string;
    unidades_odc: number;
    unidades: number;
    unidades_por_bulto: number;
  }[];
  receptor: number;
}

export class RecepcionService {
  static async createFullReception(data: NewReception): Promise<{ id: number; confirmacion: string }> {
    const transaction = new sql.Transaction(poolaBC);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      // 1) Inserta la cabecera de recepción
      const confirmacion = RecepcionModel.generateUniqueConfirmationNumber();
      const req0 = new sql.Request(transaction);
      const result0 = await req0
        .input("proveedor", sql.VarChar, data.proveedor)
        .input("sucursal", sql.VarChar, data.sucursal)
        .input("cCodigoProveedor", sql.VarChar, data.codigoProveedor)
        .input("confirmacion", sql.VarChar, confirmacion)
        .input("duracion", sql.VarChar, data.duracion)
        .query(readSQL("recepcion/create"));

      const recepcionID = result0.recordset?.[0]?.id;
      if (!recepcionID) throw new Error("No se obtuvo ID de la nueva recepción");

      // 2) Inserta las ODCs
      for (const odc of data.ordenes) {
        const req1 = new sql.Request(transaction);
        await req1
          .input("recepcion", sql.Int, recepcionID)
          .input("odc", sql.VarChar, odc)
          .query(readSQL("recepcion-odc/create"));
      }

      // 3) Inserta los productos recibidos
      for (const p of data.productos) {
        // validación antes de DB
        if (p.unidades > p.unidades_odc) {
          throw new Error(`Producto ${p.codigo}: recibido (${p.unidades}) > orden (${p.unidades_odc})`);
        }

        const req2 = new sql.Request(transaction);
        await req2
          .input("codigo", sql.VarChar, p.codigo)
          .input("descripcion", sql.VarChar, p.descripcion)
          .input("cantidad_odc", sql.Numeric, p.unidades_odc)
          .input("recibido", sql.Numeric, p.unidades)
          .input("unidades_por_bulto", sql.Numeric, p.unidades_por_bulto)
          .input("receptor", sql.Int, data.receptor)
          .input("recepcion", sql.Int, recepcionID)
          .query(readSQL("producto-recibido/create"));
      }

      await transaction.commit();
      return { id: recepcionID, confirmacion };
    } catch (err: any) {
      await transaction.rollback();
      // lanzamos de nuevo para que el controller capture y decida el código HTTP
      throw new Error(`Error en createFullReception: ${err.message}`);
    }
  }
}
