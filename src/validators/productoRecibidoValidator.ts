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
  body("recibido")
    .exists()
    .notEmpty()
    .withMessage("La cantidad recibida es requerida")
    .isNumeric()
    .withMessage("La cantidad recibida debe ser un número"),
  body("unidades_por_bulto")
    .exists()
    .notEmpty()
    .withMessage("Las unidades por bulto son requeridas")
    .isNumeric()
    .withMessage("Las unidades por bulto deben ser un número"),
  body("recepcion")
    .exists()
    .notEmpty()
    .withMessage("El número de recepción es requerido")
    .isInt()
    .withMessage("El número de recepción debe ser un número entero"),
];

export default productoRecibidoValidator;
