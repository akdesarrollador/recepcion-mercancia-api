INSERT INTO 
	producto_recibido (codigo, descripcion, cantidad_odc, cantidad_recibida, receptor, recepcion)
VALUES
	(
		@codigo, 
		@descripcion, 
		@cantidad_odc, 
		@cantidad_recibida,
		@receptor,
		@recepcion
	);