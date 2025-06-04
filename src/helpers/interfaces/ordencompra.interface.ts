export interface OrdenCompra {
  id: number;
  numeroOrden: string;
  proveedor: Proveedor;
  fechaPedido: Date;
  anulada: boolean;
  diasVen: number;
  observacion1: string;
  observacion2: string;
  observacion3: string;
  observacion4: string;
  operador: string;
  fechaCreacion: Date;
  fechaRE: Date;
}

export interface Proveedor {
  codigo: string;
  nombre: string;
  direccion: string;
  rif: string;
}

export interface Producto {
  codigo: string,
  descripcion: string;
  cantidad: number;
  total_solicitado?: number;
}

export type Ubicacion =
  | "AK01"
  | "AK02"
  | "AK03"
  | "AK04"
  | "AK05"
  | "AK06"
  | "AK07"
  | "FC01"
  | "FC02"
  | "FC03"
  | "FC04"
  | "FC05"
  | "FC06"
  | "FC07"
  | "HC01"
  ;
