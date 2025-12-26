/**
 * 🖼️ EMBED PREVIEW - Versão isolada para iframe
 * 
 * Esta página renderiza APENAS o conteúdo do tema (widgets, produtos, etc.)
 * SEM a barra de admin ou controles de preview.
 * 
 * É carregada dentro de um iframe na página principal de preview,
 * permitindo que as media queries funcionem corretamente baseadas
 * no viewport do iframe (não do navegador).
 */

import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState, useRef, useEffect, useCallback } from 'react'
import { getThemeBySlug, generateBaseCss, getActiveWidgetsByTheme } from '@/lib/supabase/themes'
import { getProducts, getDemoBanners, getStoreConfig } from '@/lib/supabase/store'
import { ColorConfig, ThemeWidget, LayoutConfig } from '@/lib/types'
import type { DemoProduct, DemoBanner, StoreConfig } from '@/lib/supabase/store'

// ========================================
// 🛡️ WIDGET RENDERER PARA EMBED
// ========================================
function WidgetRenderer({ 
  widget, 
  colors
}: { 
  widget: ThemeWidget
  colors: ColorConfig
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  useEffect(() => {
    if (!containerRef.current || !widget.html_content) return
    
    console.log(`🔧 [EMBED WIDGET] Carregando: "${widget.name}"`)
    
    try {
      // Separar HTML de Scripts
      const htmlWithoutScripts = widget.html_content.replace(/<script[\s\S]*?<\/script>/gi, '')
      const scripts: string[] = []
      widget.html_content.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match: string, code: string) => {
        scripts.push(code)
        return ''
      })
      
      // Inserir HTML
      containerRef.current.innerHTML = htmlWithoutScripts
      
      // Executar scripts
      scripts.forEach((code, index) => {
        try {
          const scriptElement = document.createElement('script')
          scriptElement.textContent = code
          containerRef.current?.appendChild(scriptElement)
        } catch (error) {
          console.error(`❌ [EMBED WIDGET] Erro no script ${index + 1}:`, error)
        }
      })
      
      console.log(`✅ [EMBED WIDGET] "${widget.name}" carregado`)
      
      // 🎬 AUTOPLAY VÍDEOS
      setTimeout(() => {
        if (!containerRef.current) return
        
        const videos = containerRef.current.querySelectorAll('video')
        videos.forEach((video, index) => {
          video.setAttribute('autoplay', '')
          video.setAttribute('playsinline', '')
          video.setAttribute('muted', '')
          video.muted = true
          video.loop = true
          video.play().catch(() => {})
        })
        
        const iframes = containerRef.current.querySelectorAll('iframe')
        iframes.forEach(iframe => {
          const src = iframe.getAttribute('src') || ''
          if ((src.includes('youtube') || src.includes('vimeo')) && !src.includes('autoplay')) {
            const separator = src.includes('?') ? '&' : '?'
            iframe.setAttribute('src', src + separator + 'autoplay=1&mute=1')
          }
        })
      }, 500)
      
    } catch (error) {
      console.error(`❌ [EMBED WIDGET] ERRO:`, error)
      setHasError(true)
      setErrorMessage(`${error}`)
    }
  }, [widget.html_content, widget.id, widget.name])
  
  if (hasError) {
    return (
      <div style={{ padding: '20px', margin: '10px 0', backgroundColor: '#fee2e2', border: '1px solid #f87171', borderRadius: '8px' }}>
        <p style={{ color: '#b91c1c', margin: 0 }}>⚠️ Widget "{widget.name}" com erro: {errorMessage}</p>
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className="widget"
      data-widget-id={widget.id}
      data-widget-name={widget.name}
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        '--cor-fundo-pagina': colors.cor_fundo_pagina,
        '--cor-detalhes-fundo': colors.cor_detalhes_fundo,
        '--cor-fundo-barra-superior': colors.cor_fundo_barra_superior,
        '--cor-botoes-cabecalho': colors.cor_botoes_cabecalho,
        '--cor-fundo-cabecalho': colors.cor_fundo_cabecalho,
        '--cor-botao-enviar-pedido': colors.cor_botao_enviar_pedido,
        '--cor-demais-botoes': colors.cor_demais_botoes,
        '--cor-detalhes-gerais': colors.cor_detalhes_gerais,
        '--cor-fundo-banner-catalogo': colors.cor_fundo_banner_catalogo,
        '--cor-fundo-menu-desktop': colors.cor_fundo_menu_desktop,
        '--cor-fundo-submenu-desktop': colors.cor_fundo_submenu_desktop,
        '--cor-fundo-menu-mobile': colors.cor_fundo_menu_mobile,
        '--cor-fundo-rodape': colors.cor_fundo_rodape,
        '--cor-primaria': colors.cor_detalhes_gerais,
        '--cor-secundaria': colors.cor_demais_botoes,
        '--cor-destaque': colors.cor_botao_enviar_pedido,
        '--cor-fundo': colors.cor_fundo_pagina,
        '--cor-texto': '#333333',
      } as React.CSSProperties}
    />
  )
}

