SELECT 
	codigo, 
	SUM(recibido) recibido,
	SUM(unidades_por_bulto) unidades_por_bulto
FROM 
	producto_recibido pr
INNER JOIN 
	recepcion r 
ON
	r.id = pr.recepcion
WHERE
	r.numero_orden = @numero_orden
AND 
	pr.codigo = @codigo_producto
GROUP BY 
	pr.codigo