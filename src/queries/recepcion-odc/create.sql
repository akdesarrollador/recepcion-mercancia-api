INSERT INTO
    WEB_RECEPCION_ODC (recepcion, odc)
OUTPUT INSERTED.id
VALUES (@recepcion, @odc);