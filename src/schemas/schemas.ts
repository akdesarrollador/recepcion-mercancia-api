import { z } from "zod";

export const RecepcionSchema = z.object({
  id: z.number().int().nonnegative(),
  numero_orden: z.number().int().max(20).nonnegative(),
  proveedor: z.string().max(150),
  sucursal: z.string().max(10),
  fecha_recepcion: z.string().datetime(),
  procesado: z.boolean(),
  confirmacion: z.string().max(20),
});

export type Recepcion = z.infer<typeof RecepcionSchema>;
