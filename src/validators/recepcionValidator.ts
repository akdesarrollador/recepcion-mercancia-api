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
    .withMessage("El proveedor no puede estar vacío"),
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
];
