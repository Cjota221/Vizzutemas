import supabase from './client'
import { Theme, ThemeCSS, ThemeWidget, ThemeBanner, DemoProduct, ColorConfig, PageType } from '../types'

/**
 * Funções de acesso à tabela themes, theme_css, theme_widgets, theme_banners e demo_products
 */

// Lista todos os temas (publicados)
export async function listThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erro ao listar temas:', error)
    return []
  }
  return (data || []) as Theme[]
}

// Lista apenas temas publicados (para visitantes)
export async function listPublishedThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erro ao listar temas publicados:', error)
    return []
  }
  return (data || []) as Theme[]
}

// Busca um tema pelo slug
export async function getThemeBySlug(slug: string): Promise<Theme | null> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .single()
  
  if (error) {
    console.error('Erro ao buscar tema por slug:', error)
    return null
  }
  return data as Theme
}

// Busca um tema pelo ID
export async function getThemeById(id: string): Promise<Theme | null> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .limit(1)
    .single()
  
  if (error) {
    console.error('Erro ao buscar tema por id:', error)
    return null
  }
  return data as Theme
}

// Cria um novo tema
export async function createTheme(payload: Partial<Theme>): Promise<Theme | null> {
  const { data, error } = await supabase
    .from('themes')
    .insert(payload)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar tema:', error)
    return null
  }
  return data as Theme
}

// Atualiza um tema existente
export async function updateTheme(id: string, payload: Partial<Theme>): Promise<Theme | null> {
  const { data, error } = await supabase
    .from('themes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar tema:', error)
    return null
  }
  return data as Theme
}

// =============================================
// FUNÇÕES PARA CSS DO TEMA
// =============================================

// Busca CSS de uma página específica (ou global se page_type não existir)
export async function getCssByPage(theme_id: string, page_type: PageType): Promise<ThemeCSS | null> {
  // Tenta buscar por page_type primeiro
  const { data, error } = await supabase
    .from('theme_css')
    .select('*')
    .eq('theme_id', theme_id)
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') { // Ignora erro de não encontrado
    // Se der erro de coluna não existir, retorna null
    if (error.code === '42703') {
      console.log('Coluna page_type não existe, usando CSS global')
    } else {
      console.error('Erro ao buscar CSS da página:', error)
    }
    return null
  }
  return data as ThemeCSS | null
}

// Busca todos os CSS de um tema
export async function getAllCssByTheme(theme_id: string): Promise<ThemeCSS[]> {
  const { data, error } = await supabase
    .from('theme_css')
    .select('*')
    .eq('theme_id', theme_id)
  
  if (error) {
    // Se der erro de coluna, ignora silenciosamente
    if (error.code === '42703') {
      console.log('Coluna page_type não existe, retornando array vazio')
      return []
    }
    console.error('Erro ao buscar CSS do tema:', error)
    return []
  }
  return (data || []) as ThemeCSS[]
}

// Insere ou atualiza CSS (global ou por página)
export async function upsertCssByPage(
  theme_id: string, 
  page_type: PageType,
  css_code: string
): Promise<ThemeCSS | null> {
  const { data, error } = await supabase
    .from('theme_css')
    .upsert(
      { theme_id, page_type, css_code },
      { onConflict: 'theme_id,page_type' }
    )
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao salvar CSS:', error)
    return null
  }
  return data as ThemeCSS
}

