import { body } from "express-validator";

const productoRecibidoValidator = [
  body("codigo")
    .exists()
    .notEmpty()
    .withMessage("El código del producto es requerido")
    .isString()
    .withMessage("El código del producto debe ser una cadena de texto")
    .trim()
    .escape(),
  body("descripcion")
    .exists()
    .notEmpty()
    .withMessage("La descripción del producto es requerida")
    .isString()
    .withMessage("La descripción del producto debe ser una cadena de texto")
    .trim()
    .escape(),
  body("cantidad_odc")
    .exists()
    .notEmpty()
    .withMessage("La cantidad de ODC es requerida")
    .isNumeric()
    .withMessage("La cantidad de ODC debe ser un número"),
  body("cantidad_recibida")
    .exists()
    .notEmpty()
    .withMessage("La cantidad de ODC es requerida")
    .isNumeric()
    .withMessage("La cantidad de ODC debe ser un número"),
  body("recepcion")
    .exists()
    .notEmpty()
    .withMessage("El número de orden es requerido")
    .isInt()
    .withMessage("El número de orden debe ser un número entero")
];

export default productoRecibidoValidator;
