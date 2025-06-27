import { body } from "express-validator";

export const validateCreateRecepcion = [
  body("ordenes")
    .isArray()
    .withMessage("Las órdenes deben ser un arreglo")
    .notEmpty()
    .withMessage("El arreglo de órdenes no puede estar vacío")
    .custom((ordenes) => {
      for (const orden of ordenes) {
        if (typeof orden !== "string" || !orden.trim()) {
          throw new Error("Cada orden debe ser una cadena de texto no vacía");
        }
      }
      return true;
    }),
  body("proveedor")
    .isString()
    .withMessage("El proveedor debe ser una cadena de texto")
    .notEmpty()
    .withMessage("El proveedor no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El proveedor no puede exceder los 100 caracteres"),
  body("codigoProveedor")
    .isString()
    .withMessage("El código del proveedor debe ser una cadena de texto")
    .notEmpty()
    .withMessage("El código del proveedor no puede estar vacío")
    .isLength({ max: 10 })
    .withMessage("El código del proveedor no puede exceder los 10 caracteres"),
  body("productos_recibidos")
    .isArray()
    .withMessage("Los productos recibidos deben ser un arreglo")
    .notEmpty()
    .withMessage("El arreglo de productos recibidos no puede estar vacío")
    .custom((productos) => {
      for (const producto of productos) {
        if (
          !producto.codigo ||
          !producto.descripcion ||
          typeof producto.unidades_odc !== "number" ||
          typeof producto.unidades !== "number" ||
          typeof producto.unidades_por_bulto !== "number"
        ) {
          throw new Error(
            "Cada producto recibido debe tener código, descripción, unidades_odc, unidades y unidades_por_bulto"
          );
        }
      }
      return true;
    }),
  body("duracion")
    .isString()
    .withMessage("La duración debe ser una cadena de texto")
    .notEmpty()
    .withMessage("La duración no puede estar vacía")
    .isLength({ max: 20 })
    .withMessage("La duración no puede exceder los 20 caracteres"),
];
