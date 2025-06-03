import express from 'express';
import helmet from 'helmet';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import indexRouter from './routing/indexRouter';
import corsMiddleware from './middlewares/corsMiddleware';
import morgan from 'morgan';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);

app.use(helmet())
app.use(morgan('dev'));
app.use(express.json());
app.use(corsMiddleware);
app.use('/static', express.static(path.join(__dirname, '../facturas-recepcion')))
app.use('/', indexRouter);

export { app, server }