import { Router } from "express";
import recepcionRouter from "./recepcionRouter";
import authRouter from "./authRouter";
import ordenCompraRouter from "./ordenCompraRouter";
import comprobanteRouter from "./comprobanteRouter";
import JWTMiddleware from "../middlewares/JWTMiddleware";

const indexRouter = Router();

indexRouter.use("/recepcion", JWTMiddleware, recepcionRouter);
indexRouter.use("/orden-compra", JWTMiddleware, ordenCompraRouter);
indexRouter.use("/comprobante", JWTMiddleware, comprobanteRouter);
indexRouter.use("/auth", authRouter);

export default indexRouter;
