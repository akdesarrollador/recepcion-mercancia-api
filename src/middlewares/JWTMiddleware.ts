import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware function to authenticate requests using JWT token.
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
const JWTMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'] || '';

    if(!token) return res.status(401).json({ message: "Token ausente en la petición" });

    const tokenValue = token.split(' ')[1];

    try {
        jwt.verify(tokenValue, process.env.JWT_SECRET as jwt.Secret, (error: any, decodedToken: any) => {
            if(error) return res.status(401).json({ message: "Token inválido o expirado" });
            (req as any).user = decodedToken.userId;
            (req as any).ubicacion = decodedToken.ubicacion;
        });
        return next();
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

export default JWTMiddleware;