import * as bcrypt from 'bcrypt';
import pool from './config/db';

// Usuarios base del sistema. La contraseña inicial NO va en el código:
// se lee de variables de entorno en el momento de ejecutar `npm run seed`.
interface SeedUser {
  nombre: string;
  correo: string;
  envVar: string;
}

const USUARIOS: SeedUser[] = [
  {
    nombre: 'Bibliotecario matutino',
    correo: 'matutino@cobat19.edu.mx',
    envVar: 'SEED_MATUTINO_PASSWORD',
  },
  {
    nombre: 'Bibliotecario vespertino',
    correo: 'vespertino@cobat19.edu.mx',
    envVar: 'SEED_VESPERTINO_PASSWORD',
  },
];

const main = async () => {
  for (const u of USUARIOS) {
    const contrasena = process.env[u.envVar];

    if (!contrasena) {
      console.warn(`[seed] Falta la variable ${u.envVar} — se omite "${u.nombre}"`);
      continue;
    }
    if (contrasena.length < 8) {
      console.warn(`[seed] ${u.envVar} debe tener al menos 8 caracteres — se omite "${u.nombre}"`);
      continue;
    }

    const existente = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE correo = $1',
      [u.correo]
    );

    if (existente.rows.length > 0) {
      console.log(`[seed] "${u.nombre}" (${u.correo}) ya existe — se omite`);
      continue;
    }

    const hash = await bcrypt.hash(contrasena, 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES ($1, $2, $3, $4)',
      [u.nombre, u.correo, hash, 'Bibliotecario']
    );
    console.log(`[seed] Creado "${u.nombre}" (${u.correo})`);
  }

  await pool.end();
};

main().catch(async (error) => {
  console.error('[seed] Error:', error);
  await pool.end();
  process.exit(1);
});