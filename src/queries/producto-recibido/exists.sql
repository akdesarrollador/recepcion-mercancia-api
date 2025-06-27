SELECT 
    id 
FROM 
    WEB_PRODUCTO_RECIBIDO
WHERE 
    recepcion = @recepcion 
AND 
    codigo = @codigo