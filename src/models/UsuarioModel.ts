import { poolAK } from "../pool";
import readSQL from "../helpers/readSQL";
import sql from "mssql";
import { Usuario } from "../helpers/interfaces/usuario.interface";

class UsuarioModel {
  static async getByCodigoWeb(codigoWeb: string): Promise<Usuario | null> {
    try {
      const result = await poolAK
        .request()
        .input("cCodigoWEB", sql.VarChar, codigoWeb)
        .query(readSQL("usuario/getByCodigoWeb"));
  
      if (result.recordset.length === 0) return null;
  
      const data = result.recordset[0];
  
      return {
        nIDFichaEmpleado: data.nIDFichaEmpleado,
        nCedula: data.nCedula,
        cNombre: data.cNombre,
        cApellido: data.cApellido,
        cCodigoWeb: data.cCodigoWeb,
        cCreadoEnTienda: data.cCreadoEnTienda,
      };
    } catch (error) {
      throw new Error(`Error al obtener el usuario por código web: ${error}`);
    }
  }
}

export default UsuarioModel;
