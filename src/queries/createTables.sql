CREATE TABLE recepcion (
	id int IDENTITY(1,1) NOT NULL,
	numero_orden varchar(13) COLLATE Modern_Spanish_CI_AS NOT NULL,
	proveedor varchar(150) COLLATE Modern_Spanish_CI_AS NOT NULL,
	fecha_recepcion datetime NOT NULL,
	fecha_actualizacion datetime NOT NULL,
	CONSTRAINT PK__recepcio__3213E83FF559B5F2 PRIMARY KEY (id)
);

CREATE TABLE producto_recibido (
	id int IDENTITY(1,1) NOT NULL,
	codigo varchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	descripcion varchar(250) COLLATE Modern_Spanish_CI_AS NOT NULL,
	cantidad_odc decimal(18,0) NOT NULL,
	cantidad_recibida decimal(18,0) NOT NULL,
	receptor int NOT NULL,
	recepcion int NOT NULL,
	CONSTRAINT PK__producto__3213E83FF886C531 PRIMARY KEY (id),
	CONSTRAINT FK_producto_recibido_recepcion FOREIGN KEY (recepcion) REFERENCES recepcion(id)
);

CREATE TABLE comprobante (
	id int IDENTITY(1,1) NOT NULL,
	url varchar(250) COLLATE Modern_Spanish_CI_AS NOT NULL,
	recepcion int NOT NULL,
	CONSTRAINT PK__comproba__3213E83FE5948111 PRIMARY KEY (id),
	CONSTRAINT FK_comprobante_recepcion FOREIGN KEY (recepcion) REFERENCES recepcion(id)
);