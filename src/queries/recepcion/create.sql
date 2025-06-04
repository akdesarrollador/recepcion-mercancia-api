INSERT INTO 
	recepcion (numero_orden, proveedor, fecha_recepcion, fecha_actualizacion)
OUTPUT INSERTED.id
VALUES (
	@numero_orden, @proveedor, GETDATE(), GETDATE()
);
