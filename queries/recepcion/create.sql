INSERT INTO 
	recepcion (numero_orden, proveedor, sucursal, fecha_recepcion, procesado, confirmacion)
OUTPUT INSERTED.id
VALUES (
	@numero_orden, @proveedor, @sucursal, GETDATE(), 0, @confirmacion
);
