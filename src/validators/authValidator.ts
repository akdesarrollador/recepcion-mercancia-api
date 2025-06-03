import { body } from "express-validator";

export const validateLogin = [
  body("password")
    .exists()
    .withMessage("Se require una clave de acceso")
    .isString()
    .withMessage("La contraseña debe ser una cadena de texto")
    .trim()
    .escape(),
];
