-- =====================================================
-- MIGRATION: Criar tabela demo_banners
-- =====================================================
-- Execute no SQL Editor do Supabase

-- Criar tabela demo_banners
CREATE TABLE IF NOT EXISTS demo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  title VARCHAR(255),
  subtitle TEXT,
  image_desktop TEXT NOT NULL,
  image_mobile TEXT,
  button_text VARCHAR(100) DEFAULT 'Ver mais',
  button_link TEXT DEFAULT '#',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca por theme_id
CREATE INDEX IF NOT EXISTS idx_demo_banners_theme_id ON demo_banners(theme_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE demo_banners ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read demo_banners" ON demo_banners
  FOR SELECT USING (true);

-- Política para permitir insert/update/delete para usuários autenticados
CREATE POLICY "Allow authenticated insert demo_banners" ON demo_banners
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update demo_banners" ON demo_banners
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete demo_banners" ON demo_banners
  FOR DELETE USING (true);

-- Comentário
COMMENT ON TABLE demo_banners IS 'Banners de demonstração para preview dos temas';
