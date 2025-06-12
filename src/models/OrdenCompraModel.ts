import { poolaBC } from "../pool";
import readSQL from "../helpers/readSQL";
import sql from "mssql";
import {
  OrdenCompra,
  Producto,
  Ubicacion,
} from "../helpers/interfaces/ordencompra.interface";
import ProductoRecibidoModel from "./ProductoRecibidoModel";
import getShortDescription from "../helpers/getShortDescription";

class OrdenCompraModel {
  static async get(numeroOrden: string): Promise<OrdenCompra | null> {
    try {
      const result = await poolaBC
        .request()
        .input("cNroped", sql.Char, numeroOrden)
        .query(readSQL("orden-compra/getByNumeroOrden"));

      if (result.recordset.length === 0) return null;

      const data = result.recordset[0];
      return {
        id: data.idOCompra,
        numeroOrden: data.cNroped,
        proveedor: {
          codigo: data.cCodigoProveedor,
          nombre: data.cNombreProveedor,
          direccion: data.cDireccion,
          rif: data.cRif,
        },
        fechaPedido: data.dFechape,
        anulada: data.IAnulada,
        diasVen: data.nDiasven,
        observacion1: data.cObservacion1,
        observacion2: data.cObservacion2,
        observacion3: data.cObservacion3,
        observacion4: data.cObservacion4,
        operador: data.cOperador,
        fechaCreacion: data.FechaCreacion,
        fechaRE: data.dFechare,
      } as OrdenCompra;
    } catch (error: any) {
      return Promise.reject(new Error(`${error}`));
    }
  }

  static async exists(numeroOrden: string): Promise<boolean> {
    try {
      const result = await poolaBC
        .request()
        .input("cNroped", sql.Char, numeroOrden)
        .query(readSQL("orden-compra/exists"));

      return result.recordset.length > 0;
    } catch (error) {
      return Promise.reject(
        new Error(
          `Error al verificar la existencia de la orden de compra: ${error}`
        )
      );
    }
  }

  static async getProductsByLocation(
    numeroOrden: string,
    ubicacion: Ubicacion
  ): Promise<Producto[]> {
    try {
      const result = await poolaBC
        .request()
        .input("cNroped", sql.Char, numeroOrden)
        .input("cSucursal", sql.Char, ubicacion)
        .query(readSQL("orden-compra/getProductsByLocation"));

      if (result.recordset.length === 0) return [];

      const productos = await Promise.all(
        result.recordset.map(async (item: any) => {
          const recibidoResult =
            await ProductoRecibidoModel.getUnitsReceivedByProduct(
              item.codigo_producto,
              numeroOrden
            );
          return {
            codigo: item.codigo_producto,
            descripcion: getShortDescription(item.descripcion),
            solicitado_odc: item.total_solicitado || 0,
            solicitado_tienda: item.cantidad,
            recibido: recibidoResult.recibido,
            unidades_por_bulto: recibidoResult.unidades_por_bulto,
          } as Producto;
        })
      );

      return productos;
    } catch (error) {
      return Promise.reject(
        new Error(
          `Error al obtener los productos por ubicacion y numero de orden: ${error}`
        )
      );
    }
  }
}

export default OrdenCompraModel;
