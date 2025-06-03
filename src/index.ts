import config from './config'
import { server } from './app'
import pool from './pool'

server.listen(config.PORT, async () => {
    console.log(`🚀Recepcion de mercancia API corriendo en el puerto ${config.PORT}`)
    pool.connect()
    .then(() => {
        console.log(`Conectado a base de datos...`);
    })
    .catch(() => {
        console.error(`Ha ocurrido un error al conectarse a la base de datos...`);
    })
})

process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('SIGINT');
    pool.close()
    .then(() => {
        console.log('Pool de conexiones cerrado...');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error al cerrar el pool de conexiones:', err);
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM');
    pool.close()
    .then(() => {
        console.log('Pool de conexiones cerrado...');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error al cerrar el pool de conexiones:', err);
        process.exit(1);
    });
});