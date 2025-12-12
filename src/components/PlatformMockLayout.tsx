import Head from 'next/head'
import { ReactNode, useState } from 'react'
import { ColorConfig } from '@/lib/types'
import CatalogPage from './platform/CatalogPage'
import HomePage from './platform/HomePage'

type PageView = 'home' | 'catalog' | 'product'

type Props = {
  children?: ReactNode
  injectedCss?: string
  colorConfig?: ColorConfig | null
  defaultView?: PageView
}

// Cores padrão caso não tenha configuração
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

/**
 * PlatformMockLayout - Carcaça HTML que imita a plataforma de e-commerce
 * 
 * IMPORTANTE: Esta estrutura simula a plataforma real onde os temas serão aplicados.
 * As cores são aplicadas diretamente via style para mostrar como ficará na loja do cliente.
 */
export default function PlatformMockLayout({ children, injectedCss, colorConfig, defaultView = 'catalog' }: Props) {
  const colors = { ...defaultColors, ...colorConfig }
  const [currentView, setCurrentView] = useState<PageView>(defaultView)

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.cor_fundo_pagina }}>
      <Head>
        <title>Preview - Vizzutemas</title>
        {/* CSS customizado injetado */}
        {injectedCss && <style dangerouslySetInnerHTML={{ __html: injectedCss }} />}
      </Head>

      {/* Seletor de visualização */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-center gap-4 text-sm">
        <span className="text-gray-400">Visualizar:</span>
        <button 
          onClick={() => setCurrentView('catalog')}
          className={`px-3 py-1 rounded ${currentView === 'catalog' ? 'bg-pink-500' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          📱 Catálogo
        </button>
        <button 
          onClick={() => setCurrentView('home')}
          className={`px-3 py-1 rounded ${currentView === 'home' ? 'bg-pink-500' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          🏠 Home
        </button>
      </div>

      {/* Renderiza a view selecionada */}
      {currentView === 'catalog' ? (
        /* CATÁLOGO = Página de Produtos (sem widgets) */
        <CatalogPage colors={colors} />
      ) : (
        /* HOME = Página Inicial (com widgets) */
        <HomePage colors={colors}>
          {children}
        </HomePage>
      )}
    </div>
  )
}
