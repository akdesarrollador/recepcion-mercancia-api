CREATE TABLE WEB_RECEPCION (
	id int IDENTITY(1,1) NOT NULL,
	proveedor varchar(100) COLLATE Modern_Spanish_CI_AS NOT NULL,
	sucursal varchar(5) COLLATE Modern_Spanish_CI_AS NOT NULL,
	fecha_recepcion datetime NOT NULL,
	procesado bit DEFAULT 0 NULL,
	confirmacion varchar(15) COLLATE Modern_Spanish_CI_AS NOT NULL,
	cCodigoProveedor varchar(10) COLLATE Modern_Spanish_CI_AS DEFAULT '' NOT NULL,
	duracion varchar(20) COLLATE Modern_Spanish_CI_AS NULL,
	kardex bit DEFAULT 0 NULL,
	CONSTRAINT PK__recepcio__3213E83FF559B5F2 PRIMARY KEY (id)
);

CREATE TABLE WEB_COMPROBANTE (
	id int IDENTITY(1,1) NOT NULL,
	url varchar(250) COLLATE Modern_Spanish_CI_AS NOT NULL,
	recepcion int NOT NULL,
	CONSTRAINT PK__comproba__3213E83FE5948111 PRIMARY KEY (id),
	CONSTRAINT FK_comprobante_recepcion FOREIGN KEY (recepcion) REFERENCES WEB_RECEPCION(id)
);

CREATE TABLE WEB_PRODUCTO_RECIBIDO (
	id int IDENTITY(1,1) NOT NULL,
	codigo varchar(15) COLLATE Modern_Spanish_CI_AS NOT NULL,
	descripcion varchar(120) COLLATE Modern_Spanish_CI_AS NOT NULL,
	cantidad_odc decimal(18,0) NOT NULL,
	recibido decimal(18,0) NOT NULL,
	unidades_por_bulto decimal(18,0) DEFAULT 0 NULL,
	receptor int NOT NULL,
	recepcion int NOT NULL
	CONSTRAINT PK__producto__3213E83FF886C531 PRIMARY KEY (id),
	CONSTRAINT FK_producto_recibido_recepcion FOREIGN KEY (recepcion) REFERENCES WEB_RECEPCION(id)
);

CREATE TABLE WEB_RECEPCION_ODC (
	id int IDENTITY(1,1) NOT NULL,
	recepcion int NOT NULL,
	odc char(10) COLLATE Modern_Spanish_CI_AS NOT NULL
	CONSTRAINT FK_RECEPCION FOREIGN KEY (recepcion) REFERENCES WEB_RECEPCION(id)
);
