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
import { getThemeBySlug, generateBaseCss, getActiveWidgetsByTheme } from '@/lib/supabase/themes'
import { getProducts, getBanners } from '@/lib/supabase/store'
import { ColorConfig, LayoutConfig } from '@/lib/types'
import type { DemoProduct, ThemeBanner } from '@/lib/supabase/store'

// Tipo para widget
type ThemeWidget = {
  id: string
  theme_id: string
  name: string
  widget_type: string
  html_content?: string
  display_order: number
  is_active: boolean
}

// ========================================
// 🛡️ WIDGET RENDERER
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
      // 1. Separar HTML de Scripts e Links
      let htmlClean = widget.html_content
      
      // Extrair scripts externos (com src)
      const externalScripts: string[] = []
      htmlClean = htmlClean.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
        externalScripts.push(src)
        return ''
      })
      
      // Extrair scripts inline
      const inlineScripts: string[] = []
      htmlClean = htmlClean.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, code) => {
        if (code.trim()) {
          inlineScripts.push(code)
        }
        return ''
      })
      
      // Extrair links de CSS externos
      const externalCSS: string[] = []
      htmlClean = htmlClean.replace(/<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*\/?>/gi, (match, href) => {
        externalCSS.push(href)
        return ''
      })
      
      // Extrair links de fontes do Google
      htmlClean = htmlClean.replace(/<link[^>]+href=["'](https:\/\/fonts\.googleapis\.com[^"']+)["'][^>]*\/?>/gi, (match, href) => {
        externalCSS.push(href)
        return ''
      })
      
      console.log(`📦 [WIDGET ${widget.name}] Scripts externos: ${externalScripts.length}, Inline: ${inlineScripts.length}, CSS: ${externalCSS.length}`)
      
      // 2. Carregar CSS externos primeiro
      externalCSS.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = href
          document.head.appendChild(link)
          console.log(`🎨 [CSS] Carregado: ${href}`)
        }
      })
      
      // 3. Inserir HTML limpo
      containerRef.current.innerHTML = htmlClean
      
      // 4. Carregar scripts externos em sequência
      const loadExternalScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          // Verificar se já foi carregado
          if (document.querySelector(`script[src="${src}"]`)) {
            console.log(`⏭️ [SCRIPT] Já carregado: ${src}`)
            resolve()
            return
          }
          
          const script = document.createElement('script')
          script.src = src
          script.async = false
          script.onload = () => {
            console.log(`✅ [SCRIPT] Carregado: ${src}`)
            resolve()
          }
          script.onerror = () => {
            console.error(`❌ [SCRIPT] Erro ao carregar: ${src}`)
            reject(new Error(`Failed to load ${src}`))
          }
          document.head.appendChild(script)
        })
      }
      
      // Carregar scripts externos em sequência, depois executar inline
      const loadAllScripts = async () => {
        // Carregar externos primeiro
        for (const src of externalScripts) {
          try {
            await loadExternalScript(src)
          } catch (e) {
            console.error(e)
          }
        }
        
        // Aguardar um pouco para as bibliotecas inicializarem
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Executar scripts inline
        inlineScripts.forEach((code, index) => {
          try {
            // Usar Function para criar escopo isolado
            const fn = new Function(code)
            fn()
            console.log(`✅ [INLINE ${index + 1}] Executado`)
          } catch (error) {
            console.error(`❌ [INLINE ${index + 1}] Erro:`, error)
          }
        })
      }
      
      loadAllScripts()
      
      console.log(`✅ [EMBED WIDGET] "${widget.name}" carregado`)
      
      // 🎬 AUTOPLAY VÍDEOS
      setTimeout(() => {
        if (!containerRef.current) return
        
        const videos = containerRef.current.querySelectorAll('video')
        videos.forEach((video) => {
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
      }, 1000)
      
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
        isolation: 'isolate',
        display: 'block',
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
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              {product.badge && (
                <span 
                  className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded"
                  style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
                >
                  {product.badge === 'destaque' ? '⭐' : product.badge === 'novo' ? '🆕' : product.badge === 'promocao' ? '🔥' : '🏆'}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium truncate text-gray-800">{product.name}</h3>
              <div className="mt-1">
                {product.original_price ? (
                  <>
                    <span className="text-xs text-gray-400 line-through">
                      R$ {product.original_price.toFixed(2)}
                    </span>
                    <span className="ml-1 font-bold text-sm" style={{ color: colors.cor_botao_enviar_pedido }}>
                      R$ {product.price.toFixed(2)}
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
}

/* ========================================
   🛡️ ISOLAMENTO DE WIDGETS
   Cada widget é isolado para evitar sobreposição
   ======================================== */

/* Container de widgets em flex column */
.widgets-section {
  display: flex !important;
  flex-direction: column !important;
  gap: 0 !important;
  width: 100% !important;
  position: relative !important;
}

/* Cada widget é um bloco isolado */
.widget {
  position: relative !important;
  isolation: isolate !important;
  transform: translateZ(0) !important;
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
  z-index: 1 !important;
}

/* Elementos absolutos dentro de widgets ficam contidos */
.widget [style*="position: absolute"],
.widget [style*="position:absolute"] {
  position: absolute !important;
  z-index: auto !important;
}

/* Limitar z-index dentro de widgets */
.widget * {
  z-index: auto !important;
}

/* Exceção: modals e overlays podem ter z-index alto, mas dentro do widget */
.widget [class*="modal"],
.widget [class*="overlay"],
.widget [class*="popup"],
.widget [class*="dropdown"] {
  z-index: 100 !important;
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
  storeName
}: EmbedPreviewProps) {
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
              <div className="text-xl font-bold" style={{ color: colors.cor_botoes_cabecalho }}>
                {storeName || 'Minha Loja'}
              </div>
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
          .filter(s => s.enabled)
          .sort((a, b) => a.order - b.order)
          .map((section, index) => (
            <div key={`${section.type}-${index}`} className="section">
              
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
          ))
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
    const [widgets, products, banners] = await Promise.all([
      getActiveWidgetsByTheme(theme.id),
      getProducts(theme.id),
      getBanners(theme.id),
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

    // Layout do tema
    const defaultLayout: LayoutConfig = {
      sections: [
        { id: 'banner', type: 'banner_principal', label: 'Banner Principal', enabled: true, order: 1 },
        { id: 'categorias', type: 'banner_categorias', label: 'Categorias', enabled: true, order: 2 },
        { id: 'widgets', type: 'widgets', label: 'Widgets', enabled: true, order: 3 },
        { id: 'produtos', type: 'produtos', label: 'Produtos', enabled: true, order: 4 },
      ],
      products_per_row: 4
    }
    const layout: LayoutConfig = theme.layout_config || defaultLayout

    // CSS injetado
    const injectedCss = generateBaseCss(colors)

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
        storeName: theme.name
      }
    }
  } catch (error) {
    console.error('Erro ao carregar preview embed:', error)
    return { notFound: true }
  }
}
