-- =============================================
-- Migration 004: Paleta de Cores e Produtos Demo
-- =============================================

-- =====================
-- 1. PALETA DE CORES NO TEMA
-- =====================

-- Adicionar coluna de configuração de cores no tema
ALTER TABLE themes ADD COLUMN IF NOT EXISTS color_config JSONB DEFAULT '{
  "page_background": "#ffffff",
  "page_background_details": "#f8f9fa",
  "page_background_mode": "light",
  "header_background": "#fffafc",
  "header_buttons": "#fdfaff",
  "header_background_color": "#ffffff",
  "primary_button": "#5d187d",
  "secondary_buttons": "#dc2eda",
  "general_details": "#dc2eda",
  "catalog_banner_background": "#dc2eda",
  "menu_desktop_background": "#ffffff",
  "submenu_desktop_background": "#dc2eda",
  "menu_mobile_background": "#dc2eda",
  "footer_background": "#f8f9fa"
}'::jsonb;

-- =====================
-- 2. TABELA DE PRODUTOS DEMO
-- =====================

CREATE TABLE IF NOT EXISTS demo_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2), -- preço anterior (para mostrar desconto)
  category VARCHAR(100) NOT NULL, -- 'calcados', 'eletronicos', 'infantil', 'moda', 'acessorios', 'casa'
  image_url TEXT NOT NULL,
  images JSONB, -- array de imagens adicionais
  badge VARCHAR(50), -- 'novo', 'promocao', 'mais_vendido'
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_demo_products_category ON demo_products(category);
CREATE INDEX IF NOT EXISTS idx_demo_products_active ON demo_products(is_active);
CREATE INDEX IF NOT EXISTS idx_demo_products_order ON demo_products(display_order);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_demo_products_updated ON demo_products;
CREATE TRIGGER trigger_demo_products_updated
  BEFORE UPDATE ON demo_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE demo_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Produtos demo são visíveis para todos" ON demo_products;
CREATE POLICY "Produtos demo são visíveis para todos"
  ON demo_products FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admin pode fazer tudo em demo_products" ON demo_products;
CREATE POLICY "Admin pode fazer tudo em demo_products"
  ON demo_products FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================
-- 3. INSERIR PRODUTOS DE DEMONSTRAÇÃO
-- =====================

