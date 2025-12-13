-- =====================================================
-- MIGRATION: Adicionar coluna layout_config nos themes
-- =====================================================
-- Execute no SQL Editor do Supabase

-- Adicionar coluna layout_config se não existir
ALTER TABLE themes 
ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{
  "sections": [
    {"id": "banner_principal", "type": "banner_principal", "label": "Banner Principal", "enabled": true, "order": 1},
    {"id": "banner_categorias", "type": "banner_categorias", "label": "Banner de Categorias", "enabled": true, "order": 2},
    {"id": "produtos", "type": "produtos", "label": "Produtos", "enabled": true, "order": 3},
    {"id": "widgets", "type": "widgets", "label": "Widgets", "enabled": true, "order": 4},
    {"id": "avaliacoes", "type": "avaliacoes", "label": "Avaliações", "enabled": false, "order": 5},
    {"id": "info_loja", "type": "info_loja", "label": "Informações da Loja", "enabled": false, "order": 6}
  ],
  "products_per_row": 6
}'::jsonb;

-- Comentário
COMMENT ON COLUMN themes.layout_config IS 'Configuração do layout: ordem das seções e quantidade de produtos por linha';
