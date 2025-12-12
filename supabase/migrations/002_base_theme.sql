-- =============================================
-- Migration 002: Tema Base Padrão
-- =============================================
-- Este script insere um tema base que serve como
-- ponto de partida para novos usuários

-- Inserir o tema base
INSERT INTO themes (name, slug, description, price, thumbnail_url, status)
VALUES (
  'Tema Base',
  'tema-base',
  'Tema padrão com design clean e profissional. Ótimo ponto de partida para personalização.',
  0.00,
  '/images/theme-base-preview.jpg',
  'published'
)
ON CONFLICT (slug) DO NOTHING;

-- Obter o ID do tema base para usar nas próximas inserções
DO $$
DECLARE
  theme_base_id UUID;
BEGIN
  -- Busca o ID do tema base
  SELECT id INTO theme_base_id FROM themes WHERE slug = 'tema-base';
  
  -- CSS para a página HOME
  INSERT INTO theme_css (theme_id, page_type, css_code)
  VALUES (
    theme_base_id,
    'home',
    '/* ========================================
   TEMA BASE - HOME PAGE
   ======================================== */

/* Header */
#store-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem 0;
}

#store-logo {
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

#store-menu a {
  color: rgba(255,255,255,0.9);
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

#store-menu a:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.15);
}

/* Banner Principal */
#store-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 0;
}

#store-banner h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

#store-banner p {
  font-size: 1.25rem;
  opacity: 0.95;
}

/* Barra de Categorias */
#store-categories {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

#store-categories a {
  color: #4b5563;
  font-weight: 500;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

#store-categories a:hover {
  color: #667eea;
  background: #f3f4f6;
}

/* Seção de Produtos */
#store-products {
  padding: 3rem 0;
  background: #f9fafb;
}

#store-products h2 {
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

/* Cards de Produto */
.product-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(102,126,234,0.15);
  border-color: #667eea;
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #e5e7eb;
}

.product-card h3 {
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 1rem 1rem 0.5rem;
}

.product-card p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 1rem 1rem;
}

.product-card .price {
  color: #667eea;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 1rem;
}

.product-card button {
  width: calc(100% - 2rem);
  margin: 1rem;
  background: #667eea;
  color: #ffffff;
  font-weight: 600;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-card button:hover {
  background: #5568d3;
  transform: scale(1.02);
}

/* Seção de Avaliações */
#store-reviews {
  background: #ffffff;
  padding: 3rem 0;
}

#store-reviews h2 {
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}

.review-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.review-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.review-stars {
  color: #fbbf24;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.review-card p {
  color: #4b5563;
  font-style: italic;
  margin-bottom: 1rem;
}

.review-card .author {
  color: #667eea;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Informações da Loja */
#store-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  padding: 3rem 0;
  text-align: center;
}

#store-info h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

#store-info p {
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto 1.5rem;
}

#store-info .features {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

#store-info .feature-item {
  background: rgba(255,255,255,0.15);
  padding: 1.5rem;
  border-radius: 12px;
  min-width: 200px;
  transition: all 0.3s ease;
}

#store-info .feature-item:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px);
}

/* Footer */
#store-footer {
  background: #1f2937;
  color: rgba(255,255,255,0.8);
  padding: 2rem 0;
  text-align: center;
}

#store-footer a {
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s ease;
}

#store-footer a:hover {
  color: #8b9dff;
  text-decoration: underline;
}
'
  )
  ON CONFLICT (theme_id, page_type) DO UPDATE
    SET css_code = EXCLUDED.css_code,
        updated_at = NOW();

  -- CSS para a página PRODUCT (Detalhes do Produto)
  INSERT INTO theme_css (theme_id, page_type, css_code)
  VALUES (
    theme_base_id,
    'product',
    '/* ========================================
   TEMA BASE - PRODUCT PAGE
   ======================================== */

/* Header (mesmo da home) */
#store-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem 0;
}

#store-logo {
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

#store-menu a {
  color: rgba(255,255,255,0.9);
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

#store-menu a:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.15);
}

/* Breadcrumb */
.breadcrumb {
  background: #f9fafb;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb a:hover {
  color: #5568d3;
  text-decoration: underline;
}

