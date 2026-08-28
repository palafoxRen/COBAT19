import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import libroRoutes from './routes/libroRoutes';
import ejemplarRoutes from './routes/ejemplarRoutes';
import prestamoRoutes from './routes/prestamoRoutes';
import digitalRoutes from './routes/digitalRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import reporteRoutes from './routes/reporteRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

// Si JWT_SECRET no está definido, el servidor no puede firmar tokens.
// En serverless (Vercel) no podemos matar el proceso; lanzamos un error claro.
if (!process.env.JWT_SECRET) {
  throw new Error('[FATAL] JWT_SECRET no definido en el archivo .env');
}

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Confía en headers X-Forwarded-* cuando corre detrás de un proxy/reverse proxy.
app.set('trust proxy', 1);

// Helmet: agrega headers de seguridad HTTP.
app.use(helmet());

// CORS: solo permite peticiones desde los orígenes configurados en .env.
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiter para login: máximo 10 intentos por ventana de 15 minutos por IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos, intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

// Límite de 1MB para bodies JSON. Los archivos ya no pasan por el backend:
// se suben directo a Supabase Storage desde el frontend.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Ruta de estado
app.get('/api/status', async (_req: Request, res: Response) => {
  try {
    const dbTest = await pool.query('SELECT NOW()');
    res.json({
      status: "online",
      message: "Servidor del COBAT 19 operando correctamente",
      database_connected: true,
      timestamp: dbTest.rows[0].now
    });
  } catch (error) {
    console.error('Error en /api/status:', error);
    res.status(500).json({
      status: "error",
      message: "El servidor responde pero no hay comunicación con la Base de Datos",
    });
  }
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/libros', libroRoutes);
app.use('/api/ejemplares', ejemplarRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api/digitales', digitalRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Middleware de manejo de error
app.use(errorHandler);

// En serverless (Vercel) solo se exporta la app; el listener se activa
// únicamente cuando este archivo se ejecuta directamente (desarrollo local).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[server]: Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;