import sql from 'mssql';

const configAK = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_AK,
    server: process.env.DB_HOST || '',
    port: Number(process.env.DB_PORT),
    dialect: 'mssql',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: true,
        connectTimeout: 30000,
        requestTimeout: 30000,
    },
    pool: {
        max: 25,
        min: 0,
        idleTimeoutMillis: 30000,
    },
}

const configaBC = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_aBC,
    server: process.env.DB_HOST || '',
    port: Number(process.env.DB_PORT),
    dialect: 'mssql',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: true,
        connectTimeout: 30000,
        requestTimeout: 30000,
    },
    pool: {
        max: 25,
        min: 0,
        idleTimeoutMillis: 30000,
    },
}

export const poolaBC = new sql.ConnectionPool(configaBC);
export const poolAK = new sql.ConnectionPool(configAK);