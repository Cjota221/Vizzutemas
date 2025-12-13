import supabase from './client'

// =====================================================
// TIPOS
// =====================================================

export type StoreConfig = {
  id: string
  theme_id: string
  // Identidade
  store_name: string
  store_logo: string | null
  store_favicon: string | null
  // Contato
  whatsapp: string
  whatsapp_message: string
  email: string
  instagram: string
  facebook: string
  // Barra Superior
  top_bar_text: string
  top_bar_enabled: boolean
  // Textos dos Botões
  btn_buy_text: string
  btn_add_cart_text: string
  btn_checkout_text: string
  btn_whatsapp_text: string
  // Frete Grátis
  free_shipping_enabled: boolean
  free_shipping_value: number
  free_shipping_text: string
  // Cupom
  coupon_enabled: boolean
  coupon_code: string
  coupon_discount: string
  coupon_text: string
  // Carrinho
  cart_title: string
  cart_empty_text: string
  // Rodapé
  footer_text: string
  footer_about: string
  // Parcelamento
  installments_max: number
  installments_text: string
  // SEO
  meta_title: string
  meta_description: string
}

export type DemoProduct = {
  id: string
  theme_id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  image_url: string
  images: string[]
  category: string | null
  subcategory: string | null
  badge: 'destaque' | 'promocao' | 'novo' | 'mais_vendido' | null
  sku: string | null
  stock: number
  variations: { type: string; options: string[] }[]
  installments: number | null
  sort_order: number
  is_active: boolean
  is_featured: boolean
  created_at: string
}

export type ThemeBanner = {
  id: string
  theme_id: string
  name: string
  image_desktop: string
  image_mobile: string | null
  link_url: string | null
  link_target: '_self' | '_blank'
  position: 'home_main' | 'home_secondary' | 'category_top'
  sort_order: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
}

export type ThemeCategory = {
  id: string
  theme_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  show_in_menu: boolean
}

export type ThemeWidget = {
  id: string
  theme_id: string
  name: string
  widget_type: 'html' | 'banner_carousel' | 'product_carousel' | 'text' | 'image' | 'video' | 'countdown' | 'newsletter'
  page: 'home' | 'product' | 'cart' | 'all'
  position: 'top_bar' | 'header' | 'content' | 'sidebar' | 'footer'
  content: string | null
  config: Record<string, unknown>
  custom_css: string | null
  sort_order: number
  is_active: boolean
}

export type HomeSection = {
  id: string
  theme_id: string
  section_type: 'banner' | 'products_featured' | 'products_new' | 'products_sale' | 'categories' | 'newsletter' | 'reviews' | 'custom_html'
  title: string | null
  subtitle: string | null
  config: Record<string, unknown>
  sort_order: number
  is_active: boolean
}

export type ThemeReview = {
  id: string
  theme_id: string
  product_id: string | null
  customer_name: string
  customer_avatar: string | null
  rating: number
  comment: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export type StoreButton = {
  id: string
  theme_id: string
  identificador: string
  texto: string
  cor_fundo: string
  cor_texto: string
  icone: string | null
  tamanho: string
  borda_raio: number
}

export type DemoBanner = {
  id: string
  theme_id: string
  title: string | null
  subtitle: string | null
  image_desktop: string
  image_mobile: string | null
  button_text: string | null
  button_link: string | null
  position: number
  is_active: boolean
}

// =====================================================
// STORE CONFIG
// =====================================================

export async function getStoreConfig(themeId: string): Promise<StoreConfig | null> {
  const { data, error } = await supabase
    .from('store_config')
    .select('*')
    .eq('theme_id', themeId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Não existe, criar config padrão
      return createDefaultStoreConfig(themeId)
    }
    console.error('Erro ao buscar config:', error)
    return null
  }
  return data as StoreConfig
}

export async function createDefaultStoreConfig(themeId: string): Promise<StoreConfig | null> {
  const { data, error } = await supabase
    .from('store_config')
    .insert({ theme_id: themeId })
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar config padrão:', error)
    return null
  }
  return data as StoreConfig
}

export async function updateStoreConfig(themeId: string, config: Partial<StoreConfig>): Promise<StoreConfig | null> {
  const { data, error } = await supabase
    .from('store_config')
    .upsert({ ...config, theme_id: themeId }, { onConflict: 'theme_id' })
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar config:', error)
    return null
  }
  return data as StoreConfig
}

// =====================================================
// DEMO PRODUCTS
// =====================================================

export async function getProducts(themeId: string): Promise<DemoProduct[]> {
  const { data, error } = await supabase
    .from('demo_products')
    .select('*')
    .eq('theme_id', themeId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }
  return (data || []) as DemoProduct[]
}

export async function getAllProducts(themeId: string): Promise<DemoProduct[]> {
  const { data, error } = await supabase
    .from('demo_products')
    .select('*')
    .eq('theme_id', themeId)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }
  return (data || []) as DemoProduct[]
}

