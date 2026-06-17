import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/status', async (req: Request, res: Response) => {
    try {
        const dbTest = await pool.query('SELECT NOW()');
        res.json({
            status: "online",
            message: "Servidor del COBAT 19 operando correctamente",
            database_connected: true,
            timestamp: dbTest.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "El servidor responde pero no hay comunicación con la Base de Datos",
            error: error instanceof Error ? error.message : error
        });
    }
});

app.listen(PORT, () => {
    console.log(`[server]: Servidor corriendo en http://localhost:${PORT}`);
});