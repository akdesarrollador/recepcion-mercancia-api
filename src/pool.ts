import sql from 'mssql';

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
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

const pool = new sql.ConnectionPool(config);

export default pool;