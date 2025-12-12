-- =====================================================
-- MIGRATION 004: Demo Products (VERSÃO SIMPLES)
-- =====================================================
-- Se der erro de foreign key, execute primeiro a 001_initial.sql
-- para criar a tabela themes

-- PARTE 1: Criar tabela demo_products (sem foreign key)
CREATE TABLE IF NOT EXISTS demo_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT NOT NULL,
  category VARCHAR(100),
  badge VARCHAR(50),
  installments INT DEFAULT 12,
  variations JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PARTE 2: Criar tabela product_templates
CREATE TABLE IF NOT EXISTS product_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche VARCHAR(100) NOT NULL,
  niche_label VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT NOT NULL,
  category VARCHAR(100),
  badge VARCHAR(50),
  installments INT DEFAULT 12,
  variations JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PARTE 3: Índices
CREATE INDEX IF NOT EXISTS idx_demo_products_theme ON demo_products(theme_id);
CREATE INDEX IF NOT EXISTS idx_demo_products_category ON demo_products(category);

-- PARTE 4: Produtos template de exemplo (Calçados Femininos)
INSERT INTO product_templates (niche, niche_label, name, price, image_url, category, badge, installments, variations) VALUES
('calcados_femininos', 'Calçados Femininos', 'Rasteirinha Feminina Strass Rose', 25.00, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'Rasteiras', 'destaque', 12, '[{"size": "33/34", "sku": "RST001.1", "available": true}, {"size": "35/36", "sku": "RST001.2", "available": true}, {"size": "37/38", "sku": "RST001.3", "available": true}]'),
('calcados_femininos', 'Calçados Femininos', 'Sandália Rasteira Dourada Luxo', 37.00, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'Rasteiras', 'destaque', 12, '[{"size": "35/36", "sku": "RST002.1", "available": true}, {"size": "37/38", "sku": "RST002.2", "available": true}]'),
('calcados_femininos', 'Calçados Femininos', 'Tamanco Salto Bloco Nude', 45.00, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'Tamancos', NULL, 12, '[{"size": "35", "sku": "TAM001.1", "available": true}, {"size": "36", "sku": "TAM001.2", "available": true}]'),
('calcados_femininos', 'Calçados Femininos', 'Scarpin Preto Clássico', 89.90, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'Scarpins', 'novo', 12, '[{"size": "35", "sku": "SCP001.1", "available": true}, {"size": "36", "sku": "SCP001.2", "available": true}]'),
('calcados_femininos', 'Calçados Femininos', 'Tênis Casual Branco', 65.00, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'Tênis', NULL, 12, '[{"size": "35", "sku": "TEN001.1", "available": true}, {"size": "36", "sku": "TEN001.2", "available": true}]'),
('calcados_femininos', 'Calçados Femininos', 'Chinelo Slide Rosa', 22.00, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'Chinelos', 'promocao', 12, '[{"size": "35/36", "sku": "CHI001.1", "available": true}, {"size": "37/38", "sku": "CHI001.2", "available": true}]');

-- Produtos template (Eletrônicos)
INSERT INTO product_templates (niche, niche_label, name, price, original_price, image_url, category, badge, installments, variations) VALUES
('eletronicos', 'Eletrônicos', 'Fone Bluetooth TWS Pro', 89.90, 149.90, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', 'Fones', 'promocao', 12, '[{"size": "Único", "sku": "FON001", "available": true}]'),
('eletronicos', 'Eletrônicos', 'Smartwatch Fitness Band', 129.90, NULL, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'Relógios', 'destaque', 12, '[{"size": "Único", "sku": "SWT001", "available": true}]'),
('eletronicos', 'Eletrônicos', 'Carregador Portátil 10000mAh', 49.90, NULL, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', 'Acessórios', NULL, 12, '[{"size": "Único", "sku": "PWB001", "available": true}]'),
('eletronicos', 'Eletrônicos', 'Caixa de Som Bluetooth', 79.90, NULL, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 'Som', 'novo', 12, '[{"size": "Único", "sku": "CXS001", "available": true}]');

-- Produtos template (Moda Feminina)
INSERT INTO product_templates (niche, niche_label, name, price, original_price, image_url, category, badge, installments, variations) VALUES
('moda_feminina', 'Moda Feminina', 'Vestido Midi Floral', 89.90, NULL, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 'Vestidos', 'destaque', 12, '[{"size": "P", "sku": "VES001.P", "available": true}, {"size": "M", "sku": "VES001.M", "available": true}, {"size": "G", "sku": "VES001.G", "available": true}]'),
('moda_feminina', 'Moda Feminina', 'Blusa Cropped Básica', 35.00, NULL, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 'Blusas', NULL, 12, '[{"size": "P", "sku": "BLU001.P", "available": true}, {"size": "M", "sku": "BLU001.M", "available": true}]'),
('moda_feminina', 'Moda Feminina', 'Calça Jeans Skinny', 79.90, 99.90, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', 'Calças', 'promocao', 12, '[{"size": "36", "sku": "CAL001.36", "available": true}, {"size": "38", "sku": "CAL001.38", "available": true}, {"size": "40", "sku": "CAL001.40", "available": true}]');

-- Produtos template (Infantil)
INSERT INTO product_templates (niche, niche_label, name, price, image_url, category, badge, installments, variations) VALUES
('infantil', 'Infantil', 'Conjunto Bebê Algodão', 45.00, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 'Bebê', 'destaque', 12, '[{"size": "P", "sku": "BEB001.P", "available": true}, {"size": "M", "sku": "BEB001.M", "available": true}]'),
('infantil', 'Infantil', 'Tênis Infantil LED', 65.00, 'https://images.unsplash.com/photo-1555708982-8645ec9ce3cc?w=400', 'Calçados', 'novo', 12, '[{"size": "25", "sku": "TIN001.25", "available": true}, {"size": "26", "sku": "TIN001.26", "available": true}, {"size": "27", "sku": "TIN001.27", "available": true}]'),
('infantil', 'Infantil', 'Vestido Princesa Rosa', 59.90, 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400', 'Vestidos', NULL, 12, '[{"size": "2", "sku": "VIN001.2", "available": true}, {"size": "4", "sku": "VIN001.4", "available": true}]');
