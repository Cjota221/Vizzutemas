import PlatformMockLayout from '@/components/platform/PlatformMockLayout'

/**
 * Página /preview-base
 * 
 * Renderiza a carcaça completa da loja para preview de temas.
 * Use esta página para visualizar como os temas CSS afetam o layout.
 * 
 * COMO USAR:
 * 1. Acesse /preview-base para ver o layout base (sem tema)
 * 2. Adicione ?tema=slug para carregar CSS de um tema específico (futuro)
 * 
 * INTEGRAÇÃO FUTURA:
 * - Carregar CSS do tema via query param ou route param
 * - Buscar CSS do Supabase
 * - Aplicar diferentes CSS por tipo de página
 */
export default function PreviewBasePage() {
  /**
   * CSS DO TEMA
   * 
   * Substitua esta string pelo CSS vindo do banco de dados.
   * Por enquanto, contém estilos base para demonstração.
   * 
   * DICA: Use as classes documentadas nos componentes:
   * - .navbar-top, .desktop-top, .menu-section (Header)
   * - .selo-div (StoreInfo)
   * - .categoria-item, .categoria-circulo (CategoriesBar)
   * - .fz-produto, .btn-comprar (ProductsSection)
   * - .avaliacao-card (ReviewsSection)
   * - .footer-section (Footer)
   */
  const cssCode = `
    /* ============================================
       CSS DO TEMA - SERÁ INJETADO AQUI
       Substitua por CSS vindo do banco de dados
       ============================================ */
    
    /* === CORES BASE (exemplo) === */
    :root {
      --tema-primaria: #8B5CF6;
      --tema-secundaria: #10B981;
      --tema-texto: #1F2937;
      --tema-fundo: #F9FAFB;
    }

    /* === NAVBAR TOP === */
    .navbar-top {
      background: var(--tema-primaria);
      color: white;
      padding: 8px 0;
      font-size: 14px;
    }
    .navbar-top a {
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      margin: 0 8px;
    }
    .navbar-top a:hover {
      color: white;
    }

    /* === DESKTOP TOP (Logo/Busca) === */
    .desktop-top {
      background: white;
      border-bottom: 1px solid #eee;
    }
    .btn-search {
      background: var(--tema-primaria);
      color: white;
      border: none;
    }
    .btn-search:hover {
      background: var(--tema-secundaria);
    }
    .action-link {
      color: var(--tema-texto);
      text-decoration: none;
    }
    .cart-badge {
      background: var(--tema-secundaria);
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 12px;
      margin-left: 4px;
    }

    /* === MENU === */
    .menu-section {
      background: var(--tema-fundo);
      border-bottom: 1px solid #e5e7eb;
    }
    .nav-menu {
      padding: 0;
    }
    .nav-item .nav-link {
      color: var(--tema-texto);
      padding: 12px 16px;
      font-weight: 500;
      text-decoration: none;
    }
    .nav-item .nav-link:hover {
      color: var(--tema-primaria);
    }

    /* === CATEGORIAS === */
    .categories-section {
      background: white;
    }
    .categoria-item {
      color: var(--tema-texto);
    }
    .categoria-circulo {
      border: 2px solid var(--tema-primaria);
      border-radius: 50%;
      padding: 4px;
    }

    /* === SELOS / INFO === */
    .store-info-section {
      background: var(--tema-fundo);
    }
    .selo-div {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .selo-icon {
      color: var(--tema-primaria);
    }

    /* === PRODUTOS === */
    .products-section {
      background: white;
    }
    .section-title {
      color: var(--tema-texto);
      font-weight: 700;
    }
    .fz-produto {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }
    .fz-produto:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-comprar {
      background: var(--tema-primaria) !important;
      border: none !important;
    }
    .btn-comprar:hover {
      background: var(--tema-secundaria) !important;
    }

    /* === AVALIAÇÕES === */
    .reviews-section {
      background: var(--tema-secundaria) !important;
    }
    .avaliacao-card {
      border: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* === FOOTER === */
    .footer-section {
      background: #1F2937 !important;
    }
    .footer-title {
      color: var(--tema-primaria);
    }
    .footer-links a:hover {
      color: var(--tema-primaria) !important;
    }

    /* === BOTÃO FIXO === */
    .btn-finalizar-pedido-fixo {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
  `

  return (
    <PlatformMockLayout 
      themeCss={cssCode}
      pageTitle="Preview Base - Vizzutemas"
    >
      {/* 
        Conteúdo adicional pode ser passado aqui.
        Por exemplo, uma página de produto específica ou carrinho.
      */}
    </PlatformMockLayout>
  )
}
