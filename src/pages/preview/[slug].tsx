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
            className="flex-shrink-0 w-[150px] bg-white rounded-xl shadow-sm overflow-hidden border hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100 relative">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              {product.badge && (
                <span 
                  className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold text-white rounded"
                  style={{ backgroundColor: colors.cor_detalhes_gerais }}
                >
                  {product.badge === 'destaque' ? '⭐' : product.badge === 'novo' ? '🆕' : product.badge === 'promocao' ? '🔥' : '🏆'}
                </span>
              )}
            </div>
            <div className="p-2">
              <h3 className="text-xs font-medium text-gray-800 line-clamp-2 mb-1 h-8">{product.name}</h3>
              {product.original_price && (
                <p className="text-xs text-gray-400 line-through">R$ {product.original_price.toFixed(2)}</p>
              )}
              <p className="text-sm font-bold" style={{ color: colors.cor_detalhes_gerais }}>
                R$ {product.price.toFixed(2)}
              </p>
              <button 
                onClick={onAddCart} 
                className="w-full mt-2 py-1.5 text-white text-xs font-medium rounded-lg transition hover:opacity-90"
                style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
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

  const isMobile = viewMode === 'mobile'
  // Prioridade: layoutConfig.logo_url > storeConfig.store_logo
  const logoUrl = (layoutConfig as any)?.logo_url || storeConfig?.store_logo || null

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
                  <div 
                    className="widgets-section w-full overflow-hidden"
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
                  >
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
                    
                    {/* Filtrar widgets: se tiver widget_ids, mostrar só os selecionados */}
                    {(() => {
                      const sectionData = section as any
                      const filteredWidgets = sectionData.widget_ids && sectionData.widget_ids.length > 0
                        ? widgets.filter(w => w.is_active && sectionData.widget_ids.includes(w.id))
                        : widgets.filter(w => w.is_active)
                      
                      return filteredWidgets.sort((a, b) => a.display_order - b.display_order).map((widget, idx) => (
                        <div 
                          key={widget.id}
                          className="widget"
                          dangerouslySetInnerHTML={{ 
                            // Encapsula scripts em IIFE para evitar conflitos de variáveis
                            __html: (widget.html_content || '').replace(
                              /<script>([\s\S]*?)<\/script>/gi, 
                              (match, code) => `<script>(function(){${code}})();</script>`
                            )
                          }}
                        />
                      ))
                    })()}
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
