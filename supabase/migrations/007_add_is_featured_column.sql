-- =====================================================
-- MIGRATION: Adicionar coluna is_featured na demo_products
-- =====================================================
-- Execute no SQL Editor do Supabase

-- Adicionar coluna is_featured se não existir
ALTER TABLE demo_products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Criar índice para busca por produtos em destaque
CREATE INDEX IF NOT EXISTS idx_demo_products_featured 
ON demo_products(is_featured);

-- Comentário
COMMENT ON COLUMN demo_products.is_featured IS 'Indica se o produto aparece em destaque na home';
