INSERT INTO 
	recepcion (proveedor, sucursal, fecha_recepcion, procesado, confirmacion)
OUTPUT INSERTED.id
VALUES (
	@proveedor, @sucursal, GETDATE(), 0, @confirmacion
);
