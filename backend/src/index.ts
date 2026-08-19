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

if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET no definido en el archivo .env');
  process.exit(1);
}

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos, intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

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