// Gera CSS base com variáveis das cores
export function generateBaseCss(colors: ColorConfig): string {
  return `/* ========================================
   VARIÁVEIS DE CORES DO TEMA - VIZZUTEMAS
   Essas variáveis são usadas em todo o CSS
   ======================================== */

:root {
  /* === VARIÁVEIS PRINCIPAIS (Português) === */
  
  /* Fundo */
  --cor-fundo-pagina: ${colors.cor_fundo_pagina};
  --cor-detalhes-fundo: ${colors.cor_detalhes_fundo};
  
  /* Cabeçalho */
  --cor-fundo-barra-superior: ${colors.cor_fundo_barra_superior};
  --cor-botoes-cabecalho: ${colors.cor_botoes_cabecalho};
  --cor-fundo-cabecalho: ${colors.cor_fundo_cabecalho};
  
  /* Botões */
  --cor-botao-enviar-pedido: ${colors.cor_botao_enviar_pedido};
  --cor-demais-botoes: ${colors.cor_demais_botoes};
  --cor-detalhes-gerais: ${colors.cor_detalhes_gerais};
  
  /* Banner e Catálogo */
  --cor-fundo-banner-catalogo: ${colors.cor_fundo_banner_catalogo};
  
  /* Menu */
  --cor-fundo-menu-desktop: ${colors.cor_fundo_menu_desktop};
  --cor-fundo-submenu-desktop: ${colors.cor_fundo_submenu_desktop};
  --cor-fundo-menu-mobile: ${colors.cor_fundo_menu_mobile};
  
  /* Rodapé */
  --cor-fundo-rodape: ${colors.cor_fundo_rodape};

  /* === ALIASES PARA COMPATIBILIDADE COM WIDGETS === */
  /* Widgets podem usar esses nomes genéricos */
  
  --primary-color: ${colors.cor_botao_enviar_pedido};
  --cor-primaria: ${colors.cor_botao_enviar_pedido};
  --accent-color: ${colors.cor_detalhes_gerais};
  --cor-destaque: ${colors.cor_detalhes_gerais};
  --cor-secundaria: ${colors.cor_demais_botoes};
  --secondary-color: ${colors.cor_demais_botoes};
  --bg-color: ${colors.cor_fundo_pagina};
  --header-bg: ${colors.cor_fundo_cabecalho};
  --footer-bg: ${colors.cor_fundo_rodape};
  --card-bg: ${colors.cor_detalhes_fundo};
}

/* ========================================
   ESTILOS BASE
   ======================================== */

body {
  background-color: var(--cor-fundo-pagina);
}

.header, header, .navbar {
  background-color: var(--cor-fundo-cabecalho);
}

.header-top, .top-bar {
  background-color: var(--cor-fundo-barra-superior);
}

.header-buttons, .header .btn, .header a {
  color: var(--cor-botoes-cabecalho);
}

/* Botão principal (Enviar Pedido, Comprar) */
.btn-primary, .btn-enviar, .btn-checkout, .btn-comprar {
  background-color: var(--cor-botao-enviar-pedido);
  border-color: var(--cor-botao-enviar-pedido);
  color: #ffffff;
}

.btn-primary:hover, .btn-enviar:hover {
  filter: brightness(1.1);
}

/* Demais botões */
.btn-secondary, .btn-outline, .btn-add-cart {
  background-color: var(--cor-demais-botoes);
  border-color: var(--cor-demais-botoes);
  color: #ffffff;
}

/* Detalhes gerais (bordas, ícones, links) */
.details, .icon, .link-destaque, .badge, .tag {
  color: var(--cor-detalhes-gerais);
  border-color: var(--cor-detalhes-gerais);
}

/* Banner do catálogo */
.catalog-banner, .banner-categoria {
  background-color: var(--cor-fundo-banner-catalogo);
}

/* Menu Desktop */
.menu-desktop, .nav-desktop {
  background-color: var(--cor-fundo-menu-desktop);
}

.submenu-desktop, .dropdown-menu {
  background-color: var(--cor-fundo-submenu-desktop);
}

/* Menu Mobile */
.menu-mobile, .nav-mobile, .mobile-menu {
  background-color: var(--cor-fundo-menu-mobile);
}

/* Rodapé */
footer, .footer {
  background-color: var(--cor-fundo-rodape);
  color: #ffffff;
}

/* Detalhes do fundo */
.card, .product-card, .box, .panel {
  background-color: var(--cor-detalhes-fundo);
}`
}

// =============================================
// FUNÇÕES PARA WIDGETS
// =============================================

// Lista todos os widgets de um tema
export async function getWidgetsByTheme(theme_id: string): Promise<ThemeWidget[]> {
  const { data, error } = await supabase
    .from('theme_widgets')
    .select('*')
    .eq('theme_id', theme_id)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar widgets do tema:', error)
    return []
  }
  return (data || []) as ThemeWidget[]
}

// Lista apenas widgets ativos de um tema
export async function getActiveWidgetsByTheme(theme_id: string): Promise<ThemeWidget[]> {
  const { data, error } = await supabase
    .from('theme_widgets')
    .select('*')
    .eq('theme_id', theme_id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar widgets ativos:', error)
    return []
  }
  return (data || []) as ThemeWidget[]
}

