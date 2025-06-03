import { Router } from "express";
import RecepcionController from "../controllers/recepcionController";
import { validateCreateRecepcion } from "../validators/recepcionValidator";
import validateMiddleware from "../middlewares/validateMiddleware";

const recepcionRouter = Router();
const recepcion = new RecepcionController();

recepcionRouter.post(
  "/",
  validateCreateRecepcion,
  validateMiddleware,
  recepcion.create
);

export default recepcionRouter;