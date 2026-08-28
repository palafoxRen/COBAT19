import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Conexión a Supabase PostgreSQL usando el connection pooler transaccional.
// IMPORTANTE: En modo serverless (Vercel Functions) no se pueden mantener
// conexiones persistentes de pool grandes; se usa max:1 para forzar un solo
// cliente por función y se comparte el pool a través de los "warm starts".
const databaseUrl = process.env.SUPABASE_DB_URL;

const pool = new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.DATABASE_MAX) || 1,
    ssl: databaseUrl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
});

// El pooler transaccional de Supabase (PgBouncer) resetea search_path por
// conexión, asi que se fuerza el schema public de forma explicita en cada
// conexión para que las consultas de $1-$2 (sin calificar schema) funcionen.
pool.on('connect', async (client) => {
    try {
        await client.query('SET search_path TO public');
    } catch (err) {
        console.error('[database]: No se pudo fijar search_path', err);
    }
    console.log('[database]: Conexión exitosa con PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
    console.error('[database]: Error inesperado en el pool de conexiones', err);
});

export default pool;