// ========================================
// 🛒 CARROSSEL DE PRODUTOS
// ========================================
function ProductCarousel({ 
  title, 
  products, 
  colors, 
  onAddCart, 
  btnText 
}: { 
  title: string
  products: DemoProduct[]
  colors: ColorConfig
  onAddCart: () => void
  btnText: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const displayProducts = products.length > 0 ? [...products, ...products, ...products] : []

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

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold" style={{ color: colors.cor_detalhes_gerais }}>
          {title}
        </h2>
        <div className="flex gap-2">
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
      </div>

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
      >
        {displayProducts.map((product, idx) => (
          <div 
            key={`${product.id}-${idx}`} 
            className="flex-shrink-0 w-40 rounded-xl overflow-hidden shadow-md"
            style={{ backgroundColor: colors.cor_detalhes_fundo, scrollSnapAlign: 'start' }}
          >
            <div className="relative aspect-square">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              {product.discount && (
                <span 
                  className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded"
                  style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
                >
                  -{product.discount}%
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium truncate text-gray-800">{product.name}</h3>
              <div className="mt-1">
                {product.discount ? (
                  <>
                    <span className="text-xs text-gray-400 line-through">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <span className="ml-1 font-bold text-sm" style={{ color: colors.cor_botao_enviar_pedido }}>
                      R$ {(product.price * (1 - product.discount / 100)).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-sm" style={{ color: colors.cor_detalhes_gerais }}>
                    R$ {product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <button 
                onClick={onAddCart}
                className="mt-2 w-full py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: colors.cor_demais_botoes }}
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
// 📄 TIPOS
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
  banners: DemoBanner[]
  storeConfig: StoreConfig | null
}

// ========================================
// 🎨 CSS BASE PARA CONTENÇÃO
// ========================================
const BASE_CONTAINMENT_CSS = `
/* ====================================
   🛡️ CSS BASE PARA CONTENÇÃO DE WIDGETS
   ====================================
   Garante que widgets não quebrem o layout
*/

/* Reset básico para contenção */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Impedir overflow horizontal */
html, body {
  overflow-x: hidden !important;
  max-width: 100vw !important;
}

body {
  margin: 0;
  padding: 0;
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

/* Grid responsivo */
@media (max-width: 768px) {
  .widget [style*="grid-template-columns"],
  .widget .grid {
    grid-template-columns: 1fr !important;
  }
  
  .widget [style*="display: flex"] > *,
  .widget .flex > * {
    flex: 1 1 100% !important;
    min-width: 0 !important;
  }
}

/* Neutralizar posicionamentos problemáticos */
.widget [style*="position: fixed"] {
  position: absolute !important;
}

.widget [style*="position: sticky"] {
  position: relative !important;
}

/* Conter elementos que tentam sair do container */
.widget [style*="width: 100vw"],
.widget [style*="width:100vw"],
.widget [style*="left: -"],
.widget [style*="margin-left: -"] {
  width: 100% !important;
  left: 0 !important;
  margin-left: 0 !important;
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

.widget .swiper-slide,
.widget .splide__slide,
.widget .slick-slide {
  max-width: 100% !important;
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
  storeConfig
}: EmbedPreviewProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  // Função para adicionar ao carrinho
  const handleAddCart = useCallback(() => {
    setCartCount(prev => prev + 1)
  }, [])

  // Comunicar altura para o pai (para ajuste do iframe)
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

  // CSS de variáveis de cores
  const colorVariablesCss = `
    :root {
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
      --cor-primaria: ${colors.cor_detalhes_gerais};
      --cor-secundaria: ${colors.cor_demais_botoes};
      --cor-destaque: ${colors.cor_botao_enviar_pedido};
      --cor-fundo: ${colors.cor_fundo_pagina};
    }
  `

  // Logo
  const logoUrl = storeConfig?.logo_url || null

  return (
    <>
      <Head>
        <title>{`Preview - ${theme.name}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: colorVariablesCss + BASE_CONTAINMENT_CSS + injectedCss }} />
      </Head>

      {/* Conteúdo do Preview */}
      <div style={{ backgroundColor: colors.cor_fundo_pagina }} className="min-h-screen">
        
        {/* Barra Superior */}
        <div 
          className="text-center py-2 text-xs font-medium text-white"
          style={{ backgroundColor: colors.cor_fundo_barra_superior }}
        >
          {storeConfig?.top_bar_text || '🎁 Frete Grátis acima de R$ 299 | Use o cupom PRIMEIRACOMPRA'}
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
                <img src={logoUrl} alt="Logo" className="max-h-14 max-w-[180px] object-contain" />
              ) : (
                <div className="text-xl font-bold" style={{ color: colors.cor_botoes_cabecalho }}>
                  {storeConfig?.store_name || 'Minha Loja'}
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

        {/* Seções do Layout */}
        {layout.sections
          .filter(s => s.visible)
          .sort((a, b) => a.order - b.order)
          .map((section, index) => (
            <div key={`${section.type}-${index}`} className="section">
              
              {/* Banner */}
              {section.type === 'banner' && banners.length > 0 && (
                <div className="relative">
                  <img 
                    src={banners[0]?.imageUrl || '/placeholder-banner.jpg'} 
                    alt="Banner" 
                    className="w-full object-cover"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              )}

              {/* Widgets */}
              {section.type === 'widgets' && widgets.length > 0 && (
                <div className="widgets-section">
                  {widgets
                    .filter(w => w.is_active)
                    .sort((a, b) => a.display_order - b.display_order)
                    .map(widget => (
                      <WidgetRenderer key={widget.id} widget={widget} colors={colors} />
                    ))
                  }
                </div>
              )}

              {/* Produtos */}
              {section.type === 'produtos' && products.length > 0 && (
                <div className="py-6">
                  <ProductCarousel
                    title="🔥 Mais Vendidos"
                    products={products.slice(0, 10)}
                    colors={colors}
                    onAddCart={handleAddCart}
                    btnText="Comprar"
                  />
                  {products.length > 10 && (
                    <ProductCarousel
                      title="✨ Novidades"
                      products={products.slice(10, 20)}
                      colors={colors}
                      onAddCart={handleAddCart}
                      btnText="Ver produto"
                    />
                  )}
                </div>
              )}

              {/* Categorias */}
              {section.type === 'categorias' && (
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
          ))
        }

        {/* Footer */}
        <footer 
          className="mt-8 py-8 px-4"
          style={{ backgroundColor: colors.cor_fundo_rodape }}
        >
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              {storeConfig?.store_name || 'Minha Loja'}
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              {storeConfig?.footer_text || 'Sua loja online favorita'}
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
              © 2025 {storeConfig?.store_name || 'Minha Loja'}. Todos os direitos reservados.
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

    // Buscar dados em paralelo
    const [widgets, products, banners, storeConfig] = await Promise.all([
      getActiveWidgetsByTheme(theme.id),
      getProducts(),
      getDemoBanners(),
      getStoreConfig()
    ])

    // Cores
    const colors: ColorConfig = {
      cor_fundo_pagina: theme.cor_fundo_pagina || '#FFFFFF',
      cor_detalhes_fundo: theme.cor_detalhes_fundo || '#F5F5F5',
      cor_fundo_barra_superior: theme.cor_fundo_barra_superior || '#1a1a1a',
      cor_botoes_cabecalho: theme.cor_botoes_cabecalho || '#333333',
      cor_fundo_cabecalho: theme.cor_fundo_cabecalho || '#FFFFFF',
      cor_botao_enviar_pedido: theme.cor_botao_enviar_pedido || '#22c55e',
      cor_demais_botoes: theme.cor_demais_botoes || '#3b82f6',
      cor_detalhes_gerais: theme.cor_detalhes_gerais || '#333333',
      cor_fundo_banner_catalogo: theme.cor_fundo_banner_catalogo || '#f0f0f0',
      cor_fundo_menu_desktop: theme.cor_fundo_menu_desktop || '#FFFFFF',
      cor_fundo_submenu_desktop: theme.cor_fundo_submenu_desktop || '#F5F5F5',
      cor_fundo_menu_mobile: theme.cor_fundo_menu_mobile || '#FFFFFF',
      cor_fundo_rodape: theme.cor_fundo_rodape || '#1a1a1a',
    }

    // Layout
    const layout: LayoutConfig = theme.layout_config || {
      sections: [
        { type: 'banner', visible: true, order: 1, config: {} },
        { type: 'categorias', visible: true, order: 2, config: {} },
        { type: 'widgets', visible: true, order: 3, config: {} },
        { type: 'produtos', visible: true, order: 4, config: {} },
      ]
    }

    // CSS injetado
    const injectedCss = generateBaseCss(theme)

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
        storeConfig: storeConfig || null
      }
    }
  } catch (error) {
    console.error('Erro ao carregar preview embed:', error)
    return { notFound: true }
  }
}
