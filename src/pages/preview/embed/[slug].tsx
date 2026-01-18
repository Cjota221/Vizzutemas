/**
 * 🖼️ EMBED PREVIEW - Versão isolada para iframe
 * 
 * Esta página renderiza APENAS o conteúdo do tema (widgets, produtos, etc.)
 * É carregada dentro de um iframe na página principal de preview,
 * permitindo que as media queries funcionem corretamente.
 */

import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState, useRef, useEffect, useCallback } from 'react'
import { getThemeBySlug, generateBaseCss, getActiveWidgetsByTheme, getCssByPage } from '@/lib/supabase/themes'
import { getProducts, getBanners } from '@/lib/supabase/store'
import { ColorConfig, LayoutConfig, CarouselStyleConfig } from '@/lib/types'
import type { DemoProduct, ThemeBanner } from '@/lib/supabase/store'

// Importar o novo WidgetRenderer com sanitização e Error Boundary
import WidgetRenderer from '@/components/WidgetRenderer'
import type { ThemeWidget } from '@/components/WidgetRenderer'

// ========================================
//  CARROSSEL DE PRODUTOS
// ========================================
function ProductCarousel({ 
  title, 
  products, 
  colors, 
  onAddCart, 
  btnText,
  carouselStyle
}: { 
  title: string
  products: DemoProduct[]
  colors: ColorConfig
  onAddCart: () => void
  btnText: string
  carouselStyle?: CarouselStyleConfig
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const displayProducts = products.length > 0 ? [...products, ...products, ...products] : []

  // Configurações padrão
  const style = carouselStyle || {
    title_alignment: 'center',
    title_font_size: 'lg',
    product_name_size: 'sm',
    price_size: 'md',
    button_style: 'full',
    show_badge: true,
    card_shadow: 'sm'
  }

  // Classes de tamanho de fonte
  const titleSizeClass = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }[style.title_font_size]

  const productNameSizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base'
  }[style.product_name_size]

  const priceSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[style.price_size]

  // Classes de sombra do card
  const shadowClass = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }[style.card_shadow]

  // Alinhamento do título
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }[style.title_alignment]

  useEffect(() => {
    if (scrollRef.current && products.length > 0) {
      const scrollWidth = scrollRef.current.scrollWidth
      scrollRef.current.scrollLeft = scrollWidth / 3
    }
  }, [products])

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth } = scrollRef.current
      const oneThird = scrollWidth / 3
      if (scrollLeft < 50) {
        scrollRef.current.scrollLeft = oneThird + scrollLeft
      }
      if (scrollLeft > oneThird * 2 - 50) {
        scrollRef.current.scrollLeft = oneThird + (scrollLeft - oneThird * 2)
      }
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      })
    }
  }

  if (products.length === 0) return null

  // Estilo do botão baseado na configuração
  const getButtonStyle = () => {
    switch (style.button_style) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${colors.cor_demais_botoes}`,
          color: colors.cor_demais_botoes
        }
      case 'minimal':
        return {
          backgroundColor: 'transparent',
          border: 'none',
          color: colors.cor_demais_botoes,
          textDecoration: 'underline'
        }
      default: // 'full'
        return {
          backgroundColor: colors.cor_demais_botoes,
          color: 'white'
        }
    }
  }

  return (
    <div className="mb-6">
      <div className={`flex items-center ${alignmentClass} px-4 mb-3`}>
        <h2 className={`${titleSizeClass} font-bold`} style={{ color: colors.cor_detalhes_gerais }}>
          {title}
        </h2>
        {style.title_alignment === 'left' && (
          <div className="flex gap-2 ml-auto">
            <button 
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.cor_detalhes_fundo }}
            >
              <svg className="w-4 h-4" fill="none" stroke={colors.cor_detalhes_gerais} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.cor_detalhes_fundo }}
            >
              <svg className="w-4 h-4" fill="none" stroke={colors.cor_detalhes_gerais} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Setas centralizadas para título centralizado */}
      {style.title_alignment === 'center' && (
        <div className="flex justify-center gap-2 mb-3">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.cor_detalhes_fundo }}
          >
            <svg className="w-4 h-4" fill="none" stroke={colors.cor_detalhes_gerais} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.cor_detalhes_fundo }}
          >
            <svg className="w-4 h-4" fill="none" stroke={colors.cor_detalhes_gerais} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
      >
        {displayProducts.map((product, idx) => (
          <div 
            key={`${product.id}-${idx}`} 
            className={`flex-shrink-0 w-40 rounded-xl overflow-hidden ${shadowClass}`}
            style={{ backgroundColor: colors.cor_detalhes_fundo, scrollSnapAlign: 'start' }}
          >
            <div className="relative aspect-square">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              {style.show_badge && product.badge && (
                <span 
                  className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded"
                  style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
                >
                  {product.badge === 'destaque' ? '⭐' : product.badge === 'novo' ? '🆕' : product.badge === 'promocao' ? '🔥' : '🏆'}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className={`${productNameSizeClass} font-medium truncate text-gray-800`}>{product.name}</h3>
              <div className="mt-1">
                {product.original_price ? (
                  <>
                    <span className="text-xs text-gray-400 line-through">
                      R$ {product.original_price.toFixed(2)}
                    </span>
                    <span className={`ml-1 font-bold ${priceSizeClass}`} style={{ color: colors.cor_botao_enviar_pedido }}>
                      R$ {product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className={`font-bold ${priceSizeClass}`} style={{ color: colors.cor_detalhes_gerais }}>
                    R$ {product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <button 
                onClick={onAddCart}
                className="mt-2 w-full py-2 rounded-lg text-xs font-bold transition hover:opacity-90"
                style={getButtonStyle()}
              >
                {btnText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ========================================
// 📄 TIPOS DAS PROPS
// ========================================
interface EmbedPreviewProps {
  theme: {
    id: string
    name: string
    slug: string
  }
  colors: ColorConfig
  layout: LayoutConfig
  injectedCss: string
  widgets: ThemeWidget[]
  products: DemoProduct[]
  banners: ThemeBanner[]
  storeName: string
}

// ========================================
// 🎨 CSS BASE PARA CONTENÇÃO
// ========================================
const BASE_CONTAINMENT_CSS = `
/* Reset básico para contenção */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Impedir overflow horizontal */
html, body {
  overflow-x: hidden !important;
  max-width: 100vw !important;
  margin: 0;
  padding: 0;
  overflow-y: auto !important;
}

/* ========================================
   🛡️ ISOLAMENTO DE WIDGETS
   CRÍTICO: Widgets foram feitos para iframes separados
   Aqui forçamos cada um a ser contido em seu bloco
   ======================================== */

/* ANULAR ESTILOS DOS WIDGETS QUE AFETAM BODY/HTML */
.widget body,
.widget html,
body.widget-body,
html.widget-html {
  overflow: visible !important;
  height: auto !important;
  min-height: auto !important;
}

/* Anular estilos de iframe que os widgets tentam aplicar */
iframe.html-content-iframe,
.fz-html-personalizado {
  all: unset !important;
  display: block !important;
  width: 100% !important;
  height: auto !important;
  position: relative !important;
}

/* Container de widgets em flex column */
.widgets-section {
  display: flex !important;
  flex-direction: column !important;
  gap: 0 !important;
  width: 100% !important;
  position: relative !important;
  z-index: 1 !important;
}

/* Cada seção deve ser um bloco independente */
.section {
  position: relative !important;
  display: block !important;
  width: 100% !important;
  clear: both !important;
}

/* ===========================================
   CADA WIDGET É UM BLOCO ISOLADO
   =========================================== */
.widget {
  position: relative !important;
  isolation: isolate !important;
  contain: layout style paint !important;
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  z-index: 1 !important;
  /* Importante: Widget define seu próprio contexto de posicionamento */
  transform: translateZ(0) !important;
}

/* ===========================================
   FORÇAR ALTURA AUTOMÁTICA EM CONTAINERS
   Widgets usam height:100vh que precisamos anular
   =========================================== */
.widget > div,
.widget > section,
.widget > article {
  position: relative !important;
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

/* Containers com position absolute precisam ser relativos ao widget */
.widget [style*="position: absolute"],
.widget [style*="position:absolute"] {
  /* Mantém absolute mas contido no widget pai */
}

/* Anular position fixed - muito perigoso */
.widget [style*="position: fixed"],
.widget [style*="position:fixed"] {
  position: relative !important;
}

/* ===========================================
   RESETAR Z-INDEX DENTRO DE WIDGETS
   Evita que widgets se sobreponham
   =========================================== */
.widget * {
  z-index: auto !important;
}

/* Exceções para elementos que precisam de z-index DENTRO do widget */
.widget .swiper-button-next,
.widget .swiper-button-prev,
.widget .swiper-pagination,
.widget [class*="nav"],
.widget [class*="arrow"],
.widget [class*="btn"],
.widget button,
.widget .vivaz-video-mute {
  z-index: 10 !important;
}

/* Modals e overlays podem ter z-index alto DENTRO do widget */
.widget [class*="modal"],
.widget [class*="overlay"],
.widget [class*="popup"],
.widget [class*="dropdown"] {
  z-index: 50 !important;
}

/* ===========================================
   TRADUÇÃO DAS CLASSES DE PLATAFORMA
   Os widgets usam classes de Frainer/Nuvemshop
   Aqui traduzimos para nosso sistema
   =========================================== */

/* RESET: Anular regras que assumem que widget é a página inteira */
.widget body,
.widget html {
  height: auto !important;
  overflow: visible !important;
}

/* TRADUÇÃO: Classes de plataforma viram relativas ao widget */
.widget .fz-html-personalizado,
.widget .html-content-iframe,
.widget iframe.html-content-iframe {
  position: relative !important;
  display: block !important;
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 1 !important;
}

/* ===========================================
   CLASSES ESPECÍFICAS DOS WIDGETS VIVAZ
   Cada seção de widget deve ser um bloco contido
   =========================================== */

/* Estrutura genérica: qualquer section vivaz */
.widget [class*="vivaz-"][class*="-section"] {
  position: relative !important;
  display: block !important;
  width: 100% !important;
  height: auto !important;
  overflow: visible !important;
  z-index: 1 !important;
}

/* CATEGORIAS - layout flex para ícones */
.widget .vivaz-cat-section {
  position: relative !important;
  min-height: 80px !important;
  height: auto !important;
  padding: 15px 0 !important;
}

.widget .vivaz-cat-section .vivaz-cat-grid,
.widget .vivaz-cat-section .vivaz-container {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 20px !important;
}

/* BARRA DE VANTAGENS - altura automática, mínima de 60px */
.widget .vivaz-trust-section {
  position: relative !important;
  min-height: 60px !important;
  height: auto !important;
  padding: 10px 0 !important;
  overflow: visible !important;
}

.widget .vivaz-trust-section .vivaz-trust-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 15px !important;
}

/* VIDEO PROVADOR - layout flex responsivo */
.widget .vivaz-single-video-section,
.widget .vivaz-video-section {
  position: relative !important;
  min-height: auto !important;
  height: auto !important;
  padding: 30px 0 !important;
}

.widget .vivaz-single-video-section .vivaz-container,
.widget .vivaz-video-section .vivaz-container {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 30px !important;
  max-width: 1100px !important;
  margin: 0 auto !important;
  padding: 0 20px !important;
}

@media (max-width: 768px) {
  .widget .vivaz-single-video-section .vivaz-container,
  .widget .vivaz-video-section .vivaz-container {
    flex-direction: column !important;
  }
}

/* Vídeo dentro do widget provador */
.widget .vivaz-video-area {
  flex: 0 0 auto !important;
  width: 350px !important;
  max-width: 100% !important;
}

@media (max-width: 768px) {
  .widget .vivaz-video-area {
    width: 100% !important;
    max-width: 300px !important;
  }
}

.widget .vivaz-video-wrapper {
  aspect-ratio: 9/16 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
}

/* Produtos ao lado do vídeo */
.widget .vivaz-products-area {
  flex: 1 !important;
  min-width: 0 !important;
}

/* CARROSSEL DE BANNERS */
.widget .vivaz-banner-section {
  position: relative !important;
  min-height: 200px !important;
  height: auto !important;
}

.widget .vivaz-banner-section .swiper-slide {
  height: 300px !important;
}

@media (min-width: 769px) {
  .widget .vivaz-banner-section .swiper-slide {
    height: 400px !important;
  }
}

/* COMPRE POR TAMANHO */
.widget .vivaz-size-section {
  position: relative !important;
  min-height: auto !important;
  height: auto !important;
  padding: 30px 0 !important;
}

/* FAIXA DE CUPOM/MARQUEE - altura automática */
.widget .vivaz-marquee-section {
  position: relative !important;
  min-height: 40px !important;
  height: auto !important;
  padding: 10px 0 !important;
  overflow: hidden !important;
}

/* CARROSSEL DE VIDEOS/REELS */
.widget .vivaz-reels-section {
  position: relative !important;
  min-height: auto !important;
  height: auto !important;
  padding: 30px 0 !important;
}

/* FEEDBACKS/SOCIAL */
.widget .vivaz-social-section {
  position: relative !important;
  min-height: auto !important;
  height: auto !important;
  padding: 30px 0 !important;
}

/* ===========================================
   ELEMENTOS INTERNOS DOS WIDGETS
   =========================================== */

/* Containers internos */
.widget [class*="vivaz-container"],
.widget [class*="vivaz-"][class*="-container"] {
  position: relative !important;
  width: 100% !important;
  max-width: 1200px !important;
  margin: 0 auto !important;
}

/* Overlays de banner ficam contidos */
.widget .vivaz-banner-overlay {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

/* Elementos de vídeo */
.widget .vivaz-video-element {
  width: 100% !important;
  height: auto !important;
  max-height: 500px !important;
  object-fit: cover !important;
}

/* Widgets devem respeitar container */
.widget {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

.widget * {
  max-width: 100%;
  box-sizing: border-box;
}

/* Imagens e vídeos fluidos */
.widget img,
.widget video,
.widget iframe,
.widget embed,
.widget object {
  max-width: 100% !important;
  height: auto !important;
}

/* Iframes de vídeo com aspect ratio */
.widget iframe[src*="youtube"],
.widget iframe[src*="vimeo"],
.widget iframe[src*="player"] {
  aspect-ratio: 16 / 9;
  width: 100% !important;
}

/* Flex containers responsivos */
.widget [style*="display: flex"],
.widget [style*="display:flex"],
.widget .flex,
.widget .d-flex {
  flex-wrap: wrap !important;
}

/* Grid responsivo - mobile */
@media (max-width: 768px) {
  .widget [style*="grid-template-columns"],
  .widget .grid {
    grid-template-columns: 1fr !important;
  }
  
  /* Flex items no mobile devem ter wrap adequado */
  .widget .vivaz-trust-grid > *,
  .widget .vivaz-cat-grid > * {
    flex: 0 0 auto !important;
  }
  
  /* Vídeo provador empilhado no mobile */
  .widget .vivaz-video-area {
    width: 100% !important;
    max-width: 280px !important;
    margin: 0 auto !important;
  }
  
  .widget .vivaz-products-area {
    width: 100% !important;
  }
}

/* Neutralizar posicionamentos problemáticos */
.widget [style*="position: fixed"] {
  position: relative !important;
}

.widget [style*="position: sticky"] {
  position: relative !important;
}

/* Scrollbar escondida para carrosséis */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Carrosséis populares */
.widget .swiper,
.widget .splide,
.widget .slick-slider,
.widget .carousel,
.widget [class*="carousel"],
.widget [class*="slider"] {
  max-width: 100% !important;
  overflow: hidden !important;
}

/* ===========================================
   AJUSTES FINAIS PARA HARMONIA
   =========================================== */

/* Cards de produto dentro dos widgets */
.widget .vivaz-product-card,
.widget [class*="product-card"] {
  background: white !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
}

/* Texto legível */
.widget h1, .widget h2, .widget h3,
.widget h4, .widget h5, .widget h6 {
  line-height: 1.3 !important;
  margin: 0 0 10px 0 !important;
}

.widget p {
  line-height: 1.5 !important;
  margin: 0 0 10px 0 !important;
}

/* Botões nos widgets */
.widget button,
.widget .btn,
.widget [class*="button"] {
  cursor: pointer !important;
  transition: opacity 0.2s !important;
}

.widget button:hover,
.widget .btn:hover {
  opacity: 0.9 !important;
}

/* ANULAR margin-bottom/top negativos que quebram layout */
.widget [style*="margin-top: -"],
.widget [style*="margin-bottom: -"] {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
`

// ========================================
// 📱 PÁGINA EMBED
// ========================================
export default function EmbedPreviewPage({
  theme,
  colors,
  layout,
  injectedCss,
  widgets,
  products,
  banners,
  storeName,
  logoUrl
}: {
  theme: { id: string; name: string; slug: string }
  colors: ColorConfig
  layout: LayoutConfig
  injectedCss: string
  widgets: ThemeWidget[]
  products: DemoProduct[]
  banners: ThemeBanner[]
  storeName: string
  logoUrl: string | null
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const handleAddCart = useCallback(() => {
    setCartCount(prev => prev + 1)
  }, [])

  // Comunicar altura para o pai
  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage({ type: 'EMBED_HEIGHT', height }, '*')
    }
    
    sendHeight()
    const observer = new ResizeObserver(sendHeight)
    observer.observe(document.body)
    
    return () => observer.disconnect()
  }, [])

  // Obter fontes do layout (ou usar padrão)
  const titleFont = layout.fonts?.title_font || 'Poppins'
  const bodyFont = layout.fonts?.body_font || 'Poppins'
  
  // Gerar URL do Google Fonts
  const fontsToLoad = [...new Set([titleFont, bodyFont])]
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontsToLoad.map(font => 
    `family=${font.replace(/\s+/g, '+')}:wght@400;500;600;700`
  ).join('&')}&display=swap`

  // CSS de variáveis de cores e fontes
  const colorVariablesCss = `
    :root {
      /* Cores do Tema */
      --cor-fundo-pagina: ${colors.cor_fundo_pagina};
      --cor-detalhes-fundo: ${colors.cor_detalhes_fundo};
      --cor-fundo-barra-superior: ${colors.cor_fundo_barra_superior};
      --cor-botoes-cabecalho: ${colors.cor_botoes_cabecalho};
      --cor-fundo-cabecalho: ${colors.cor_fundo_cabecalho};
      --cor-botao-enviar-pedido: ${colors.cor_botao_enviar_pedido};
      --cor-demais-botoes: ${colors.cor_demais_botoes};
      --cor-detalhes-gerais: ${colors.cor_detalhes_gerais};
      --cor-fundo-banner-catalogo: ${colors.cor_fundo_banner_catalogo};
      --cor-fundo-menu-desktop: ${colors.cor_fundo_menu_desktop};
      --cor-fundo-submenu-desktop: ${colors.cor_fundo_submenu_desktop};
      --cor-fundo-menu-mobile: ${colors.cor_fundo_menu_mobile};
      --cor-fundo-rodape: ${colors.cor_fundo_rodape};
      
      /* Aliases semânticos */
      --cor-primaria: ${colors.cor_detalhes_gerais};
      --cor-secundaria: ${colors.cor_demais_botoes};
      --cor-destaque: ${colors.cor_botao_enviar_pedido};
      --cor-fundo: ${colors.cor_fundo_pagina};
      
      /* Fontes do Tema */
      --preview-font-title: '${titleFont}', -apple-system, BlinkMacSystemFont, sans-serif;
      --preview-font-body: '${bodyFont}', -apple-system, BlinkMacSystemFont, sans-serif;
      
      /* Cores para preview.css */
      --preview-color-primary: ${colors.cor_detalhes_gerais};
      --preview-color-secondary: ${colors.cor_demais_botoes};
      --preview-color-accent: ${colors.cor_botao_enviar_pedido};
      --preview-color-background: ${colors.cor_fundo_pagina};
      --preview-color-text: #333333;
    }
    
    /* Aplicar fontes do tema */
    body {
      font-family: var(--preview-font-body);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--preview-font-title);
    }
  `

  return (
    <>
      <Head>
        <title>{`Preview - ${theme.name}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Google Fonts dinâmicas do tema */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
        
        {/* CSS: Variáveis + Contenção + Custom */}
        <style dangerouslySetInnerHTML={{ __html: colorVariablesCss + BASE_CONTAINMENT_CSS + injectedCss }} />
      </Head>

      {/* Conteúdo do Preview */}
      <div style={{ backgroundColor: colors.cor_fundo_pagina, fontFamily: `'${bodyFont}', sans-serif` }} className="min-h-screen">
        
        {/* Barra Superior */}
        <div 
          className="text-center py-2 text-xs font-medium text-white"
          style={{ backgroundColor: colors.cor_fundo_barra_superior }}
        >
          🎁 Frete Grátis acima de R$ 299 | Use o cupom PRIMEIRACOMPRA
        </div>

        {/* Header */}
        <header 
          className="shadow-sm px-4 py-3"
          style={{ backgroundColor: colors.cor_fundo_cabecalho }}
        >
          <div className="flex items-center justify-between">
            {/* Menu Hamburger */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="w-5 h-0.5 rounded" style={{ backgroundColor: colors.cor_botoes_cabecalho }}></span>
              <span className="w-5 h-0.5 rounded" style={{ backgroundColor: colors.cor_botoes_cabecalho }}></span>
              <span className="w-5 h-0.5 rounded" style={{ backgroundColor: colors.cor_botoes_cabecalho }}></span>
            </button>

            {/* Logo */}
            <div className="flex-1 flex justify-center">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={storeName || 'Logo da Loja'} 
                  className="h-10 max-h-10 w-auto object-contain"
                />
              ) : (
                <div className="text-xl font-bold" style={{ color: colors.cor_botoes_cabecalho }}>
                  {storeName || 'Minha Loja'}
                </div>
              )}
            </div>

            {/* Ícones */}
            <div className="flex items-center gap-3">
              <button className="p-2">
                <svg className="w-5 h-5" style={{ color: colors.cor_botoes_cabecalho }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 relative">
                <svg className="w-5 h-5" style={{ color: colors.cor_botoes_cabecalho }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 text-xs text-white rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Menu Mobile Drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
            <div 
              className="relative w-72 h-full shadow-xl"
              style={{ backgroundColor: colors.cor_fundo_menu_mobile || colors.cor_fundo_cabecalho }}
            >
              <div className="p-4 border-b border-gray-200">
                <button onClick={() => setMenuOpen(false)} className="text-2xl">✕</button>
              </div>
              <nav className="p-4">
                {['Início', 'Produtos', 'Categorias', 'Promoções', 'Contato'].map(item => (
                  <a 
                    key={item} 
                    href="#" 
                    className="block py-3 text-gray-700 hover:text-gray-900 border-b border-gray-100"
                    style={{ color: colors.cor_botoes_cabecalho }}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Seções do Layout - Ordenadas e Filtradas */}
        {layout.sections
          .filter(s => s.enabled)
          .sort((a, b) => a.order - b.order)
          .map((section, index) => {
            // Debug: mostra informações da seção
            if (section.type === 'widgets') {
              const widgetIds = (section as any).widget_ids
              console.log(`[SECTION ${index}] type=${section.type}, label="${section.label}", widget_ids=${JSON.stringify(widgetIds)}`)
            }
            return (
            <div key={`${section.id}-${section.order}`} className="section">
              
              {/* Banner Principal */}
              {section.type === 'banner_principal' && banners.length > 0 && (
                <div className="relative">
                  <img 
                    src={banners[0]?.image_desktop || '/placeholder-banner.jpg'} 
                    alt="Banner" 
                    className="w-full object-cover"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              )}

              {/* Widgets - renderiza apenas os widgets específicos da seção */}
              {section.type === 'widgets' && (
                <div className="widgets-section">
                  {(() => {
                    // Se a seção tem widget_ids específicos, renderiza apenas esses
                    const sectionWidgetIds = (section as any).widget_ids as string[] | undefined
                    
                    if (sectionWidgetIds && sectionWidgetIds.length > 0) {
                      // Renderiza apenas os widgets específicos desta seção
                      return sectionWidgetIds
                        .map(widgetId => widgets.find(w => w.id === widgetId))
                        .filter((w): w is ThemeWidget => w !== undefined && w.is_active)
                        .map(widget => (
                          <WidgetRenderer key={widget.id} widget={widget} colors={colors} fonts={layout.fonts} />
                        ))
                    } else {
                      // Busca por nome na label da seção (mais flexível)
                      const sectionLabel = section.label || ''
                      
                      // Remove prefixos comuns
                      const widgetName = sectionLabel
                        .replace(/^Widgets?:?\s*/i, '')
                        .replace(/^Widget HTML:?\s*/i, '')
                        .trim()
                      
                      if (widgetName) {
                        // Busca flexível: contém o nome (case insensitive)
                        const matchingWidget = widgets.find(w => {
                          const wName = w.name.toLowerCase().trim()
                          const searchName = widgetName.toLowerCase().trim()
                          return (wName === searchName || 
                                  wName.includes(searchName) || 
                                  searchName.includes(wName)) && 
                                 w.is_active
                        })
                        
                        if (matchingWidget) {
                          return <WidgetRenderer key={matchingWidget.id} widget={matchingWidget} colors={colors} fonts={layout.fonts} />
                        }
                      }
                      
                      // Se não encontrou nada, não renderiza (evita duplicação)
                      console.warn(`[WIDGETS] Seção "${sectionLabel}" não encontrou widget correspondente`)
                      return null
                    }
                  })()}
                </div>
              )}

              {/* Carrossel Customizado de Produtos */}
              {section.type === 'carousel_custom' && (
                <div className="py-6">
                  {(() => {
                    const productIds = (section as any).product_ids as string[] | undefined
                    const carouselProducts = productIds 
                      ? productIds.map(id => products.find(p => p.id === id)).filter((p): p is DemoProduct => p !== undefined)
                      : products.slice(0, 8)
                    
                    if (carouselProducts.length === 0) return null
                    
                    return (
                      <ProductCarousel
                        title={section.label || 'Produtos'}
                        products={carouselProducts}
                        colors={colors}
                        onAddCart={handleAddCart}
                        btnText="Comprar"
                        carouselStyle={layout.carousel_style}
                      />
                    )
                  })()}
                </div>
              )}

              {/* Produtos (seção padrão) */}
              {section.type === 'produtos' && products.length > 0 && (
                <div className="py-6">
                  <ProductCarousel
                    title="🔥 Mais Vendidos"
                    products={products.slice(0, 10)}
                    colors={colors}
                    onAddCart={handleAddCart}
                    btnText="Comprar"
                    carouselStyle={layout.carousel_style}
                  />
                  {products.length > 10 && (
                    <ProductCarousel
                      title="✨ Novidades"
                      products={products.slice(10, 20)}
                      colors={colors}
                      onAddCart={handleAddCart}
                      btnText="Ver produto"
                      carouselStyle={layout.carousel_style}
                    />
                  )}
                </div>
              )}

              {/* Banner de Categorias */}
              {section.type === 'banner_categorias' && (
                <div className="py-6 px-4">
                  <h2 className="text-lg font-bold mb-4" style={{ color: colors.cor_detalhes_gerais }}>
                    Categorias
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Roupas', 'Calçados', 'Acessórios', 'Eletrônicos', 'Casa', 'Beleza'].map(cat => (
                      <div 
                        key={cat}
                        className="p-4 rounded-lg text-center font-medium cursor-pointer hover:opacity-80 transition"
                        style={{ backgroundColor: colors.cor_detalhes_fundo, color: colors.cor_detalhes_gerais }}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )})
        }

        {/* Footer */}
        <footer 
          className="mt-8 py-8 px-4"
          style={{ backgroundColor: colors.cor_fundo_rodape }}
        >
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              {storeName || 'Minha Loja'}
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Sua loja online favorita
            </p>
            <div className="flex justify-center gap-4 mb-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                <span>📱</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                <span>📸</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                <span>💬</span>
              </a>
            </div>
            <p className="text-xs text-gray-400">
              © 2025 {storeName || 'Minha Loja'}. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

// ========================================
// 📡 SERVER SIDE PROPS
// ========================================
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string
  
  try {
    // Buscar tema
    const theme = await getThemeBySlug(slug)
    if (!theme) {
      return { notFound: true }
    }

    // Buscar dados em paralelo - passando theme.id
    const [widgets, products, banners, pageCss] = await Promise.all([
      getActiveWidgetsByTheme(theme.id),
      getProducts(theme.id),
      getBanners(theme.id),
      getCssByPage(theme.id, 'home'), // CSS customizado da página home
    ])

    // Cores do tema - usando color_config
    const colorConfig = (theme.color_config || {}) as Partial<ColorConfig>
    const colors: ColorConfig = {
      cor_fundo_pagina: colorConfig.cor_fundo_pagina || '#FFFFFF',
      cor_detalhes_fundo: colorConfig.cor_detalhes_fundo || '#F5F5F5',
      cor_fundo_barra_superior: colorConfig.cor_fundo_barra_superior || '#1a1a1a',
      cor_botoes_cabecalho: colorConfig.cor_botoes_cabecalho || '#333333',
      cor_fundo_cabecalho: colorConfig.cor_fundo_cabecalho || '#FFFFFF',
      cor_botao_enviar_pedido: colorConfig.cor_botao_enviar_pedido || '#22c55e',
      cor_demais_botoes: colorConfig.cor_demais_botoes || '#3b82f6',
      cor_detalhes_gerais: colorConfig.cor_detalhes_gerais || '#333333',
      cor_fundo_banner_catalogo: colorConfig.cor_fundo_banner_catalogo || '#f0f0f0',
      cor_fundo_menu_desktop: colorConfig.cor_fundo_menu_desktop || '#FFFFFF',
      cor_fundo_submenu_desktop: colorConfig.cor_fundo_submenu_desktop || '#F5F5F5',
      cor_fundo_menu_mobile: colorConfig.cor_fundo_menu_mobile || '#FFFFFF',
      cor_fundo_rodape: colorConfig.cor_fundo_rodape || '#1a1a1a',
    }

    // Layout do tema - usa o layout_config salvo ou o default
    const defaultLayout: LayoutConfig = {
      sections: [
        { id: 'banner', type: 'banner_principal', label: 'Banner Principal', enabled: true, order: 1 },
        { id: 'categorias', type: 'banner_categorias', label: 'Categorias', enabled: true, order: 2 },
        { id: 'widgets', type: 'widgets', label: 'Widgets', enabled: true, order: 3 },
        { id: 'produtos', type: 'produtos', label: 'Produtos', enabled: true, order: 4 },
      ],
      products_per_row: 4
    }
    
    // Usar o layout salvo no banco OU o default
    const savedLayout = theme.layout_config as LayoutConfig | undefined
    const layout: LayoutConfig = savedLayout && savedLayout.sections && savedLayout.sections.length > 0 
      ? savedLayout 
      : defaultLayout
    
    // Debug: logar a ordem das seções
    console.log('[PREVIEW] Layout sections:', layout.sections.map(s => `${s.order}:${s.type}:${s.label}`).join(', '))

    // CSS injetado = variáveis de cores + CSS customizado por página
    const baseCss = generateBaseCss(colors)
    const customCss = pageCss?.css_code || ''
    const injectedCss = baseCss + '\n\n/* === CSS CUSTOMIZADO DA PÁGINA === */\n' + customCss

    return {
      props: {
        theme: {
          id: theme.id,
          name: theme.name,
          slug: theme.slug
        },
        colors,
        layout,
        injectedCss,
        widgets: widgets || [],
        products: products || [],
        banners: banners || [],
        storeName: theme.name,
        logoUrl: layout.logo_url || null
      }
    }
  } catch (error) {
    console.error('Erro ao carregar preview embed:', error)
    return { notFound: true }
  }
}
