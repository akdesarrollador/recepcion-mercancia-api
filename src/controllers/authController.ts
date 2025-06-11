import { Request, Response } from 'express'
import UsuarioModel from '../models/UsuarioModel';
import jwt from 'jsonwebtoken';

class AuthController {
    async login(req: Request, res: Response): Promise<void> {
        const { password } = req.body;

        try {
            const user = await UsuarioModel.getByCodigoWeb(password);

            if (!user) {
                console.log('Credenciales inválidas');
                res.status(401).json({ message: 'Credenciales Inválidas' });
                return;
            }

            const token = jwt.sign({ userId: user.nIDFichaEmpleado, ubicacion: user.cCreadoEnTienda}, process.env.JWT_SECRET as jwt.Secret)

            res.status(200).json({ message: 'Acceso autorizado', user, token });
        } catch (error) {
            res.status(500).json({ message: `Error al iniciar sesión: ${error}` });
        }
    }
}

export default AuthController;