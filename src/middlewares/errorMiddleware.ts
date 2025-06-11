import { NextFunction, Request, Response } from "express";
import CustomError from "../helpers/customError";
// import { ConnectionError } from "mssql";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err); 
    
    let mensaje = 'Ha ocurrido un error inesperado.'
    let codigo = 500;

    if (err instanceof CustomError) {
        mensaje = err.message;
        codigo = err.statusCode
    }
    
    return res.status(codigo).json({ mensaje, codigo });
};

export default errorHandler;