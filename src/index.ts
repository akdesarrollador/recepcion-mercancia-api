import config from './config'
import { server } from './app'
import {poolAK, poolaBC } from './pool'

server.listen(config.PORT, async () => {
    console.log(`🚀Recepcion de mercancia API corriendo en el puerto ${config.PORT}`)
    poolAK.connect()
    .then(() => {
        console.log(`Conectado a base de datos AK...`);
    })
    .catch(() => {
        console.error(`Ha ocurrido un error al conectarse a la base de datos AK...`);
    })

    poolaBC.connect()
    .then(() => {
        console.log(`Conectado a base de datos aBC...`);
    })
    .catch(() => {
        console.error(`Ha ocurrido un error al conectarse a la base de datos aBC...`);
    });
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
    poolAK.close()
    .then(() => {
        console.log('Pool de conexiones cerrado...');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error al cerrar el pool de conexiones:', err);
        process.exit(1);
    });

    poolaBC.close()
    .then(() => {
        console.log('Pool de conexiones aBC cerrado...');
        process.exit(0);
    })  
    .catch((err) => {
        console.error('Error al cerrar el pool de conexiones aBC:', err);
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM');
    poolAK.close()
    .then(() => {
        console.log('Pool de conexiones cerrado...');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error al cerrar el pool de conexiones:', err);
        process.exit(1);
    });

    poolaBC.close()
    .then(() => {
        console.log('Pool de conexiones aBC cerrado...');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error al cerrar el pool de conexiones aBC:', err);
        process.exit(1);
    });
});