CREATE TABLE dbaBC_Soft_fake.dbo.recepcion (
	id int IDENTITY(1,1) NOT NULL,
	numero_orden varchar(13) COLLATE Modern_Spanish_CI_AS NOT NULL,
	proveedor varchar(150) COLLATE Modern_Spanish_CI_AS NOT NULL,
	sucursal varchar(10) COLLATE Modern_Spanish_CI_AS NOT NULL,
	fecha_recepcion datetime NOT NULL,
	procesado bit DEFAULT 0 NULL,
	confirmacion varchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CONSTRAINT PK__recepcio__3213E83FF559B5F2 PRIMARY KEY (id)
);

CREATE TABLE dbaBC_Soft_fake.dbo.producto_recibido (
	id int IDENTITY(1,1) NOT NULL,
	codigo varchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	descripcion varchar(250) COLLATE Modern_Spanish_CI_AS NOT NULL,
	cantidad_odc decimal(18,0) NOT NULL,
	recibido decimal(18,0) NOT NULL,
	unidades_por_bulto decimal(18,0) DEFAULT 0 NULL,
	receptor int NOT NULL,
	recepcion int NOT NULL,
	CONSTRAINT PK__producto__3213E83FF886C531 PRIMARY KEY (id),
	CONSTRAINT FK_producto_recibido_recepcion FOREIGN KEY (recepcion) REFERENCES dbaBC_Soft_fake.dbo.recepcion(id)
);

CREATE TABLE dbaBC_Soft_fake.dbo.comprobante (
	id int IDENTITY(1,1) NOT NULL,
	url varchar(250) COLLATE Modern_Spanish_CI_AS NOT NULL,
	recepcion int NOT NULL,
	CONSTRAINT PK__comproba__3213E83FE5948111 PRIMARY KEY (id),
	CONSTRAINT FK_comprobante_recepcion FOREIGN KEY (recepcion) REFERENCES dbaBC_Soft_fake.dbo.recepcion(id)
);