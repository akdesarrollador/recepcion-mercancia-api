import pool from "../pool";
import readSQL from "../helpers/readSQL";
import sql from "mssql";
import { OrdenCompra, Productos, Ubicacion } from "../helpers/interfaces/ordencompra.interface";

class OrdenCompraModel {
  static async get(numeroOrden: string, ubicacion: Ubicacion): Promise<OrdenCompra | null> {
    try {
      const result = await pool
        .request()
        .input("cNroped", sql.Char, numeroOrden)
        .query(readSQL("orden-compra/getByNumeroOrden"));

      if (result.recordset.length === 0) {
        throw new Error(`No se encontró la orden de compra con número: ${numeroOrden}`);
      }

      const data = result.recordset[0];
      const productos = await this.getProductsByLocation(numeroOrden, ubicacion);

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
        totalProductos: productos.length,
        productos,
        observacion1: data.cObservacion1,
        observacion2: data.cObservacion2,
        observacion3: data.cObservacion3,
        observacion4: data.cObservacion4,
        operador: data.cOperador,
        fechaCreacion: data.FechaCreacion,
        fechaRE: data.dFechare,
      } as OrdenCompra;
    } catch (error) {
      throw new Error(`Error al obtener la orden de compra: ${error}`);
    }
  }

  static async exists(numeroOrden: string): Promise<boolean> {
    try {
      const result = await pool
        .request()
        .input("cNroped", sql.Char, numeroOrden)
        .query(readSQL("orden-compra/exists"));

      return result.recordset.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar la existencia de la orden de compra: ${error}`);
    }
  }

  static async getProductsByLocation(numeroOrden: string, ubicacion: Ubicacion): Promise<Productos[] | []> {
    try {
      const result = await pool
        .request()
        .input("cNroped", sql.Char, numeroOrden)
        .input("cSucursal", sql.Char, ubicacion)
        .query(readSQL("orden-compra/getProductsByLocation"));

      
      if (result.recordset.length === 0) {
        throw new Error(`No se encontraron productos para la orden de compra: ${numeroOrden} en la ubicación: ${ubicacion}`);
      }

      return result.recordset.map((item: any) => ({
        codigo: item.codigo_producto,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        total_solicitado: item.total_solicitado,
      }) as Productos);
    } catch (error) {
      throw new Error(`Error al obtener los productos por ubicacion y numero de orden: ${error}`);
    }
  }
}

export default OrdenCompraModel;