INSERT INTO demo_products (name, slug, description, price, original_price, category, image_url, badge, display_order) VALUES
-- CALÇADOS
('Tênis Runner Pro', 'tenis-runner-pro', 'Tênis esportivo para corrida com amortecimento', 299.90, 399.90, 'calcados', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop', 'promocao', 1),
('Sandália Verão', 'sandalia-verao', 'Sandália confortável para o dia a dia', 89.90, NULL, 'calcados', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&h=500&fit=crop', NULL, 2),
('Sapato Social Classic', 'sapato-social-classic', 'Sapato social em couro legítimo', 249.90, NULL, 'calcados', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500&h=500&fit=crop', 'novo', 3),
('Bota Adventure', 'bota-adventure', 'Bota resistente para trilhas', 349.90, 449.90, 'calcados', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&h=500&fit=crop', NULL, 4),

-- ELETRÔNICOS
('Fone Bluetooth Premium', 'fone-bluetooth-premium', 'Fone sem fio com cancelamento de ruído', 199.90, 299.90, 'eletronicos', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', 'mais_vendido', 1),
('Smartwatch Fit', 'smartwatch-fit', 'Relógio inteligente com monitor cardíaco', 449.90, NULL, 'eletronicos', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop', 'novo', 2),
('Carregador Portátil 20000mAh', 'carregador-portatil', 'Power bank de alta capacidade', 129.90, 159.90, 'eletronicos', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop', NULL, 3),
('Caixa de Som Bluetooth', 'caixa-som-bluetooth', 'Som potente e resistente à água', 179.90, NULL, 'eletronicos', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop', 'promocao', 4),

-- INFANTIL
('Kit Roupinha Bebê', 'kit-roupinha-bebe', 'Conjunto de body e calça 100% algodão', 79.90, NULL, 'infantil', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&h=500&fit=crop', NULL, 1),
('Brinquedo Educativo', 'brinquedo-educativo', 'Blocos de montar coloridos', 59.90, 79.90, 'infantil', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500&h=500&fit=crop', 'mais_vendido', 2),
('Mochila Escolar Infantil', 'mochila-escolar-infantil', 'Mochila com estampa divertida', 119.90, NULL, 'infantil', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop', 'novo', 3),
('Pelúcia Fofa', 'pelucia-fofa', 'Urso de pelúcia macio 40cm', 89.90, 99.90, 'infantil', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop', NULL, 4),

-- MODA
('Camiseta Básica Premium', 'camiseta-basica-premium', 'Camiseta 100% algodão pima', 69.90, NULL, 'moda', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop', NULL, 1),
('Calça Jeans Skinny', 'calca-jeans-skinny', 'Jeans com elastano para conforto', 149.90, 199.90, 'moda', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop', 'promocao', 2),
('Vestido Floral', 'vestido-floral', 'Vestido midi estampado', 129.90, NULL, 'moda', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=500&fit=crop', 'novo', 3),
('Jaqueta Couro Sintético', 'jaqueta-couro-sintetico', 'Jaqueta estilosa e quentinha', 199.90, 279.90, 'moda', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop', NULL, 4),

-- ACESSÓRIOS
('Bolsa Tote Feminina', 'bolsa-tote-feminina', 'Bolsa espaçosa para o dia a dia', 159.90, NULL, 'acessorios', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop', 'mais_vendido', 1),
('Óculos de Sol Aviador', 'oculos-sol-aviador', 'Proteção UV400 estilo clássico', 89.90, 119.90, 'acessorios', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop', NULL, 2),
('Relógio Analógico Clássico', 'relogio-analogico-classico', 'Relógio elegante com pulseira de couro', 249.90, NULL, 'acessorios', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop', 'novo', 3),
('Carteira Masculina Couro', 'carteira-masculina-couro', 'Carteira slim em couro legítimo', 79.90, 99.90, 'acessorios', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop', NULL, 4),

-- CASA
('Luminária de Mesa LED', 'luminaria-mesa-led', 'Luz ajustável para escritório', 129.90, 159.90, 'casa', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop', NULL, 1),
('Jogo de Toalhas 4 Peças', 'jogo-toalhas-4-pecas', 'Toalhas macias 100% algodão', 99.90, NULL, 'casa', 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500&h=500&fit=crop', 'promocao', 2),
('Vaso Decorativo Minimalista', 'vaso-decorativo-minimalista', 'Vaso cerâmico para plantas', 69.90, NULL, 'casa', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop', 'novo', 3),
('Almofada Decorativa', 'almofada-decorativa', 'Almofada estampada 45x45cm', 49.90, 69.90, 'casa', 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=500&h=500&fit=crop', NULL, 4)

ON CONFLICT (slug) DO NOTHING;

-- =====================
-- 4. TABELA DE BANNERS
-- =====================

CREATE TABLE IF NOT EXISTS theme_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  image_desktop TEXT NOT NULL,
  image_mobile TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_theme_banners_theme ON theme_banners(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_banners_order ON theme_banners(theme_id, display_order);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_theme_banners_updated ON theme_banners;
CREATE TRIGGER trigger_theme_banners_updated
  BEFORE UPDATE ON theme_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE theme_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Banners ativos são visíveis" ON theme_banners;
CREATE POLICY "Banners ativos são visíveis"
  ON theme_banners FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admin pode fazer tudo em theme_banners" ON theme_banners;
CREATE POLICY "Admin pode fazer tudo em theme_banners"
  ON theme_banners FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================
-- 5. MENSAGEM DE CONFIRMAÇÃO
-- =====================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 004 executada com sucesso!';
  RAISE NOTICE '✅ Paleta de cores adicionada ao tema';
  RAISE NOTICE '✅ Produtos demo criados (calçados, eletrônicos, infantil, moda, acessórios, casa)';
  RAISE NOTICE '✅ Tabela de banners criada';
END $$;
