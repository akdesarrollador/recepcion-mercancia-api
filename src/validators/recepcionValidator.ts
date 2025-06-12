import { body } from "express-validator";

export const validateCreateRecepcion = [
  body("numeroOrden")
    .exists()
    .notEmpty()
    .withMessage("El número de orden es requerido")
    .isString()
    .withMessage("El número de orden debe ser una cadena de texto")
    .trim()
    .escape(),
  body("proveedor")
    .exists()
    .notEmpty()
    .withMessage("El proveedor es requerido")
    .isString()
    .withMessage("El proveedor debe ser una cadena de texto")
    .trim()
    .escape(),
  body("sucursal")
    .exists()
    .notEmpty()
    .withMessage("La sucursal es requerida")
    .isString()
    .withMessage("La sucursal debe ser una cadena de texto")
    .trim()
    .escape(),
];