/* Container do Produto */
.product-detail {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

/* Galeria de Imagens */
.product-gallery {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.product-gallery img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.product-gallery img:hover {
  transform: scale(1.02);
  box-shadow: 0 15px 40px rgba(102,126,234,0.2);
}

/* Informações do Produto */
.product-info {
  padding: 1rem 0;
}

.product-info h1 {
  color: #1f2937;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.product-rating .stars {
  color: #fbbf24;
  font-size: 1.25rem;
}

.product-rating .count {
  color: #6b7280;
  font-size: 0.875rem;
}

.product-price {
  color: #667eea;
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.product-price .old-price {
  color: #9ca3af;
  text-decoration: line-through;
  font-size: 1.5rem;
  font-weight: 400;
  margin-left: 1rem;
}

.product-description {
  color: #4b5563;
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

/* Opções do Produto */
.product-options {
  margin-bottom: 2rem;
}

.product-options label {
  display: block;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.product-options select,
.product-options input[type="number"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.product-options select:focus,
.product-options input[type="number"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

/* Botões de Ação */
.product-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.product-actions button {
  flex: 1;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-actions .btn-primary {
  background: #667eea;
  color: #ffffff;
}

.product-actions .btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102,126,234,0.3);
}

.product-actions .btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
  border: 2px solid #e5e7eb;
}

.product-actions .btn-secondary:hover {
  background: #e5e7eb;
}

/* Características do Produto */
.product-features {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.product-features h3 {
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.product-features ul {
  list-style: none;
  padding: 0;
}

.product-features li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-features li:last-child {
  border-bottom: none;
}

.product-features li:before {
  content: "✓";
  color: #667eea;
  font-weight: 700;
  font-size: 1.25rem;
}

/* Footer (mesmo da home) */
#store-footer {
  background: #1f2937;
  color: rgba(255,255,255,0.8);
  padding: 2rem 0;
  text-align: center;
  margin-top: 4rem;
}

#store-footer a {
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s ease;
}

#store-footer a:hover {
  color: #8b9dff;
  text-decoration: underline;
}

/* Responsivo */
@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .product-info h1 {
    font-size: 2rem;
  }
  
  .product-price {
    font-size: 2rem;
  }
  
  .product-actions {
    flex-direction: column;
  }
}
'
  )
  ON CONFLICT (theme_id, page_type) DO UPDATE
    SET css_code = EXCLUDED.css_code,
        updated_at = NOW();

  -- CSS para a página CART (Carrinho de Compras)
  INSERT INTO theme_css (theme_id, page_type, css_code)
  VALUES (
    theme_base_id,
    'cart',
    '/* ========================================
   TEMA BASE - CART PAGE
   ======================================== */

/* Header (mesmo da home) */
#store-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem 0;
}

#store-logo {
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

#store-menu a {
  color: rgba(255,255,255,0.9);
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

#store-menu a:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.15);
}

/* Container do Carrinho */
.cart-container {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
}

.cart-container h1 {
  color: #1f2937;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
}

/* Layout do Carrinho */
.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Itens do Carrinho */
.cart-items {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item:hover {
  background: #f9fafb;
  border-radius: 8px;
}

.cart-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.cart-item-info h3 {
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.cart-item-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.cart-item-price {
  color: #667eea;
  font-size: 1.25rem;
  font-weight: 700;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.cart-item-quantity button {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
}

.cart-item-quantity button:hover {
  background: #667eea;
  color: #ffffff;
  border-color: #667eea;
}

.cart-item-quantity input {
  width: 60px;
  text-align: center;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-weight: 600;
}

.cart-item-actions {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
}

.cart-item-total {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 800;
}

.cart-item-remove {
  background: #fee;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cart-item-remove:hover {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

/* Resumo do Carrinho */
.cart-summary {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.cart-summary h2 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.cart-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  color: #4b5563;
}

.cart-summary-row.total {
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 800;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 2px solid #f3f4f6;
}

.cart-summary-row.total .value {
  color: #667eea;
  font-size: 1.75rem;
}

.cart-summary .discount {
  background: #dcfce7;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
  font-weight: 600;
}

.cart-summary button {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.cart-summary button:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102,126,234,0.3);
}

.cart-summary .continue-shopping {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  margin-top: 0.5rem;
}

.cart-summary .continue-shopping:hover {
  background: #f3f4f6;
  transform: none;
  box-shadow: none;
}

/* Cupom de Desconto */
.cart-coupon {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.cart-coupon h3 {
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.cart-coupon-input {
  display: flex;
  gap: 0.5rem;
}

.cart-coupon-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.cart-coupon-input input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

.cart-coupon-input button {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cart-coupon-input button:hover {
  background: #5568d3;
}

/* Carrinho Vazio */
.cart-empty {
  text-align: center;
  padding: 4rem 2rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.cart-empty h2 {
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cart-empty p {
  color: #6b7280;
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

.cart-empty button {
  padding: 1rem 2rem;
  background: #667eea;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cart-empty button:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102,126,234,0.3);
}

/* Footer (mesmo da home) */
#store-footer {
  background: #1f2937;
  color: rgba(255,255,255,0.8);
  padding: 2rem 0;
  text-align: center;
  margin-top: 4rem;
}

#store-footer a {
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s ease;
}

#store-footer a:hover {
  color: #8b9dff;
  text-decoration: underline;
}

/* Responsivo */
@media (max-width: 968px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: relative;
    top: 0;
  }
}

@media (max-width: 640px) {
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }
  
  .cart-item-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f3f4f6;
  }
  
  .cart-container h1 {
    font-size: 2rem;
  }
}
'
  )
  ON CONFLICT (theme_id, page_type) DO UPDATE
    SET css_code = EXCLUDED.css_code,
        updated_at = NOW();

END $$;

-- Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE 'Tema Base criado com sucesso!';
  RAISE NOTICE 'Slug: tema-base';
  RAISE NOTICE 'Status: published';
  RAISE NOTICE 'CSS criado para: home, product, cart';
END $$;
