import { useState, useEffect } from 'react'
import { ColorConfig } from '@/lib/types'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'

// Produtos de demonstração - RASTEIRINHAS
const demoProducts = [
  {
    id: '1',
    name: 'Rasteirinha Feminina Havaiana com Strass Rose Elegance Strass Novo',
    price: 25.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', alt: 'Rasteira 1' },
    ],
    badge: 'destaque' as const,
    installments: 12,
    tag: 'FEMININO',
    variations: [
      { size: '33/34', sku: 'RST001.1', available: true },
      { size: '35/36', sku: 'RST001.2', available: true },
      { size: '37/38', sku: 'RST001.3', available: true },
    ]
  },
  {
    id: '2',
    name: 'Rasteirinha Feminina Soft Rose Elegance/ Strass Novo',
    price: 37.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', alt: 'Rasteira 2' },
    ],
    badge: 'destaque' as const,
    installments: 12,
    tag: 'FEMININO',
    variations: [
      { size: '33/34', sku: 'RST002.1', available: true },
      { size: '35/36', sku: 'RST002.2', available: true },
    ]
  },
  {
    id: '3',
    name: 'Sandália Rasteira Dourada Luxo Pedraria',
    price: 42.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', alt: 'Rasteira 3' },
    ],
    badge: 'destaque' as const,
    installments: 12,
    tag: 'FEMININO',
    variations: [
      { size: '35/36', sku: 'RST003.1', available: true },
      { size: '37/38', sku: 'RST003.2', available: true },
    ]
  },
  {
    id: '4',
    name: 'Rasteira Trançada Caramelo Premium',
    price: 29.90,
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', alt: 'Rasteira 4' },
    ],
    badge: 'destaque' as const,
    installments: 12,
    tag: 'FEMININO',
    variations: [
      { size: '33/34', sku: 'RST004.1', available: true },
      { size: '35/36', sku: 'RST004.2', available: true },
    ]
  },
  {
    id: '5',
    name: 'Sandália Flat Nude com Strass',
    price: 35.00,
    originalPrice: 45.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', alt: 'Rasteira 5' },
    ],
    installments: 12,
    tag: 'FEMININO',
    variations: [
      { size: '35/36', sku: 'RST005.1', available: true },
      { size: '37/38', sku: 'RST005.2', available: true },
    ]
  },
  {
    id: '6',
    name: 'Rasteirinha Confort Preta Básica',
    price: 22.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', alt: 'Rasteira 6' },
    ],
    installments: 12,
    tag: 'FEMININO',
    variations: [
      { size: '33/34', sku: 'RST006.1', available: true },
      { size: '35/36', sku: 'RST006.2', available: true },
    ]
  },
  {
    id: '7',
    name: 'Sandália Rasteira Branca Perolada',
    price: 38.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', alt: 'Rasteira 7' },
    ],
    installments: 12,
    tag: 'FEMININO',
    variations: [
      { size: '35/36', sku: 'RST007.1', available: true },
      { size: '37/38', sku: 'RST007.2', available: true },
    ]
  },
  {
    id: '8',
    name: 'Rasteira Metalizada Rose Gold',
    price: 45.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', alt: 'Rasteira 8' },
    ],
    installments: 12,
    tag: 'FEMININO',
    variations: [
      { size: '33/34', sku: 'RST008.1', available: true },
      { size: '35/36', sku: 'RST008.2', available: true },
    ]
  },
]

type Props = {
  colors: ColorConfig
}

