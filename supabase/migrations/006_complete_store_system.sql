-- =====================================================
-- MIGRATION: Sistema Completo de Configuração da Loja Demo
-- =====================================================

-- =====================================================
-- 1. CONFIGURAÇÕES DA LOJA (store_config)
-- =====================================================
-- Armazena todas as configurações textuais e visuais da loja demo

CREATE TABLE IF NOT EXISTS store_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  
  -- Identidade da Loja
  store_name VARCHAR(255) DEFAULT 'Minha Loja',
  store_logo TEXT, -- URL do logo
  store_favicon TEXT, -- URL do favicon
  
  -- Contato
  whatsapp VARCHAR(20) DEFAULT '',
  whatsapp_message TEXT DEFAULT 'Olá! Vi um produto na loja e gostaria de mais informações.',
  email VARCHAR(255) DEFAULT '',
  instagram VARCHAR(100) DEFAULT '',
  facebook VARCHAR(100) DEFAULT '',
  
  -- Textos da Barra Superior
  top_bar_text VARCHAR(255) DEFAULT 'FRETE GRÁTIS ACIMA DE R$ 299',
  top_bar_enabled BOOLEAN DEFAULT true,
  
  -- Textos dos Botões
  btn_buy_text VARCHAR(50) DEFAULT 'COMPRAR',
  btn_add_cart_text VARCHAR(50) DEFAULT 'ADICIONAR',
  btn_checkout_text VARCHAR(50) DEFAULT 'FINALIZAR PEDIDO',
  btn_whatsapp_text VARCHAR(50) DEFAULT 'COMPRAR PELO WHATSAPP',
  
  -- Widget Frete Grátis
  free_shipping_enabled BOOLEAN DEFAULT true,
  free_shipping_value DECIMAL(10,2) DEFAULT 299.00,
  free_shipping_text VARCHAR(255) DEFAULT 'FRETE GRÁTIS acima de R$ 299',
  
  -- Widget Cupom
  coupon_enabled BOOLEAN DEFAULT true,
  coupon_code VARCHAR(50) DEFAULT 'PRIMEIRACOMPRA',
  coupon_discount VARCHAR(50) DEFAULT '10% OFF',
  coupon_text VARCHAR(255) DEFAULT 'na primeira compra',
  
  -- Carrinho
  cart_title VARCHAR(100) DEFAULT 'Meu Carrinho',
  cart_empty_text VARCHAR(255) DEFAULT 'Seu carrinho está vazio',
  
  -- Rodapé
  footer_text TEXT DEFAULT '© 2025 Minha Loja. Todos os direitos reservados.',
  footer_about TEXT DEFAULT 'Loja especializada em produtos de qualidade.',
  
  -- Parcelamento
  installments_max INT DEFAULT 12,
  installments_text VARCHAR(100) DEFAULT 'em até 12x no cartão',
  
  -- SEO
  meta_title VARCHAR(255) DEFAULT '',
  meta_description TEXT DEFAULT '',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(theme_id)
);

-- =====================================================
-- 2. PRODUTOS DE DEMONSTRAÇÃO (demo_products)
-- =====================================================

CREATE TABLE IF NOT EXISTS demo_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  
  -- Info básica
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2), -- preço riscado (promoção)
  
  -- Imagens
  image_url TEXT NOT NULL,
  images JSONB DEFAULT '[]', -- Array de URLs adicionais
  
  -- Categorização
  category VARCHAR(100),
  subcategory VARCHAR(100),
  badge VARCHAR(50), -- "destaque", "promocao", "novo", "mais_vendido"
  
  -- Estoque e Variações
  sku VARCHAR(50),
  stock INT DEFAULT 100,
  variations JSONB DEFAULT '[]', -- [{"type": "Tamanho", "options": ["P", "M", "G"]}]
  
  -- Parcelamento customizado (se diferente do padrão)
  installments INT,
  
  -- Ordenação e status
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Aparece na home
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demo_products_theme ON demo_products(theme_id);
CREATE INDEX IF NOT EXISTS idx_demo_products_category ON demo_products(category);
CREATE INDEX IF NOT EXISTS idx_demo_products_featured ON demo_products(is_featured);

-- =====================================================
-- 3. BANNERS (theme_banners)
-- =====================================================

