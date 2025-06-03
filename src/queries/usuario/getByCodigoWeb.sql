SELECT 
    nIDFichaEmpleado,
    nCedula,
    cNombre,
    cApellido,
    cCodigoWeb,
    cCreadoEnTienda
FROM 
    aBC_FichaTrabajadores 
WHERE 
    cCodigoWEB = @cCodigoWEB