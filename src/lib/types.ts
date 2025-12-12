/**
 * Tipos TypeScript para o sistema Vizzutemas
 */

// Configuração de cores do tema (igual à plataforma)
export type ColorConfig = {
  cor_fundo_pagina: string              // Cor do fundo da página
  cor_detalhes_fundo: string            // Cor dos detalhes do fundo da página
  cor_fundo_barra_superior: string      // Cor do fundo da barra superior
  cor_botoes_cabecalho: string          // Cor dos botões do cabeçalho
  cor_fundo_cabecalho: string           // Cor do fundo do cabeçalho
  cor_botao_enviar_pedido: string       // Cor do botão "Enviar Pedido"
  cor_demais_botoes: string             // Cor dos demais botões
  cor_detalhes_gerais: string           // Cor dos detalhes gerais
  cor_fundo_banner_catalogo: string     // Cor do fundo do banner do catálogo
  cor_fundo_menu_desktop: string        // Cor do fundo do menu desktop
  cor_fundo_submenu_desktop: string     // Cor do fundo do submenu desktop
  cor_fundo_menu_mobile: string         // Cor do fundo do menu mobile
  cor_fundo_rodape: string              // Cor do fundo do rodapé
}

// Tipo de página para CSS específico
export type PageType = 'home' | 'produto' | 'carrinho' | 'checkout'

// Tema - representa um tema disponível na plataforma
export type Theme = {
  id: string
  name: string
  slug: string
  description?: string
  price?: number
  thumbnail_url?: string
  status?: 'draft' | 'published' | 'archived'
  color_config?: ColorConfig
  created_at?: string
}

// CSS do tema por página
export type ThemeCSS = {
  id: string
  theme_id: string
  page_type: PageType              // Tipo de página (home, produto, carrinho, checkout)
  css_code: string                 // CSS específico da página
  created_at?: string
  updated_at?: string
}

// Widget personalizado do tema
export type ThemeWidget = {
  id: string
  theme_id: string
  name: string
  widget_type: 'html' | 'image_slider' | 'product_carousel' | 'text' | 'banner' | 'custom'
  html_content?: string
  config?: Record<string, any> // Configurações específicas do widget
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Banner do tema (imagens desktop/mobile)
export type ThemeBanner = {
  id: string
  theme_id: string
  name: string
  image_desktop: string
  image_mobile: string
  link_url?: string
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Produto de demonstração
export type DemoProduct = {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  original_price?: number
  category: 'calcados' | 'eletronicos' | 'infantil' | 'moda' | 'acessorios' | 'casa'
  image_url: string
  images?: string[]
  badge?: 'novo' | 'promocao' | 'mais_vendido'
  is_active: boolean
  display_order: number
  created_at?: string
  updated_at?: string
}

// Pedido de compra de tema
export type Order = {
  id: string
  theme_id: string
  customer_name: string
  customer_email: string
  notes?: string
  status?: 'pending' | 'paid' | 'cancelled' | 'delivered'
  created_at?: string
  // Campo virtual (join com themes)
  themes?: { name: string }
}
