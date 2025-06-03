SELECT 
    id,
    numero_orden,
    proveedor,
    fecha_recepcion,
    fecha_actualizacion 
FROM 
    recepcion 
WHERE 
    numero_orden = @numero_orden