import { param } from "express-validator";

export const validateGetOrdenCompra = [
  param("numeroOrden")
    .exists()
    .withMessage("El numero de orden de compra es requerido")
    .isString()
    .withMessage("El numero de orden de compra debe ser una cadena de caracteres")
    .notEmpty()
    .withMessage("El numero de orden de compra no puede estar vacío"),
];
