-- =============================================
-- Migration 003: CSS por Página + Widgets
-- =============================================
-- Mudanças:
-- 1. Mantém page_type para organizar CSS por página (home, produto, carrinho, checkout)
-- 2. Cria tabela theme_widgets para gerenciar widgets HTML

-- =====================
-- 1. ATUALIZAR theme_css
-- =====================

-- Garantir que page_type existe e tem os valores corretos
DO $$
BEGIN
  -- Verificar se a coluna page_type existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'theme_css' AND column_name = 'page_type'
  ) THEN
    ALTER TABLE theme_css ADD COLUMN page_type VARCHAR(50) DEFAULT 'home';
  END IF;
END $$;

-- Atualizar constraint para novos valores de page_type
ALTER TABLE theme_css DROP CONSTRAINT IF EXISTS theme_css_page_type_check;
ALTER TABLE theme_css ADD CONSTRAINT theme_css_page_type_check 
  CHECK (page_type IN ('home', 'produto', 'carrinho', 'checkout'));

-- Remover constraint único antigo (se existir)
ALTER TABLE theme_css DROP CONSTRAINT IF EXISTS theme_css_theme_id_page_type_key;
ALTER TABLE theme_css DROP CONSTRAINT IF EXISTS theme_css_theme_id_key;

-- Adicionar constraint único por theme_id + page_type
ALTER TABLE theme_css ADD CONSTRAINT theme_css_theme_id_page_type_key UNIQUE (theme_id, page_type);

-- =====================
-- 2. CRIAR theme_widgets
-- =====================

CREATE TABLE IF NOT EXISTS theme_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  widget_type VARCHAR(100) NOT NULL, -- 'html', 'image_slider', 'product_carousel', etc
  html_content TEXT, -- Código HTML do widget
  config JSONB, -- Configurações específicas (imagens, produtos, etc)
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_theme_widgets_theme ON theme_widgets(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_widgets_order ON theme_widgets(theme_id, display_order);
CREATE INDEX IF NOT EXISTS idx_theme_widgets_active ON theme_widgets(theme_id, is_active);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_theme_widgets_updated ON theme_widgets;
CREATE TRIGGER trigger_theme_widgets_updated
  BEFORE UPDATE ON theme_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================
-- 3. RLS (Row Level Security)
-- =====================

ALTER TABLE theme_widgets ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de leitura para widgets ativos
DROP POLICY IF EXISTS "Widgets ativos são visíveis para todos" ON theme_widgets;
CREATE POLICY "Widgets ativos são visíveis para todos"
  ON theme_widgets FOR SELECT
  USING (
    is_active = TRUE AND 
    EXISTS (
      SELECT 1 FROM themes
      WHERE themes.id = theme_widgets.theme_id
      AND themes.status = 'published'
    )
  );

-- Política de admin
DROP POLICY IF EXISTS "Admin pode fazer tudo em theme_widgets" ON theme_widgets;
CREATE POLICY "Admin pode fazer tudo em theme_widgets"
  ON theme_widgets FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================
-- 4. Mensagem de confirmação
-- =====================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 003 executada com sucesso!';
  RAISE NOTICE '✅ theme_css agora usa CSS global (sem page_type)';
  RAISE NOTICE '✅ Tabela theme_widgets criada';
  RAISE NOTICE '✅ Sistema de widgets pronto para uso!';
END $$;