// Busca um widget pelo ID
export async function getWidgetById(id: string): Promise<ThemeWidget | null> {
  const { data, error } = await supabase
    .from('theme_widgets')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Erro ao buscar widget:', error)
    return null
  }
  return data as ThemeWidget
}

// Cria um novo widget
export async function createWidget(payload: Partial<ThemeWidget>): Promise<ThemeWidget | null> {
  const { data, error } = await supabase
    .from('theme_widgets')
    .insert(payload)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar widget:', error)
    return null
  }
  return data as ThemeWidget
}

// Atualiza um widget
export async function updateWidget(id: string, payload: Partial<ThemeWidget>): Promise<ThemeWidget | null> {
  const { data, error } = await supabase
    .from('theme_widgets')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar widget:', error)
    return null
  }
  return data as ThemeWidget
}

// Deleta um widget
export async function deleteWidget(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('theme_widgets')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao deletar widget:', error)
    return false
  }
  return true
}

// Reordena widgets (atualiza display_order de múltiplos widgets)
export async function reorderWidgets(widgets: { id: string; display_order: number }[]): Promise<boolean> {
  try {
    // Atualiza cada widget individualmente
    const promises = widgets.map(({ id, display_order }) =>
      supabase
        .from('theme_widgets')
        .update({ display_order })
        .eq('id', id)
    )
    
    await Promise.all(promises)
    return true
  } catch (error) {
    console.error('Erro ao reordenar widgets:', error)
    return false
  }
}

// =============================================
// FUNÇÕES PARA BANNERS
// =============================================

// Lista todos os banners de um tema
export async function getBannersByTheme(theme_id: string): Promise<ThemeBanner[]> {
  const { data, error } = await supabase
    .from('theme_banners')
    .select('*')
    .eq('theme_id', theme_id)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar banners:', error)
    return []
  }
  return (data || []) as ThemeBanner[]
}

// Lista banners ativos de um tema
export async function getActiveBannersByTheme(theme_id: string): Promise<ThemeBanner[]> {
  const { data, error } = await supabase
    .from('theme_banners')
    .select('*')
    .eq('theme_id', theme_id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar banners ativos:', error)
    return []
  }
  return (data || []) as ThemeBanner[]
}

// Cria um novo banner
export async function createBanner(payload: Partial<ThemeBanner>): Promise<ThemeBanner | null> {
  const { data, error } = await supabase
    .from('theme_banners')
    .insert(payload)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar banner:', error)
    return null
  }
  return data as ThemeBanner
}

// Atualiza um banner
export async function updateBanner(id: string, payload: Partial<ThemeBanner>): Promise<ThemeBanner | null> {
  const { data, error } = await supabase
    .from('theme_banners')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar banner:', error)
    return null
  }
  return data as ThemeBanner
}

// Deleta um banner
export async function deleteBanner(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('theme_banners')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao deletar banner:', error)
    return false
  }
  return true
}

// Reordena banners
export async function reorderBanners(banners: { id: string; display_order: number }[]): Promise<boolean> {
  try {
    const promises = banners.map(({ id, display_order }) =>
      supabase
        .from('theme_banners')
        .update({ display_order })
        .eq('id', id)
    )
    await Promise.all(promises)
    return true
  } catch (error) {
    console.error('Erro ao reordenar banners:', error)
    return false
  }
}

// =============================================
// FUNÇÕES PARA PRODUTOS DEMO
// =============================================

// Lista todos os produtos demo
export async function getAllDemoProducts(): Promise<DemoProduct[]> {
  const { data, error } = await supabase
    .from('demo_products')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar produtos demo:', error)
    return []
  }
  return (data || []) as DemoProduct[]
}

// Lista produtos demo por categoria
export async function getDemoProductsByCategory(category: string): Promise<DemoProduct[]> {
  const { data, error } = await supabase
    .from('demo_products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar produtos por categoria:', error)
    return []
  }
  return (data || []) as DemoProduct[]
}

// =============================================
// FUNÇÕES PARA CORES DO TEMA
// =============================================

// Atualiza a paleta de cores do tema
export async function updateThemeColors(theme_id: string, color_config: ColorConfig): Promise<boolean> {
  const { error } = await supabase
    .from('themes')
    .update({ color_config })
    .eq('id', theme_id)
  
  if (error) {
    console.error('Erro ao atualizar cores do tema:', error)
    return false
  }
  return true
}


