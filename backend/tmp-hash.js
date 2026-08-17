require('dotenv').config({ path: 'C:/COBAT_19/backend/.env', quiet: true });
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id_usuario: 1, nombre: 'Prueba', rol: 'Bibliotecario' },
  process.env.JWT_SECRET,
  { expiresIn: '8h' }
);
process.stdout.write(token);
