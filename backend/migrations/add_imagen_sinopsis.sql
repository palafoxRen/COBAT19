-- Agregar columnas imagen_url y sinopsis a la tabla libros
ALTER TABLE libros ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE libros ADD COLUMN IF NOT EXISTS sinopsis TEXT;
