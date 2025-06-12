SELECT 
    id 
FROM 
    producto_recibido
WHERE 
    recepcion = @recepcion 
AND 
    codigo = @codigo