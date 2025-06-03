INSERT INTO 
	recepcion (numero_orden, proveedor, fecha_recepcion, fecha_actualizacion)
VALUES (
	@numero_orden, @proveedor, GETDATE(), GETDATE()
);
SELECT SCOPE_IDENTITY() AS recepcion_id;
