INSERT INTO
    recepcion_odc (recepcion, odc)
OUTPUT INSERTED.id
VALUES (@recepcion, @odc);