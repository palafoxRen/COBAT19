import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import libroRoutes from './routes/libroRoutes';
import ejemplarRoutes from './routes/ejemplarRoutes';
import prestamoRoutes from './routes/prestamoRoutes';
import digitalRoutes from './routes/digitalRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import reporteRoutes from './routes/reporteRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

// Si JWT_SECRET no está definido, el servidor no puede firmar tokens.
// Es un failsafe para evitar que arranque en producción con config incompleta.
if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET no definido en el archivo .env');
  process.exit(1);
}

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Helmet: agrega headers de seguridad HTTP (X-Content-Type-Options, CSP, etc.)
app.use(helmet());

// CORS: solo permite peticiones desde los orígenes configurados en .env.
// En desarrollo permite localhost:5173 (Vite default) y localhost:5174.
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiter para login: máximo 10 intentos por ventana de 15 minutos
// por IP. Previene fuerza bruta contra credenciales.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos, intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

// Límite de 1MB para bodies JSON — evita payload payloads gigantes que
// podrían agotar memoria. Las imágenes se manejan por multer por separado.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos: PDFs e imágenes almacenados en uploads/
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Middleware de manejo de error
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server]: Servidor corriendo en http://localhost:${PORT}`);
});