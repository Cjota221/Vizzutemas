import { useState, useRef, ReactNode } from 'react'
import { ColorConfig } from '@/lib/types'

// Produtos de demonstração para carrossel
const carouselProducts = [
  { id: '1', name: 'Rasteirinha Nude', price: 29.90, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200' },
  { id: '2', name: 'Sandália Dourada', price: 34.90, image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=200' },
  { id: '3', name: 'Chinelo Confort', price: 19.90, image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=200' },
  { id: '4', name: 'Tamanco Rosa', price: 45.90, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200' },
  { id: '5', name: 'Sandália Preta', price: 39.90, image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=200' },
  { id: '6', name: 'Rasteira Caramelo', price: 32.90, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200' },
]

type Props = {
  colors: ColorConfig
  children?: ReactNode // Para widgets injetados
}

export default function HomePage({ colors, children }: Props) {
  const [cartCount] = useState(15)
  const [searchQuery, setSearchQuery] = useState('')
  const carouselRef = useRef<HTMLDivElement>(null)

  // Scroll do carrossel
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen pb-4" style={{ backgroundColor: colors.cor_fundo_pagina }}>
      {/* Barra Superior */}
      <div 
        className="text-center py-2 text-xs font-bold text-white tracking-wide"
        style={{ backgroundColor: colors.cor_fundo_barra_superior }}
      >
        VENDAS APENAS NO ATACADO • PEDIDO MÍNIMO 5 PEÇAS
      </div>

      {/* Header */}
      <header 
        className="sticky top-0 z-40"
        style={{ backgroundColor: colors.cor_fundo_cabecalho }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Hambúrguer */}
          <button style={{ color: colors.cor_botoes_cabecalho }}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo Central */}
          <div 
            className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: colors.cor_botoes_cabecalho }}
          >
            <div className="text-center">
              <span className="text-[8px] font-bold" style={{ color: colors.cor_botoes_cabecalho }}>👑</span>
              <div className="text-[6px] font-bold" style={{ color: colors.cor_botoes_cabecalho }}>LOGO</div>
            </div>
          </div>

          {/* Carrinho */}
          <div className="flex items-center gap-1">
            <svg className="w-7 h-7" fill="none" stroke={colors.cor_botoes_cabecalho} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span 
              className="text-sm font-bold"
              style={{ color: colors.cor_botoes_cabecalho }}
            >
              {cartCount}
            </span>
          </div>
        </div>

        {/* Campo de Busca */}
        <div className="px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar Produtos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-full border-2 text-sm focus:outline-none"
              style={{ 
                borderColor: colors.cor_botoes_cabecalho,
                color: colors.cor_botoes_cabecalho
              }}
            />
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.cor_botoes_cabecalho }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Widget de Frete Grátis */}
      <div 
        className="flex items-center justify-center gap-3 py-3 px-4"
        style={{ backgroundColor: colors.cor_detalhes_fundo }}
      >
        <span className="text-2xl">🚚</span>
        <div>
          <span 
            className="font-bold text-sm"
            style={{ color: colors.cor_botoes_cabecalho }}
          >
            FRETE GRÁTIS
          </span>
          <span className="text-xs text-gray-600 ml-1">PARA TODO O BRASIL</span>
        </div>
        <div className="text-xs text-gray-500">
          EM COMPRAS ACIMA DE{' '}
          <span className="font-bold" style={{ color: colors.cor_botoes_cabecalho }}>
            R$ 2.000,00
          </span>
        </div>
      </div>

      {/* Banner Principal */}
      <div 
        className="relative w-full aspect-[4/3] overflow-hidden"
        style={{ backgroundColor: colors.cor_fundo_banner_catalogo }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-3xl mb-2">👑</div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: colors.cor_botoes_cabecalho }}
            >
              Atacadista
            </h2>
            <h1 
              className="text-5xl font-black mb-4"
              style={{ color: colors.cor_botoes_cabecalho }}
            >
              LOJA
            </h1>
            <div 
              className="inline-block px-4 py-2 text-white font-bold text-lg"
              style={{ backgroundColor: colors.cor_botoes_cabecalho }}
            >
              SEJA UMA REVENDEDORA
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="flex items-center justify-center gap-1">
                🛒 Pedido mínimo de apenas{' '}
                <span 
                  className="px-2 py-0.5 text-white font-bold"
                  style={{ backgroundColor: colors.cor_detalhes_gerais }}
                >
                  5 peças
                </span>
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              ⏱️ Envio garantido em até 72 horas úteis. Aproveite!
            </div>
          </div>
        </div>
      </div>

      {/* Carrossel de Vantagens */}
      <div className="overflow-x-auto py-4 px-4">
        <div className="flex gap-4 min-w-max">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>⏱️</span>
            <span>72 horas úteis</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span>💳</span>
            <div>
              <div className="font-bold" style={{ color: colors.cor_botoes_cabecalho }}>PARCELAMENTO</div>
              <div className="text-gray-500">Dividimos até 12 vezes</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span>🚚</span>
            <div>
              <div className="font-bold" style={{ color: colors.cor_botoes_cabecalho }}>FRETE GRÁTIS</div>
              <div className="text-gray-500">Acima de R$ 2.000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget de Cupom */}
      <div className="px-4 py-4">
        <div 
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: '#FEF3C7' }}
        >
          <div className="text-3xl mb-2">🎁</div>
          <div className="text-xs text-gray-600 mb-1">PRESENTE DE BOAS-VINDAS</div>
          <div className="text-lg font-bold text-gray-800">
            GANHE <span style={{ color: colors.cor_botoes_cabecalho }}>5% OFF</span> NA PRIMEIRA COMPRA
          </div>
          <div className="mt-4 flex items-center justify-between bg-white rounded-lg p-3">
            <span 
              className="font-bold tracking-wider"
              style={{ color: colors.cor_botoes_cabecalho }}
            >
              PRIMEIRACOMPRA
            </span>
            <button 
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: colors.cor_botoes_cabecalho }}
            >
              📋 COPIAR
            </button>
          </div>
        </div>
      </div>

      {/* Widgets injetados (CSS customizado) */}
      {children && (
        <div className="px-4 py-2">
          {children}
        </div>
      )}

      {/* Carrossel de Produtos */}
      <div className="py-4">
        <div className="relative">
          {/* Botões de navegação */}
          <button 
            onClick={() => scrollCarousel('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
            style={{ color: colors.cor_botoes_cabecalho }}
          >
            ‹
          </button>
          <button 
            onClick={() => scrollCarousel('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
            style={{ color: colors.cor_botoes_cabecalho }}
          >
            ›
          </button>

          {/* Carrossel */}
          <div 
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {carouselProducts.map((product) => (
              <div 
                key={product.id}
                className="flex-shrink-0 w-20"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div 
                  className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border"
                  style={{ borderColor: colors.cor_detalhes_fundo }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seção de Categorias ou mais conteúdo */}
      <div className="px-4 py-6">
        <h2 
          className="text-xl font-bold text-center mb-4"
          style={{ color: colors.cor_botoes_cabecalho }}
        >
          Novidades
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {carouselProducts.slice(0, 6).map((product) => (
            <div key={product.id} className="text-center">
              <div 
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2"
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-gray-600 truncate">{product.name}</p>
              <p 
                className="text-sm font-bold"
                style={{ color: colors.cor_botoes_cabecalho }}
              >
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="py-6 px-4 mt-4"
        style={{ backgroundColor: colors.cor_fundo_rodape }}
      >
        <div className="text-center text-white text-sm opacity-80">
          © 2025 Loja Demo - Preview Vizzutemas
        </div>
      </footer>
    </div>
  )
}
