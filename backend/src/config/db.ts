import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT) || 5432,
});

pool.on('connect', () => {
    console.log('[database]: Conexión exitosa con PostgreSQL');
});

pool.on('error', (err) => {
    console.error('[database]: Error inesperado en el pool de conexiones', err);
});

export default pool;