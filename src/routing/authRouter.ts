import { Router } from "express";
import { validateLogin } from "../validators/authValidator";
import validateMiddleware from "../middlewares/validateMiddleware";
import AuthController from "../controllers/authController";

const authRouter = Router();
const auth = new AuthController();

authRouter.post(
  "/login",
    validateLogin,
    validateMiddleware,
    auth.login
);


export default authRouter;