import 'dotenv/config';
import dotenv from 'dotenv'

dotenv.config({ path: '../.env'})

const requiredEnvVars = ['DB_USER', 'DB_PASS', 'DB_NAME', 'DB_HOST', 'DB_PORT'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const config = {
    PORT: process.env.PORT || 5080,
    DB: {
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
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
        },
    },
}

export default config