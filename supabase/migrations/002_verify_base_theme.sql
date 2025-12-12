-- =============================================
-- Script de Verificação do Tema Base
-- =============================================
-- Execute este script após rodar 002_base_theme.sql
-- para verificar se tudo foi criado corretamente

-- 1. Verificar se o tema foi criado
SELECT 
  id,
  name,
  slug,
  status,
  price,
  created_at
FROM themes 
WHERE slug = 'tema-base';

-- Deve retornar 1 linha com:
-- name: 'Tema Base'
-- slug: 'tema-base'
-- status: 'published'
-- price: 0.00

-- 2. Verificar se os CSS foram criados
SELECT 
  page_type,
  LENGTH(css_code) as css_size,
  created_at
FROM theme_css 
WHERE theme_id = (SELECT id FROM themes WHERE slug = 'tema-base')
ORDER BY page_type;

-- Deve retornar 3 linhas:
-- cart    | ~10000 caracteres
-- home    | ~8000 caracteres
-- product | ~9000 caracteres

-- 3. Contar total de temas
SELECT 
  COUNT(*) as total_themes,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_themes
FROM themes;

-- 4. Verificar estrutura completa do tema base
SELECT 
  t.id,
  t.name,
  t.slug,
  t.status,
  t.price,
  COUNT(tc.id) as css_pages,
  STRING_AGG(tc.page_type, ', ' ORDER BY tc.page_type) as pages
FROM themes t
LEFT JOIN theme_css tc ON tc.theme_id = t.id
WHERE t.slug = 'tema-base'
GROUP BY t.id, t.name, t.slug, t.status, t.price;

-- Deve retornar:
-- css_pages: 3
-- pages: 'cart, home, product'

-- =============================================
-- Resultado Esperado
-- =============================================
-- ✓ Tema criado com sucesso
-- ✓ 3 arquivos CSS criados (home, product, cart)
-- ✓ Status: published
-- ✓ Pronto para uso!
