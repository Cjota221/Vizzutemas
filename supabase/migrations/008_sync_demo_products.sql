-- =====================================================
-- MIGRATION: Sincronizar tabela demo_products com o código
-- =====================================================
-- Execute no SQL Editor do Supabase

-- Adicionar colunas que podem estar faltando
ALTER TABLE demo_products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE demo_products ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]';
ALTER TABLE demo_products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE demo_products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
ALTER TABLE demo_products ADD COLUMN IF NOT EXISTS sku VARCHAR(50);
ALTER TABLE demo_products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 100;
ALTER TABLE demo_products ADD COLUMN IF NOT EXISTS installments INT;
ALTER TABLE demo_products ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Criar índice para is_featured se não existir
CREATE INDEX IF NOT EXISTS idx_demo_products_featured ON demo_products(is_featured);

-- Garantir que a tabela tenha RLS habilitado e política permissiva
ALTER TABLE demo_products ENABLE ROW LEVEL SECURITY;

-- Remover política existente e criar nova mais permissiva
DROP POLICY IF EXISTS "Allow all on demo_products" ON demo_products;
DROP POLICY IF EXISTS "Admin pode fazer tudo em demo_products" ON demo_products;
DROP POLICY IF EXISTS "Produtos demo são visíveis para todos" ON demo_products;

CREATE POLICY "Public access demo_products" 
ON demo_products FOR ALL 
USING (true) 
WITH CHECK (true);
