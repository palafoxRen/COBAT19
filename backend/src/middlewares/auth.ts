import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Payload decodificado del JWT — contiene solo lo necesario para identificar
// al usuario en las rutas protegidas. El token se genera en authController.login.
export interface PayloadToken {
  id_usuario: number;
  nombre: string;
  rol: string;
}

// Extiende Request para adjuntar el payload del token decodificado.
// Los controladores lo usan como req.usuario para saber quién hizo la petición.
export interface AuthRequest extends Request {
  usuario?: PayloadToken;
}

// Middleware de autenticación: verifica que el header Authorization contenga
// un JWT válido firmado con JWT_SECRET. Si es válido, decodifica el payload
// y lo adjunta a req.usuario para que los controladores lo consuman.
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Token no proporcionado' });
    return;
  }
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    res.status(500).json({ success: false, message: 'Error de configuración del servidor' });
    return;
  }

  try {
      const decoded = jwt.verify(token, secret) as unknown as PayloadToken
    req.usuario = decoded;  
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};