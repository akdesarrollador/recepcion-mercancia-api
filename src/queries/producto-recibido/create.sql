INSERT INTO 
	WEB_PRODUCTO_RECIBIDO (codigo, descripcion, cantidad_odc, recibido, unidades_por_bulto, receptor, recepcion)
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