import express from 'express';
import helmet from 'helmet';
import http from 'http';
import indexRouter from './routing/indexRouter';
import corsMiddleware from './middlewares/corsMiddleware';
import morgan from 'morgan';

const app = express();
app.use(morgan('dev'));

const server = http.createServer(app);

app.use(helmet())
app.use(express.json());
app.use(corsMiddleware);
app.use('/', indexRouter);

export { app, server }