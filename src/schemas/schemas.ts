import { z } from 'zod';

export const RecepcionSchema = z.object({
    id: z.number().int().nonnegative(),
    numero_orden: z.number().int().max(20).nonnegative(),
    proveedor: z.string().max(150),
    fecha_recepcion: z.string().datetime(),
    fecha_actualizacion: z.string().datetime(),
})

export type Recepcion = z.infer<typeof RecepcionSchema>;