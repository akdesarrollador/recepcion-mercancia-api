SELECT 
    odc.idOCompra,
    odc.cNroped,
    odc.cCodigoProveedor,
    odc.cNombreProveedor,
    odc.cDireccion,
    odc.cRif,
    odc.dFechape,
    odc.lAnulada,
    odc.nDiasven,
    odc.cObservacion1,
    odc.cObservacion2,
    odc.cObservacion3,
    odc.cObservacion4,
    odc.cOperador,
    odc.FechaCreacion,
    odc.dFechare
FROM 
    INV_ORDENCOMPRA001 odc
WHERE 
    cNroped = @cNroped