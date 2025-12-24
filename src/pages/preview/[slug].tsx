import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import { getThemeBySlug, generateBaseCss, getActiveWidgetsByTheme } from '@/lib/supabase/themes'
import { getProducts, getDemoBanners, getStoreConfig } from '@/lib/supabase/store'
import { ColorConfig, ThemeWidget, LayoutConfig } from '@/lib/types'
import type { DemoProduct, DemoBanner, StoreConfig } from '@/lib/supabase/store'

// Componente de Carrossel de Produtos (Infinito)
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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Duplicar produtos para efeito infinito
  const displayProducts = products.length > 0 ? [...products, ...products, ...products] : []

  useEffect(() => {
    // Iniciar no meio para poder scrollar para ambos os lados
    if (scrollRef.current && products.length > 0) {
      const scrollWidth = scrollRef.current.scrollWidth
      scrollRef.current.scrollLeft = scrollWidth / 3
    }
  }, [products])

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      const oneThird = scrollWidth / 3

      // Se chegou no início, pula pro meio
      if (scrollLeft < 50) {
        scrollRef.current.scrollLeft = oneThird + scrollLeft
      }
      // Se chegou no fim, pula pro meio
      if (scrollLeft > oneThird * 2 - 50) {
        scrollRef.current.scrollLeft = oneThird + (scrollLeft - oneThird * 2)
      }

      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
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
      {/* Título da Faixa */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold" style={{ color: colors.cor_detalhes_gerais }}>
          {title}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full flex items-center justify-center transition"
            style={{ backgroundColor: colors.cor_detalhes_fundo }}
          >
            <svg className="w-4 h-4" fill="none" stroke={colors.cor_detalhes_gerais} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full flex items-center justify-center transition"
            style={{ backgroundColor: colors.cor_detalhes_fundo }}
          >
            <svg className="w-4 h-4" fill="none" stroke={colors.cor_detalhes_gerais} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carrossel Infinito */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto px-4 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {displayProducts.map((product, index) => (
          <div 
            key={`${product.id}-${index}`} 
            className="flex-shrink-0 w-[170px] bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
          >
            {/* Imagem com bolinhas de paginação */}
            <div className="aspect-square bg-gray-100 relative">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              {/* Badge */}
              {product.badge && (
                <span 
                  className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold text-white rounded-full"
                  style={{ backgroundColor: colors.cor_detalhes_gerais }}
                >
                  {product.badge === 'destaque' ? '⭐' : product.badge === 'novo' ? '🆕' : product.badge === 'promocao' ? '🔥' : '🏆'}
                </span>
              )}
              {/* Bolinhas de paginação (visual) */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.cor_detalhes_gerais }}></span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="p-3 text-center">
              {/* Nome do produto */}
              <h3 className="text-xs font-medium text-gray-800 line-clamp-2 mb-2 min-h-[40px]">{product.name}</h3>
              
              {/* Preço */}
              {product.original_price && (
                <p className="text-xs text-gray-400 line-through">R$ {product.original_price.toFixed(2)}</p>
              )}
              <p className="text-xl font-bold text-gray-900 mb-2">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
              
              {/* Botão Comprar */}
              <button 
                onClick={onAddCart} 
                className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {btnText}
              </button>
              
              {/* Parcelamento */}
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-semibold">12x</span> de <span className="font-semibold">R$ {(product.price / 12).toFixed(2).replace('.', ',')}</span> no <span className="font-semibold">Cartão</span>
              </p>
              
              {/* Ícones de ação */}
              <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-gray-100">
                <button className="text-gray-400 hover:text-red-500 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-blue-500 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-green-500 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type Props = {
  theme: { id: string; name: string; slug: string }
  products: DemoProduct[]
  banners: DemoBanner[]
  widgets: ThemeWidget[]
  colors: ColorConfig
  layoutConfig: LayoutConfig
  storeConfig: StoreConfig | null
  injectedCss: string
}

// Componente para renderizar um widget individual com scripts funcionando + DEBUG
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
    
    console.log(`🔧 [WIDGET DEBUG] Carregando widget: "${widget.name}" (ID: ${widget.id})`)
    
    try {
      // Separar HTML de Scripts
      const htmlWithoutScripts = widget.html_content.replace(/<script[\s\S]*?<\/script>/gi, '')
      const scripts: string[] = []
      widget.html_content.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, code) => {
        scripts.push(code)
        return ''
      })
      
      console.log(`📦 [WIDGET DEBUG] Widget "${widget.name}" tem ${scripts.length} scripts`)
      
      // Inserir HTML
      containerRef.current.innerHTML = htmlWithoutScripts
      console.log(`✅ [WIDGET DEBUG] HTML do widget "${widget.name}" inserido com sucesso`)
      
      // Executar scripts em escopo isolado (IIFE) com timeout de segurança
      scripts.forEach((code, index) => {
        try {
          console.log(`🔨 [WIDGET DEBUG] Executando script ${index + 1}/${scripts.length} do widget "${widget.name}"`)
          
          // Criar função isolada para cada script com timeout
          const isolatedScript = `(function() {
            try {
              console.log('[WIDGET SCRIPT] Iniciando script ${index + 1} do widget "${widget.name}"');
              ${code}
              console.log('[WIDGET SCRIPT] Script ${index + 1} executado com sucesso');
            } catch(e) {
              console.error('[WIDGET SCRIPT ERROR]', e);
              throw e;
            }
          })();`
          
          const scriptElement = document.createElement('script')
          scriptElement.textContent = isolatedScript
          scriptElement.onerror = (e) => {
            console.error(`❌ [WIDGET DEBUG] Erro ao executar script ${index + 1} do widget "${widget.name}":`, e)
            setHasError(true)
            setErrorMessage(`Erro no script ${index + 1}`)
          }
          
          containerRef.current?.appendChild(scriptElement)
          console.log(`✅ [WIDGET DEBUG] Script ${index + 1} do widget "${widget.name}" adicionado`)
          
        } catch (error) {
          console.error(`❌ [WIDGET DEBUG] Widget "${widget.name}" script ${index + 1} error:`, error)
          setHasError(true)
          setErrorMessage(`Erro no script ${index + 1}: ${error}`)
        }
      })
      
      console.log(`🎉 [WIDGET DEBUG] Widget "${widget.name}" carregado completamente`)
      
      // Verificar se ESTE widget bloqueou o scroll
      setTimeout(() => {
        const bodyOverflow = window.getComputedStyle(document.body).overflow
        const htmlOverflow = window.getComputedStyle(document.documentElement).overflow
        
        if (bodyOverflow === 'hidden' || htmlOverflow === 'hidden') {
          console.error(`🔴 [SCROLL BLOCKER] O widget "${widget.name}" BLOQUEOU O SCROLL!`)
          console.error(`🔴 body overflow: ${bodyOverflow}, html overflow: ${htmlOverflow}`)
        }
      }, 100)
      
    } catch (error) {
      console.error(`❌ [WIDGET DEBUG] ERRO CRÍTICO ao carregar widget "${widget.name}":`, error)
      setHasError(true)
      setErrorMessage(`Erro crítico: ${error}`)
    }
    
    // Cleanup: remover scripts ao desmontar
    return () => {
      console.log(`🧹 [WIDGET DEBUG] Limpando widget "${widget.name}"`)
      if (containerRef.current) {
        const scripts = containerRef.current.querySelectorAll('script')
        scripts.forEach(s => s.remove())
      }
    }
  }, [widget.html_content, widget.id, widget.name])
  
  // Se tiver erro, mostrar card de erro ao invés de travar
  if (hasError) {
    return (
      <div 
        className="widget-error" 
        style={{
          padding: '20px',
          margin: '10px 0',
          backgroundColor: '#fee',
          border: '2px solid #f00',
          borderRadius: '8px',
          fontFamily: 'monospace'
        }}
      >
        <h3 style={{ color: '#c00', marginTop: 0 }}>⚠️ Widget com Erro</h3>
        <p><strong>Nome:</strong> {widget.name}</p>
        <p><strong>ID:</strong> {widget.id}</p>
        <p><strong>Erro:</strong> {errorMessage}</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Verifique o console (F12) para mais detalhes. Este widget foi isolado para não travar a página.
        </p>
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
        // Variáveis CSS disponíveis para os widgets
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
        // Aliases mais simples
        '--cor-primaria': colors.cor_detalhes_gerais,
        '--cor-secundaria': colors.cor_demais_botoes,
        '--cor-destaque': colors.cor_botao_enviar_pedido,
        '--cor-fundo': colors.cor_fundo_pagina,
        '--cor-texto': '#333333',
      } as React.CSSProperties}
    />
  )
}