export async function getFeaturedProducts(themeId: string, limit = 8): Promise<DemoProduct[]> {
  const { data, error } = await supabase
    .from('demo_products')
    .select('*')
    .eq('theme_id', themeId)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Erro ao buscar produtos destaque:', error)
    return []
  }
  return (data || []) as DemoProduct[]
}

export async function getProductsByCategory(themeId: string, category: string): Promise<DemoProduct[]> {
  const { data, error } = await supabase
    .from('demo_products')
    .select('*')
    .eq('theme_id', themeId)
    .eq('is_active', true)
    .eq('category', category)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar produtos por categoria:', error)
    return []
  }
  return (data || []) as DemoProduct[]
}

export async function createProduct(product: Partial<DemoProduct>): Promise<DemoProduct | null> {
  const { data, error } = await supabase
    .from('demo_products')
    .insert(product)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar produto:', error)
    return null
  }
  return data as DemoProduct
}

export async function updateProduct(id: string, product: Partial<DemoProduct>): Promise<DemoProduct | null> {
  const { data, error } = await supabase
    .from('demo_products')
    .update(product)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar produto:', error)
    return null
  }
  return data as DemoProduct
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('demo_products')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao excluir produto:', error)
    return false
  }
  return true
}

// =====================================================
// BANNERS
// =====================================================

export async function getBanners(themeId: string, position?: string): Promise<ThemeBanner[]> {
  let query = supabase
    .from('theme_banners')
    .select('*')
    .eq('theme_id', themeId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  
  if (position) {
    query = query.eq('position', position)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Erro ao buscar banners:', error)
    return []
  }
  return (data || []) as ThemeBanner[]
}

export async function getAllBanners(themeId: string): Promise<ThemeBanner[]> {
  const { data, error } = await supabase
    .from('theme_banners')
    .select('*')
    .eq('theme_id', themeId)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar banners:', error)
    return []
  }
  return (data || []) as ThemeBanner[]
}

export async function createBanner(banner: Partial<ThemeBanner>): Promise<ThemeBanner | null> {
  const { data, error } = await supabase
    .from('theme_banners')
    .insert(banner)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar banner:', error)
    return null
  }
  return data as ThemeBanner
}

export async function updateBanner(id: string, banner: Partial<ThemeBanner>): Promise<ThemeBanner | null> {
  const { data, error } = await supabase
    .from('theme_banners')
    .update(banner)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar banner:', error)
    return null
  }
  return data as ThemeBanner
}

export async function deleteBanner(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('theme_banners')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao excluir banner:', error)
    return false
  }
  return true
}

// =====================================================
// CATEGORIES
// =====================================================

export async function getCategories(themeId: string): Promise<ThemeCategory[]> {
  const { data, error } = await supabase
    .from('theme_categories')
    .select('*')
    .eq('theme_id', themeId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar categorias:', error)
    return []
  }
  return (data || []) as ThemeCategory[]
}

export async function getAllCategories(themeId: string): Promise<ThemeCategory[]> {
  const { data, error } = await supabase
    .from('theme_categories')
    .select('*')
    .eq('theme_id', themeId)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar categorias:', error)
    return []
  }
  return (data || []) as ThemeCategory[]
}

export async function createCategory(category: Partial<ThemeCategory>): Promise<ThemeCategory | null> {
  const { data, error } = await supabase
    .from('theme_categories')
    .insert(category)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar categoria:', error)
    return null
  }
  return data as ThemeCategory
}

export async function updateCategory(id: string, category: Partial<ThemeCategory>): Promise<ThemeCategory | null> {
  const { data, error } = await supabase
    .from('theme_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar categoria:', error)
    return null
  }
  return data as ThemeCategory
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('theme_categories')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao excluir categoria:', error)
    return false
  }
  return true
}

// =====================================================
// WIDGETS
// =====================================================

export async function getWidgets(themeId: string, page?: string): Promise<ThemeWidget[]> {
  let query = supabase
    .from('theme_widgets')
    .select('*')
    .eq('theme_id', themeId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  
  if (page) {
    query = query.or(`page.eq.${page},page.eq.all`)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Erro ao buscar widgets:', error)
    return []
  }
  return (data || []) as ThemeWidget[]
}

export async function getAllWidgets(themeId: string): Promise<ThemeWidget[]> {
  const { data, error } = await supabase
    .from('theme_widgets')
    .select('*')
    .eq('theme_id', themeId)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar widgets:', error)
    return []
  }
  return (data || []) as ThemeWidget[]
}

export async function createWidget(widget: Partial<ThemeWidget>): Promise<ThemeWidget | null> {
  const { data, error } = await supabase
    .from('theme_widgets')
    .insert(widget)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar widget:', error)
    return null
  }
  return data as ThemeWidget
}

