-- Agregar columnas imagen_url y sinopsis a la tabla libros_digitales
ALTER TABLE libros_digitales ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE libros_digitales ADD COLUMN IF NOT EXISTS sinopsis TEXT;