const defaultColors: ColorConfig = {
  cor_fundo_pagina: '#ffffff',
  cor_detalhes_fundo: '#f8f9fa',
  cor_fundo_barra_superior: '#1a1a2e',
  cor_botoes_cabecalho: '#e94560',
  cor_fundo_cabecalho: '#ffffff',
  cor_botao_enviar_pedido: '#e94560',
  cor_demais_botoes: '#6c757d',
  cor_detalhes_gerais: '#e94560',
  cor_fundo_banner_catalogo: '#f8f9fa',
  cor_fundo_menu_desktop: '#ffffff',
  cor_fundo_submenu_desktop: '#f8f9fa',
  cor_fundo_menu_mobile: '#ffffff',
  cor_fundo_rodape: '#1a1a2e'
}

const defaultLayoutConfig: LayoutConfig = {
  sections: [
    { id: 'banner_principal', type: 'banner_principal', label: 'Banner Principal', enabled: true, order: 1 },
    { id: 'banner_categorias', type: 'banner_categorias', label: 'Banner de Categorias', enabled: true, order: 2 },
    { id: 'produtos', type: 'produtos', label: 'Produtos', enabled: true, order: 3 },
    { id: 'avaliacoes', type: 'avaliacoes', label: 'Avaliações', enabled: false, order: 4 },
    { id: 'info_loja', type: 'info_loja', label: 'Informações da Loja', enabled: false, order: 5 },
  ],
  products_per_row: 6
}

