-- Agregar columnas imagen_url, sinopsis, autor y categoria_id a la tabla libros_digitales
ALTER TABLE libros_digitales ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE libros_digitales ADD COLUMN IF NOT EXISTS sinopsis TEXT;
ALTER TABLE libros_digitales ADD COLUMN IF NOT EXISTS autor TEXT;
ALTER TABLE libros_digitales ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(categoria_id) ON DELETE SET NULL;
