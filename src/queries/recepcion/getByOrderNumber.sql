SELECT 
    id,
    numero_orden,
    proveedor,
    sucursal,
    fecha_recepcion,
    procesado,
    confirmacion
FROM 
    recepcion 
WHERE 
    numero_orden = @numero_orden