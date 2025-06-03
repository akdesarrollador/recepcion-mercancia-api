import { Router } from "express";
import validateMiddleware from "../middlewares/validateMiddleware";
import { validateGetOrdenCompra } from "../validators/ordenCompraValidator";
import OrdenCompraController from "../controllers/ordenCompraController";

const ordenCompraRouter = Router();
const ordenCompra = new OrdenCompraController();

ordenCompraRouter.get(
  "/:numeroOrden",
  validateGetOrdenCompra,
  validateMiddleware,
  ordenCompra.get
);

export default ordenCompraRouter;
