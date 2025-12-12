-- Vizzutemas - Schema do Banco de Dados
-- Execute este script no SQL Editor do Supabase

-- =====================
-- Tabela: themes
-- =====================
-- Armazena informações dos temas de e-commerce

CREATE TABLE IF NOT EXISTS themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2),
  thumbnail_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscas por slug
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);

-- Index para filtro por status
CREATE INDEX IF NOT EXISTS idx_themes_status ON themes(status);

-- =====================
-- Tabela: theme_css
-- =====================
-- Armazena o CSS de cada tema separado por tipo de página

CREATE TABLE IF NOT EXISTS theme_css (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  page_type VARCHAR(50) NOT NULL CHECK (page_type IN ('home', 'product', 'cart')),
  css_code TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, page_type)
);

-- Index para busca por tema
CREATE INDEX IF NOT EXISTS idx_theme_css_theme ON theme_css(theme_id);

-- =====================
-- Tabela: orders
-- =====================
-- Armazena os pedidos de compra de temas

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca por tema
CREATE INDEX IF NOT EXISTS idx_orders_theme ON orders(theme_id);

-- Index para busca por email
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);

-- Index para filtro por status
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- =====================
-- Função: update_updated_at
-- =====================
-- Atualiza o campo updated_at automaticamente

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_themes_updated ON themes;
CREATE TRIGGER trigger_themes_updated
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_theme_css_updated ON theme_css;
CREATE TRIGGER trigger_theme_css_updated
  BEFORE UPDATE ON theme_css
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated ON orders;
CREATE TRIGGER trigger_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================
-- RLS (Row Level Security)
-- =====================
-- Habilitar RLS para todas as tabelas

ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_css ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Dropar políticas existentes (se houver)
DROP POLICY IF EXISTS "Temas publicados são visíveis para todos" ON themes;
DROP POLICY IF EXISTS "CSS de temas publicados é visível para todos" ON theme_css;
DROP POLICY IF EXISTS "Qualquer um pode criar pedidos" ON orders;
DROP POLICY IF EXISTS "Admin pode fazer tudo em themes" ON themes;
DROP POLICY IF EXISTS "Admin pode fazer tudo em theme_css" ON theme_css;
DROP POLICY IF EXISTS "Admin pode fazer tudo em orders" ON orders;

-- Políticas públicas de leitura para temas publicados
CREATE POLICY "Temas publicados são visíveis para todos"
  ON themes FOR SELECT
  USING (status = 'published');

-- Políticas públicas de leitura para CSS de temas publicados
CREATE POLICY "CSS de temas publicados é visível para todos"
  ON theme_css FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM themes
      WHERE themes.id = theme_css.theme_id
      AND themes.status = 'published'
    )
  );

-- Política para criação de pedidos (qualquer um pode criar)
CREATE POLICY "Qualquer um pode criar pedidos"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Políticas de admin (permite tudo para o service_role)
CREATE POLICY "Admin pode fazer tudo em themes"
  ON themes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin pode fazer tudo em theme_css"
  ON theme_css FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin pode fazer tudo em orders"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================
-- Dados de exemplo (opcional)
-- =====================
-- Descomente para inserir dados de teste

/*
INSERT INTO themes (name, slug, description, price, status) VALUES
  ('Tema Minimalista', 'minimalista', 'Design limpo e moderno com foco no conteúdo', 99.90, 'published'),
  ('Tema Elegante', 'elegante', 'Visual sofisticado com detalhes dourados', 149.90, 'published'),
  ('Tema Vibrante', 'vibrante', 'Cores vivas e elementos dinâmicos', 129.90, 'draft');

-- CSS de exemplo para o tema minimalista
INSERT INTO theme_css (theme_id, page_type, css_code)
SELECT id, 'home', '
  #store-header { background: #ffffff; border-bottom: 1px solid #eee; }
  #store-logo { color: #333; font-weight: 300; }
  #store-banner { background: #f5f5f5; color: #333; }
  .product-card { border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .product-card:hover { transform: translateY(-4px); }
'
FROM themes WHERE slug = 'minimalista';
*/
