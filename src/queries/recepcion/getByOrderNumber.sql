SELECT 
    id,
    numero_orden,
    proveedor,
    fecha_recepcion,
    fecha_actualizacion 
FROM 
    WEB_RECEPCION 
WHERE 
    numero_orden = @numero_orden