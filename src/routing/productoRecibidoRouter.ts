import { Router } from "express";
import validateMiddleware from "../middlewares/validateMiddleware";
import productoRecibidoValidator from "../validators/productoRecibidoValidator";
import ProductoRecibidoController from "../controllers/productoRecibidoController";

const productoRecibidoRouter = Router();
const productoRecibido = new ProductoRecibidoController();

productoRecibidoRouter.post(
  "/",
  productoRecibidoValidator,
  validateMiddleware,
  productoRecibido.create
);

export default productoRecibidoRouter;