export async function updateWidget(id: string, widget: Partial<ThemeWidget>): Promise<ThemeWidget | null> {
  const { data, error } = await supabase
    .from('theme_widgets')
    .update(widget)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar widget:', error)
    return null
  }
  return data as ThemeWidget
}

export async function deleteWidget(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('theme_widgets')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao excluir widget:', error)
    return false
  }
  return true
}

// =====================================================
// HOME SECTIONS
// =====================================================

export async function getHomeSections(themeId: string): Promise<HomeSection[]> {
  const { data, error } = await supabase
    .from('home_sections')
    .select('*')
    .eq('theme_id', themeId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar seções:', error)
    return []
  }
  return (data || []) as HomeSection[]
}

export async function getAllHomeSections(themeId: string): Promise<HomeSection[]> {
  const { data, error } = await supabase
    .from('home_sections')
    .select('*')
    .eq('theme_id', themeId)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar seções:', error)
    return []
  }
  return (data || []) as HomeSection[]
}

export async function createHomeSection(section: Partial<HomeSection>): Promise<HomeSection | null> {
  const { data, error } = await supabase
    .from('home_sections')
    .insert(section)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar seção:', error)
    return null
  }
  return data as HomeSection
}

export async function updateHomeSection(id: string, section: Partial<HomeSection>): Promise<HomeSection | null> {
  const { data, error } = await supabase
    .from('home_sections')
    .update(section)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar seção:', error)
    return null
  }
  return data as HomeSection
}

export async function deleteHomeSection(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('home_sections')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao excluir seção:', error)
    return false
  }
  return true
}

// =====================================================
// REVIEWS
// =====================================================

export async function getReviews(themeId: string, productId?: string): Promise<ThemeReview[]> {
  let query = supabase
    .from('theme_reviews')
    .select('*')
    .eq('theme_id', themeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (productId) {
    query = query.eq('product_id', productId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Erro ao buscar reviews:', error)
    return []
  }
  return (data || []) as ThemeReview[]
}

export async function createReview(review: Partial<ThemeReview>): Promise<ThemeReview | null> {
  const { data, error } = await supabase
    .from('theme_reviews')
    .insert(review)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar review:', error)
    return null
  }
  return data as ThemeReview
}

export async function deleteReview(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('theme_reviews')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao excluir review:', error)
    return false
  }
  return true
}

// =====================================================
// STORE BUTTONS
// =====================================================

export async function getStoreButtons(themeId: string): Promise<StoreButton[]> {
  const { data, error } = await supabase
    .from('store_buttons')
    .select('*')
    .eq('theme_id', themeId)
  
  if (error) {
    console.error('Erro ao buscar botões:', error)
    return []
  }
  return data as StoreButton[]
}

// Alias para demo_banners
export async function getDemoBanners(themeId: string): Promise<DemoBanner[]> {
  const { data, error } = await supabase
    .from('demo_banners')
    .select('*')
    .eq('theme_id', themeId)
    .order('position', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar banners demo:', error)
    return []
  }
  return data as DemoBanner[]
}

export async function createDemoBanner(banner: Partial<DemoBanner>): Promise<DemoBanner | null> {
  const { data, error } = await supabase
    .from('demo_banners')
    .insert(banner)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar banner demo:', error)
    return null
  }
  return data as DemoBanner
}

export async function updateDemoBanner(id: string, banner: Partial<DemoBanner>): Promise<DemoBanner | null> {
  const { data, error } = await supabase
    .from('demo_banners')
    .update(banner)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar banner demo:', error)
    return null
  }
  return data as DemoBanner
}

export async function deleteDemoBanner(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('demo_banners')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao deletar banner demo:', error)
    return false
  }
  return true
}

// =====================================================
// INICIALIZAÇÃO DE TEMA NOVO
// =====================================================

export async function initializeThemeData(themeId: string): Promise<void> {
  // Criar config padrão
  await createDefaultStoreConfig(themeId)
  
  // Criar seções padrão da home
  const defaultSections: Partial<HomeSection>[] = [
    { theme_id: themeId, section_type: 'banner' as const, title: null, sort_order: 1 },
    { theme_id: themeId, section_type: 'products_featured' as const, title: 'Destaques', sort_order: 2 },
    { theme_id: themeId, section_type: 'products_new' as const, title: 'Novidades', sort_order: 3 },
    { theme_id: themeId, section_type: 'reviews' as const, title: 'Avaliações', sort_order: 4 },
  ]
  
  for (const section of defaultSections) {
    await createHomeSection(section)
  }
  
  // Criar categorias padrão
  const defaultCategories = [
    { theme_id: themeId, name: 'Todos', slug: 'todos', sort_order: 0 },
    { theme_id: themeId, name: 'Novidades', slug: 'novidades', sort_order: 1 },
    { theme_id: themeId, name: 'Promoções', slug: 'promocoes', sort_order: 2 },
  ]
  
  for (const category of defaultCategories) {
    await createCategory(category)
  }
}
