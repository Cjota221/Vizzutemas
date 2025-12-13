-- =====================================================
-- MIGRATION: Corrigir RLS de theme_widgets
-- =====================================================
-- Execute no SQL Editor do Supabase
-- Permite leitura pública de todos os widgets (não só ativos)

-- Dropar políticas existentes
DROP POLICY IF EXISTS "Widgets ativos são visíveis para todos" ON theme_widgets;
DROP POLICY IF EXISTS "Admin pode fazer tudo em theme_widgets" ON theme_widgets;
DROP POLICY IF EXISTS "Allow all on theme_widgets" ON theme_widgets;
DROP POLICY IF EXISTS "Allow public read theme_widgets" ON theme_widgets;
DROP POLICY IF EXISTS "Allow authenticated all theme_widgets" ON theme_widgets;

-- Habilitar RLS
ALTER TABLE theme_widgets ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de TODOS os widgets
CREATE POLICY "Allow public read theme_widgets" ON theme_widgets
  FOR SELECT USING (true);

-- Política para permitir insert/update/delete
CREATE POLICY "Allow authenticated all theme_widgets" ON theme_widgets
  FOR ALL USING (true) WITH CHECK (true);

-- Comentário
COMMENT ON TABLE theme_widgets IS 'Widgets HTML personalizados para os temas';
