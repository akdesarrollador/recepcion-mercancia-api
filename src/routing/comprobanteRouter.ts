import { Router } from "express";
import ComprobanteController from "../controllers/comprobanteController";

const comprobanteRouter = Router();
const comprobante = new ComprobanteController();

comprobanteRouter.post("/", comprobante.create);

export default comprobanteRouter;