CREATE TABLE IF NOT EXISTS theme_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  
  -- Imagens responsivas
  image_desktop TEXT NOT NULL,
  image_mobile TEXT,
  
  -- Link e ação
  link_url TEXT,
  link_target VARCHAR(20) DEFAULT '_self', -- _self, _blank
  
  -- Posição (onde aparece)
  position VARCHAR(50) DEFAULT 'home_main', -- home_main, home_secondary, category_top
  
  -- Ordenação e status
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Período de exibição (opcional)
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_theme_banners_theme ON theme_banners(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_banners_position ON theme_banners(position);

-- =====================================================
-- 4. CATEGORIAS (theme_categories)
-- =====================================================

CREATE TABLE IF NOT EXISTS theme_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Hierarquia
  parent_id UUID REFERENCES theme_categories(id) ON DELETE SET NULL,
  
  -- Ordenação e status
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_in_menu BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(theme_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_theme_categories_theme ON theme_categories(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_categories_parent ON theme_categories(parent_id);

-- =====================================================
-- 5. WIDGETS CUSTOMIZÁVEIS (theme_widgets)
-- =====================================================

CREATE TABLE IF NOT EXISTS theme_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  widget_type VARCHAR(50) NOT NULL, -- 'html', 'banner_carousel', 'product_carousel', 'text', 'image', 'video', 'countdown', 'newsletter'
  
  -- Posição na página
  page VARCHAR(50) DEFAULT 'home', -- home, product, cart, all
  position VARCHAR(50) DEFAULT 'content', -- top_bar, header, content, sidebar, footer
  
  -- Conteúdo
  content TEXT, -- HTML ou texto
  config JSONB DEFAULT '{}', -- Configurações específicas do widget
  
  -- Estilo inline (opcional)
  custom_css TEXT,
  
  -- Ordenação e status
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_theme_widgets_theme ON theme_widgets(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_widgets_page ON theme_widgets(page);

-- =====================================================
-- 6. SEÇÕES DA HOME (home_sections)
-- =====================================================
-- Define quais seções aparecem na home e em qual ordem

CREATE TABLE IF NOT EXISTS home_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  
  section_type VARCHAR(50) NOT NULL, -- 'banner', 'products_featured', 'products_new', 'products_sale', 'categories', 'newsletter', 'reviews', 'custom_html'
  
  -- Configuração
  title VARCHAR(255),
  subtitle VARCHAR(255),
  config JSONB DEFAULT '{}', -- Configurações específicas (ex: quantos produtos mostrar)
  
  -- Ordenação e status
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_sections_theme ON home_sections(theme_id);

-- =====================================================
-- 7. AVALIAÇÕES/REVIEWS (theme_reviews)
-- =====================================================

CREATE TABLE IF NOT EXISTS theme_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES demo_products(id) ON DELETE CASCADE,
  
  customer_name VARCHAR(100) NOT NULL,
  customer_avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_theme_reviews_theme ON theme_reviews(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_reviews_product ON theme_reviews(product_id);

-- =====================================================
-- 8. TRIGGERS PARA UPDATED_AT
-- =====================================================

DROP TRIGGER IF EXISTS trigger_store_config_updated ON store_config;
CREATE TRIGGER trigger_store_config_updated
  BEFORE UPDATE ON store_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_demo_products_updated ON demo_products;
CREATE TRIGGER trigger_demo_products_updated
  BEFORE UPDATE ON demo_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_theme_banners_updated ON theme_banners;
CREATE TRIGGER trigger_theme_banners_updated
  BEFORE UPDATE ON theme_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_theme_categories_updated ON theme_categories;
CREATE TRIGGER trigger_theme_categories_updated
  BEFORE UPDATE ON theme_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_theme_widgets_updated ON theme_widgets;
CREATE TRIGGER trigger_theme_widgets_updated
  BEFORE UPDATE ON theme_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_home_sections_updated ON home_sections;
CREATE TRIGGER trigger_home_sections_updated
  BEFORE UPDATE ON home_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 9. RLS POLICIES
-- =====================================================

ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (ajuste conforme necessário)
CREATE POLICY "Allow all on store_config" ON store_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on demo_products" ON demo_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on theme_banners" ON theme_banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on theme_categories" ON theme_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on theme_widgets" ON theme_widgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on home_sections" ON home_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on theme_reviews" ON theme_reviews FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 10. DADOS INICIAIS DE EXEMPLO
-- =====================================================

-- Inserir seções padrão da home para novos temas (via trigger ou manualmente)
-- Isso será feito automaticamente quando criar um tema novo
