-- Eliminar tabla si existe (para reinicios de desarrollo)
DROP TABLE IF EXISTS products;

-- Crear tabla products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices sugeridos
CREATE INDEX idx_products_name ON products (name);
CREATE INDEX idx_products_quantity ON products (quantity);