export default function PreviewPage({ theme, products, banners, widgets, colors, layoutConfig, storeConfig, injectedCss }: Props) {
  const [cartCount, setCartCount] = useState(0)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [widgetsDisabled, setWidgetsDisabled] = useState(false)

  const isMobile = viewMode === 'mobile'
  // Prioridade: layoutConfig.logo_url > storeConfig.store_logo
  const logoUrl = (layoutConfig as any)?.logo_url || storeConfig?.store_logo || null

  // Detector de scroll bloqueado
  useEffect(() => {
    if (widgetsDisabled) return

    const checkScrollBlock = () => {
      const body = document.body
      const html = document.documentElement
      
      console.log('🔍 [SCROLL DEBUG] Verificando bloqueios de scroll...')
      console.log('📊 [SCROLL DEBUG] body.style.overflow:', body.style.overflow)
      console.log('📊 [SCROLL DEBUG] html.style.overflow:', html.style.overflow)
      console.log('📊 [SCROLL DEBUG] body.style.position:', body.style.position)
      console.log('📊 [SCROLL DEBUG] html.style.position:', html.style.position)
      console.log('📊 [SCROLL DEBUG] body.style.height:', body.style.height)
      console.log('📊 [SCROLL DEBUG] html.style.height:', html.style.height)
      
      const bodyComputed = window.getComputedStyle(body)
      const htmlComputed = window.getComputedStyle(html)
      
      console.log('📊 [SCROLL DEBUG] body computed overflow:', bodyComputed.overflow)
      console.log('📊 [SCROLL DEBUG] html computed overflow:', htmlComputed.overflow)
      
      // Detectar overflow: hidden
      if (bodyComputed.overflow === 'hidden' || htmlComputed.overflow === 'hidden') {
        console.error('🚫 [SCROLL DEBUG] DETECTADO: overflow hidden! Algum widget está bloqueando o scroll!')
      }
      
      // Detectar position: fixed
      if (bodyComputed.position === 'fixed' || htmlComputed.position === 'fixed') {
        console.error('🚫 [SCROLL DEBUG] DETECTADO: position fixed! Algum widget está fixando a página!')
      }
    }

    // Verificar após widgets carregarem
    const timer = setTimeout(checkScrollBlock, 2000)
    
    return () => clearTimeout(timer)
  }, [widgetsDisabled])

  // CSS com variáveis de cores para widgets
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
      /* Aliases simplificados */
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
        <style dangerouslySetInnerHTML={{ __html: colorVariablesCss + injectedCss }} />
      </Head>

      {/* Barra Admin */}
      <div className="bg-gray-900 text-white py-2 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin/themes" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Voltar
          </Link>
          <span className="text-sm">Preview: <strong>{theme.name}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          {/* Botão de Emergência - Forçar Desbloqueio de Scroll */}
          <button
            onClick={() => {
              console.log('🔓 [SCROLL FIX] Forçando desbloqueio de scroll...')
              document.body.style.overflow = ''
              document.body.style.position = ''
              document.body.style.height = ''
              document.documentElement.style.overflow = ''
              document.documentElement.style.position = ''
              document.documentElement.style.height = ''
              console.log('✅ [SCROLL FIX] Scroll desbloqueado!')
            }}
            className="px-3 py-1 rounded text-xs font-medium transition bg-purple-600 hover:bg-purple-700 text-white"
            title="Forçar desbloqueio de scroll se a página travar"
          >
            🔓 Fix Scroll
          </button>
          {/* Botão de Emergência - Desabilitar Widgets */}
          {widgets.length > 0 && (
            <button
              onClick={() => {
                setWidgetsDisabled(!widgetsDisabled)
                if (!widgetsDisabled) {
                  console.log('🚨 EMERGENCY: All widgets disabled by user')
                } else {
                  console.log('✅ RECOVERY: Widgets re-enabled')
                }
              }}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                widgetsDisabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={widgetsDisabled ? 'Reabilitar widgets' : 'Desabilitar widgets se a página travar'}
            >
              {widgetsDisabled ? '✓ Widgets Off' : '⚠️ Kill Widgets'}
            </button>
          )}
          {/* Toggle Desktop/Mobile */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1 rounded text-xs font-medium transition ${viewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              🖥️ Desktop
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 rounded text-xs font-medium transition ${viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              📱 Mobile
            </button>
          </div>
          <Link href={`/admin/themes/${theme.id}`} className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700">
            Editar
          </Link>
        </div>
      </div>

      {/* Container do Preview */}
      <div className={`mx-auto transition-all duration-300 ${isMobile ? 'max-w-[375px] shadow-2xl my-4 rounded-3xl overflow-hidden border-8 border-gray-800' : ''}`}>
        
        {/* Preview da Loja */}
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

              {/* Logo Centralizada - Adaptável (horizontal ou circular) */}
              <div className="flex-1 flex justify-center">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="max-h-14 max-w-[180px] object-contain" 
                    style={{ 
                      // Se a imagem for quadrada, fica redonda. Se for horizontal, fica normal.
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <div 
                    className="h-12 px-4 rounded-lg border-2 flex items-center justify-center"
                    style={{ borderColor: colors.cor_botoes_cabecalho }}
                  >
                    <span className="text-sm font-bold" style={{ color: colors.cor_botoes_cabecalho }}>SUA LOGO</span>
                  </div>
                )}
              </div>

              {/* Carrinho com Bolinha */}
              <button 
                className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke={colors.cor_botoes_cabecalho} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ backgroundColor: colors.cor_detalhes_gerais }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Barra de Busca - Lupa do lado direito */}
            <div className="mt-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="O que você procura?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-pink-400"
                  style={{ backgroundColor: colors.cor_detalhes_fundo }}
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </header>

          {/* Menu Mobile Overlay */}
          {menuOpen && (
            <div className="fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
              <div 
                className="absolute left-0 top-0 bottom-0 w-64 shadow-xl p-4"
                style={{ backgroundColor: colors.cor_fundo_menu_mobile }}
              >
                <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <nav className="mt-12 space-y-2">
                  <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">Início</a>
                  <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">Categorias</a>
                  <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">Promoções</a>
                  <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">Contato</a>
                </nav>
              </div>
            </div>
          )}

          {/* ===== RENDERIZAÇÃO DAS SEÇÕES BASEADO NO LAYOUT CONFIG ===== */}
          
          {layoutConfig.sections
            .filter(s => s.enabled)
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <div key={section.id}>
                {/* Banner Principal */}
                {section.type === 'banner_principal' && banners.length > 0 && (
                  <div className="banner-principal">
                    {banners.filter(b => b.is_active).slice(0, 1).map(banner => (
                      <div key={banner.id} className="w-full relative">
                        <img 
                          src={isMobile && banner.image_mobile ? banner.image_mobile : banner.image_desktop} 
                          alt={banner.title || 'Banner Principal'} 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Banner de Categorias (banners secundários) */}
                {section.type === 'banner_categorias' && banners.length > 1 && (
                  <div className="banner-categorias px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {banners.filter(b => b.is_active).slice(1).map(banner => (
                        <a key={banner.id} href={banner.button_link || '#'} className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                          <img 
                            src={banner.image_desktop} 
                            alt={banner.title || 'Categoria'} 
                            className="w-full h-32 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Widgets */}
                {section.type === 'widgets' && widgets.length > 0 && (
                  <div className="widgets-section w-full overflow-hidden">
                    {/* CSS base para responsividade dos widgets */}
                    <style dangerouslySetInnerHTML={{ __html: `
                      .widgets-section .widget {
                        width: 100%;
                        max-width: 100%;
                        overflow-x: hidden;
                        box-sizing: border-box;
                      }
                      .widgets-section .widget * {
                        max-width: 100%;
                        box-sizing: border-box;
                      }
                      .widgets-section .widget img {
                        max-width: 100%;
                        height: auto;
                      }
                      @media (max-width: 768px) {
                        .widgets-section .widget {
                          padding-left: 8px;
                          padding-right: 8px;
                        }
                        .widgets-section .widget [style*="display: flex"],
                        .widgets-section .widget [style*="display:flex"] {
                          flex-wrap: wrap !important;
                        }
                      }
                    `}} />
                    
                    {/* Se widgets desabilitados, mostra aviso */}
                    {widgetsDisabled ? (
                      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mx-4 my-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">⚠️</span>
                          <div>
                            <h3 className="text-yellow-900 font-semibold mb-2">Widgets Desabilitados</h3>
                            <p className="text-yellow-800 text-sm mb-3">
                              Os widgets foram desabilitados temporariamente. Clique no botão <strong>"Kill Widgets"</strong> no topo da página para reativá-los.
                            </p>
                            <p className="text-yellow-700 text-xs">
                              {widgets.filter(w => w.is_active).length} widget(s) não estão sendo renderizados no momento.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Renderizar widgets usando componente isolado */
                      (() => {
                        const sectionData = section as any
                        const filteredWidgets = sectionData.widget_ids && sectionData.widget_ids.length > 0
                          ? widgets.filter(w => w.is_active && sectionData.widget_ids.includes(w.id))
                          : widgets.filter(w => w.is_active)
                        
                        return filteredWidgets
                          .sort((a, b) => a.display_order - b.display_order)
                          .map(widget => (
                            <WidgetRenderer key={widget.id} widget={widget} colors={colors} />
                          ))
                      })()
                    )}
                  </div>
                )}

                {/* Produtos */}
                {section.type === 'produtos' && (
                  <div className="produtos-section py-6">
                    {products.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg mx-4">
                        <p className="text-gray-500 mb-4">Nenhum produto cadastrado ainda.</p>
                        <Link href={`/admin/themes/${theme.id}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                          Cadastrar Produtos
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* Faixa: Lançamentos */}
                        {products.filter(p => p.is_active && p.badge === 'novo').length > 0 && (
                          <ProductCarousel 
                            title="🆕 Lançamentos" 
                            products={products.filter(p => p.is_active && p.badge === 'novo')}
                            colors={colors}
                            onAddCart={() => setCartCount(c => c + 1)}
                            btnText={storeConfig?.btn_buy_text || 'COMPRAR'}
                          />
                        )}

                        {/* Faixa: Destaques */}
                        {products.filter(p => p.is_active && p.badge === 'destaque').length > 0 && (
                          <ProductCarousel 
                            title="⭐ Destaques" 
                            products={products.filter(p => p.is_active && p.badge === 'destaque')}
                            colors={colors}
                            onAddCart={() => setCartCount(c => c + 1)}
                            btnText={storeConfig?.btn_buy_text || 'COMPRAR'}
                          />
                        )}

                        {/* Faixa: Promoções */}
                        {products.filter(p => p.is_active && p.badge === 'promocao').length > 0 && (
                          <ProductCarousel 
                            title="🔥 Promoções" 
                            products={products.filter(p => p.is_active && p.badge === 'promocao')}
                            colors={colors}
                            onAddCart={() => setCartCount(c => c + 1)}
                            btnText={storeConfig?.btn_buy_text || 'COMPRAR'}
                          />
                        )}

                        {/* Faixa: Mais Vendidos */}
                        {products.filter(p => p.is_active && p.badge === 'mais_vendido').length > 0 && (
                          <ProductCarousel 
                            title="🏆 Mais Vendidos" 
                            products={products.filter(p => p.is_active && p.badge === 'mais_vendido')}
                            colors={colors}
                            onAddCart={() => setCartCount(c => c + 1)}
                            btnText={storeConfig?.btn_buy_text || 'COMPRAR'}
                          />
                        )}

                        {/* Se não houver nenhum carrossel por badge, mostra todos */}
                        {products.filter(p => p.is_active && p.badge).length === 0 && (
                          <div className="text-center py-8 px-4">
                            <p className="text-gray-500 text-sm mb-2">Nenhum carrossel configurado.</p>
                            <p className="text-gray-400 text-xs">Adicione carrosséis na aba Layout do admin.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Avaliações */}
                {section.type === 'avaliacoes' && (
                  <div className="avaliacoes-section py-6 px-4" style={{ backgroundColor: colors.cor_detalhes_fundo }}>
                    <h2 className="text-lg font-bold mb-4" style={{ color: colors.cor_detalhes_gerais }}>
                      ⭐ Avaliações dos Clientes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-yellow-500">★★★★★</span>
                            <span className="text-sm text-gray-500">Cliente {i}</span>
                          </div>
                          <p className="text-sm text-gray-600">Produto excelente! Recomendo muito.</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informações da Loja */}
                {section.type === 'info_loja' && (
                  <div className="info-loja-section py-6 px-4">
                    <h2 className="text-lg font-bold mb-4" style={{ color: colors.cor_detalhes_gerais }}>
                      📍 Sobre a Loja
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{storeConfig?.footer_about || 'Sua loja de confiança para as melhores ofertas.'}</p>
                    </div>
                  </div>
                )}

                {/* Carrossel Customizado */}
                {section.type === 'carousel_custom' && (
                  <div className="carousel-custom-section py-4">
                    <ProductCarousel 
                      title={section.label}
                      products={(() => {
                        const sectionData = section as any
                        
                        // NOVA LÓGICA: Se tiver product_ids, filtra por IDs
                        if (sectionData.product_ids && sectionData.product_ids.length > 0) {
                          return products.filter(p => p.is_active && sectionData.product_ids.includes(p.id))
                        }
                        
                        // LEGADO: Filtrar por categoria/badge (mantém retrocompatibilidade)
                        if (sectionData.category) {
                          return products.filter(p => {
                            if (!p.is_active) return false
                            const category = sectionData.category
                            // Mapear categorias especiais para badges
                            if (category === 'lancamentos') return p.badge === 'novo'
                            if (category === 'promocoes') return p.badge === 'promocao'
                            if (category === 'destaques') return p.badge === 'destaque'
                            if (category === 'mais_vendidos') return p.badge === 'mais_vendido'
                            if (category === 'ofertas') return p.original_price && p.original_price > p.price
                            // Ou filtrar por categoria do produto
                            return p.category === category
                          })
                        }
                        
                        // Se não tiver nenhum filtro, retorna vazio
                        return []
                      })()}
                      colors={colors}
                      onAddCart={() => setCartCount(c => c + 1)}
                      btnText={storeConfig?.btn_buy_text || 'COMPRAR'}
                    />
                  </div>
                )}
              </div>
            ))
          }

          {/* Debug: Mostrar se não há banners */}
          {banners.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-4 my-4 text-center">
              <p className="text-yellow-700 text-sm">⚠️ Nenhum banner cadastrado na tabela demo_banners.</p>
              <Link href={`/admin/themes/${theme.id}`} className="text-blue-600 underline text-sm">
                Cadastrar Banners
              </Link>
            </div>
          )}

          {/* Rodapé */}
          <footer 
            className="mt-8 py-6 px-4 text-center text-white text-sm"
            style={{ backgroundColor: colors.cor_fundo_rodape }}
          >
            <p>{storeConfig?.footer_text || `© 2025 ${storeConfig?.store_name || 'Loja Demo'}`}</p>
          </footer>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.slug as string
  const theme = await getThemeBySlug(slug)
  
  if (!theme) return { notFound: true }

  const [products, banners, widgets, storeConfig] = await Promise.all([
    getProducts(theme.id),
    getDemoBanners(theme.id),
    getActiveWidgetsByTheme(theme.id),
    getStoreConfig(theme.id)
  ])

  const colors = theme.color_config ? { ...defaultColors, ...theme.color_config } : defaultColors
  const layoutConfig = theme.layout_config ? { ...defaultLayoutConfig, ...theme.layout_config } : defaultLayoutConfig
  const injectedCss = generateBaseCss(colors)

  return {
    props: {
      theme: { id: theme.id, name: theme.name, slug: theme.slug },
      products,
      banners,
      widgets,
      colors,
      layoutConfig,
      storeConfig,
      injectedCss,
    },
  }
}
