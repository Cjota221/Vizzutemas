-- =====================================================
-- Criar bucket de Storage para imagens do tema
-- =====================================================
-- Execute no SQL Editor do Supabase

-- 1. Criar o bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('theme-assets', 'theme-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas para permitir operações públicas no bucket

-- Permitir upload (INSERT)
CREATE POLICY "Allow public uploads to theme-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'theme-assets');

-- Permitir leitura (SELECT)
CREATE POLICY "Allow public reads from theme-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'theme-assets');

-- Permitir atualização (UPDATE)
CREATE POLICY "Allow public updates in theme-assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'theme-assets');

-- Permitir exclusão (DELETE)
CREATE POLICY "Allow public deletes from theme-assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'theme-assets');
