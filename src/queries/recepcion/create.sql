INSERT INTO 
	WEB_RECEPCION (proveedor, sucursal, fecha_recepcion, procesado, confirmacion, cCodigoProveedor, duracion)
OUTPUT INSERTED.id
VALUES (
	@proveedor, 
	@sucursal, 
	GETDATE(), 
	0, 
	@confirmacion, 
	@cCodigoProveedor, 
	@duracion
);
