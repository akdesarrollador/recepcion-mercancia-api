SELECT 
	d.cNroped numero_orden,
	d.iddOCompra id_detalle,
	d.nCantidad total_solicitado,
	dd.idddOCompra id_detalle_detalle,
	dd.cSucursal sucursal,
	dd.nCantidad cantidad,
	d.cNroitem codigo_producto,
	d.cDescrip descripcion
FROM 
	INV_ddORDENCOMPRA001 dd
INNER JOIN 
	INV_dORDENCOMPRA001 d
ON 
	d.cNroped  = dd.cNroped
AND 
	d.cNroitem = dd.cNroitem
WHERE 
	d.cNroped = @cNroped
AND
	dd.cSucursal = @cSucursal