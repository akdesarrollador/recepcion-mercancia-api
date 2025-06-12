INSERT INTO 
	producto_recibido (codigo, descripcion, cantidad_odc, recibido, unidades_por_bulto, receptor, recepcion)
VALUES
	(
		@codigo, 
		@descripcion, 
		@cantidad_odc, 
		@recibido,
		@unidades_por_bulto,
		@receptor,
		@recepcion
	);