export default function CatalogPage({ colors }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<typeof demoProducts[0] | null>(null)
  const [cartCount, setCartCount] = useState(2)
  const [cartTotal, setCartTotal] = useState(117.00)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(true)

  // Esconde a busca no scroll
  useEffect(() => {
    let lastScrollY = 0
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowSearch(false)
      } else if (currentScrollY < lastScrollY) {
        setShowSearch(true)
      }
      lastScrollY = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleQuero = (product: typeof demoProducts[0]) => {
    setCartCount(prev => prev + 1)
    setCartTotal(prev => prev + product.price)
  }

  const handleAddToCart = () => {
    if (selectedProduct) {
      setCartCount(prev => prev + 1)
      setCartTotal(prev => prev + selectedProduct.price)
      setSelectedProduct(null)
    }
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: colors.cor_fundo_pagina }}>
      {/* Barra Superior */}
      <div 
        className="text-center py-2 text-xs font-medium text-white"
        style={{ backgroundColor: colors.cor_fundo_barra_superior }}
      >
        🎁 6 pares variados. Aproveite!!! &nbsp;&nbsp; Use o Cupom <strong>PRIMEIRACOMPRA</strong>
      </div>

      {/* Header */}
      <header 
        className="sticky top-0 z-40 shadow-sm"
        style={{ backgroundColor: colors.cor_fundo_cabecalho }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          {/* Logo */}
          <div 
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden"
            style={{ borderColor: colors.cor_botoes_cabecalho }}
          >
            <span className="text-[8px] font-bold" style={{ color: colors.cor_botoes_cabecalho }}>LOGO</span>
          </div>

          {/* Ícones do Header - exatamente como na plataforma */}
          <div className="flex items-center gap-1">
            {/* Casinha (Home) */}
            <button 
              className="w-9 h-9 rounded flex items-center justify-center text-white"
              style={{ backgroundColor: colors.cor_botoes_cabecalho }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </button>

            {/* Cadeado (Login) */}
            <button 
              className="w-9 h-9 rounded flex items-center justify-center text-white"
              style={{ backgroundColor: colors.cor_botoes_cabecalho }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </button>

            {/* Contador quantidade */}
            <div 
              className="w-9 h-9 rounded flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: colors.cor_botoes_cabecalho }}
            >
              {cartCount}
            </div>

            {/* Valor + Carrinho */}
            <button 
              className="h-9 px-2 rounded flex items-center gap-1 text-white text-sm font-medium"
              style={{ backgroundColor: colors.cor_botoes_cabecalho }}
            >
              R${cartTotal.toFixed(2).replace('.', ',')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>

            {/* Menu Hambúrguer */}
            <button 
              className="w-9 h-9 rounded flex items-center justify-center text-white"
              style={{ backgroundColor: colors.cor_botoes_cabecalho }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Campo de Busca - some no scroll */}
        <div 
          className={`px-3 pb-3 transition-all duration-300 ${showSearch ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden pb-0'}`}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar Produtos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none"
              style={{ backgroundColor: '#ffffff' }}
            />
            <button 
              className="absolute right-0 top-0 h-full px-4 rounded-r-lg text-white"
              style={{ backgroundColor: colors.cor_botoes_cabecalho }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Filtro e Ordenação */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.cor_detalhes_fundo }}>
        <button 
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: colors.cor_botoes_cabecalho }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtrar
        </button>
        
        <div className="flex items-center gap-2">
          <select 
            className="text-sm border-0 bg-transparent font-medium focus:outline-none"
            style={{ color: colors.cor_botoes_cabecalho }}
          >
            <option>Destaque</option>
            <option>Menor Preço</option>
            <option>Maior Preço</option>
            <option>A-Z</option>
          </select>
          <svg className="w-5 h-5" fill="none" stroke={colors.cor_botoes_cabecalho} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
      </div>

      {/* Título da Categoria */}
      <div className="px-4 pt-6 pb-4">
        <h1 
          className="text-2xl font-bold text-center"
          style={{ color: colors.cor_botoes_cabecalho }}
        >
          RASTEIRAS
        </h1>
        <div 
          className="w-16 h-1 mx-auto mt-2 rounded"
          style={{ backgroundColor: colors.cor_botoes_cabecalho }}
        />
      </div>

      {/* Grid de Produtos - 2 cols mobile, 3 tablet, 6 desktop */}
      <div className="px-4 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {demoProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images[0].url,
                badge: product.badge,
                installments: product.installments,
              }}
              colors={colors}
              onQuero={() => handleQuero(product)}
              onOpenProduct={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      </div>

      {/* Botão WhatsApp flutuante - REDONDINHO */}
      <button 
        className="fixed bottom-20 left-4 w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:bg-green-600 transition"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>

      {/* Ícone de carrinho flutuante no canto direito */}
      <div 
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 overflow-hidden border-2"
        style={{ backgroundColor: colors.cor_fundo_pagina, borderColor: colors.cor_botoes_cabecalho }}
      >
        <img 
          src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=100" 
          alt="Produto"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Barra Inferior - Finalizar Pedido */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
      >
        <button className="w-full py-4 text-white font-bold text-lg flex items-center justify-center gap-2">
          FINALIZAR PEDIDO
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* Modal do Produto */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          colors={colors}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}
