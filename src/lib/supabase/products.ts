import { supabase } from './client'

// Tipos
export type DemoProduct = {
  id: string
  theme_id: string
  name: string
  price: number
  original_price?: number
  image_url: string
  category?: string
  badge?: 'destaque' | 'promocao' | 'novo' | null
  installments: number
  variations: { size: string; sku: string; available: boolean }[]
  sort_order: number
  active: boolean
}

export type ProductTemplate = {
  id: string
  niche: string
  niche_label: string
  name: string
  price: number
  original_price?: number
  image_url: string
  category?: string
  badge?: string
  installments: number
  variations: { size: string; sku: string; available: boolean }[]
}

// Listar produtos de um tema
export async function getProductsByTheme(themeId: string): Promise<DemoProduct[]> {
  const { data, error } = await supabase
    .from('demo_products')
    .select('*')
    .eq('theme_id', themeId)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }

  return data || []
}

// Listar todos os produtos de um tema (incluindo inativos)
export async function getAllProductsByTheme(themeId: string): Promise<DemoProduct[]> {
  const { data, error } = await supabase
    .from('demo_products')
    .select('*')
    .eq('theme_id', themeId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }

  return data || []
}

// Criar um produto
export async function createProduct(product: Omit<DemoProduct, 'id'>): Promise<DemoProduct | null> {
  const { data, error } = await supabase
    .from('demo_products')
    .insert(product)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar produto:', error)
    return null
  }

  return data
}

// Criar múltiplos produtos de uma vez (cadastro em massa)
export async function createProductsBulk(products: Omit<DemoProduct, 'id'>[]): Promise<{ success: number; errors: number }> {
  const { data, error } = await supabase
    .from('demo_products')
    .insert(products)
    .select()

  if (error) {
    console.error('Erro ao criar produtos em massa:', error)
    return { success: 0, errors: products.length }
  }

  return { success: data?.length || 0, errors: products.length - (data?.length || 0) }
}

// Atualizar produto
export async function updateProduct(id: string, updates: Partial<DemoProduct>): Promise<DemoProduct | null> {
  const { data, error } = await supabase
    .from('demo_products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar produto:', error)
    return null
  }

  return data
}

// Deletar produto
export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('demo_products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar produto:', error)
    return false
  }

  return true
}

// Deletar todos os produtos de um tema
export async function deleteAllProductsByTheme(themeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('demo_products')
    .delete()
    .eq('theme_id', themeId)

  if (error) {
    console.error('Erro ao deletar produtos:', error)
    return false
  }

  return true
}

// Listar nichos disponíveis
export async function getNiches(): Promise<{ niche: string; niche_label: string; count: number }[]> {
  const { data, error } = await supabase
    .from('product_templates')
    .select('niche, niche_label')
    .eq('active', true)

  if (error) {
    console.error('Erro ao buscar nichos:', error)
    return []
  }

  // Agrupar por nicho e contar
  const grouped = (data || []).reduce((acc, item) => {
    if (!acc[item.niche]) {
      acc[item.niche] = { niche: item.niche, niche_label: item.niche_label, count: 0 }
    }
    acc[item.niche].count++
    return acc
  }, {} as Record<string, { niche: string; niche_label: string; count: number }>)

  return Object.values(grouped)
}

// Listar templates de um nicho
export async function getTemplatesByNiche(niche: string): Promise<ProductTemplate[]> {
  const { data, error } = await supabase
    .from('product_templates')
    .select('*')
    .eq('niche', niche)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Erro ao buscar templates:', error)
    return []
  }

  return data || []
}

// Importar produtos de um nicho para um tema
export async function importNicheToTheme(themeId: string, niche: string): Promise<{ success: number; errors: number }> {
  // Buscar templates do nicho
  const templates = await getTemplatesByNiche(niche)
  
  if (templates.length === 0) {
    return { success: 0, errors: 0 }
  }

  // Converter templates para produtos do tema
  const products: Omit<DemoProduct, 'id'>[] = templates.map((template, index) => ({
    theme_id: themeId,
    name: template.name,
    price: template.price,
    original_price: template.original_price,
    image_url: template.image_url,
    category: template.category,
    badge: (template.badge as 'destaque' | 'promocao' | 'novo' | null) || null,
    installments: template.installments,
    variations: template.variations,
    sort_order: index,
    active: true,
  }))

  return createProductsBulk(products)
}

// Parser CSV para importação em massa
export function parseCSV(csvText: string, themeId: string): Omit<DemoProduct, 'id'>[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(';').map(h => h.trim().toLowerCase())
  const products: Omit<DemoProduct, 'id'>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map(v => v.trim())
    
    const product: Omit<DemoProduct, 'id'> = {
      theme_id: themeId,
      name: '',
      price: 0,
      image_url: '',
      installments: 12,
      variations: [],
      sort_order: i - 1,
      active: true,
    }

    headers.forEach((header, index) => {
      const value = values[index] || ''
      
      switch (header) {
        case 'nome':
        case 'name':
          product.name = value
          break
        case 'preco':
        case 'price':
          product.price = parseFloat(value.replace(',', '.')) || 0
          break
        case 'preco_original':
        case 'original_price':
          if (value) product.original_price = parseFloat(value.replace(',', '.'))
          break
        case 'imagem':
        case 'image':
        case 'image_url':
          product.image_url = value
          break
        case 'categoria':
        case 'category':
          product.category = value
          break
        case 'badge':
          if (['destaque', 'promocao', 'novo'].includes(value.toLowerCase())) {
            product.badge = value.toLowerCase() as 'destaque' | 'promocao' | 'novo'
          }
          break
        case 'parcelas':
        case 'installments':
          product.installments = parseInt(value) || 12
          break
        case 'tamanhos':
        case 'sizes':
          // Formato: "35/36,37/38,39/40"
          if (value) {
            product.variations = value.split(',').map((size, idx) => ({
              size: size.trim(),
              sku: `SKU${i}${idx}`,
              available: true,
            }))
          }
          break
      }
    })

    // Só adiciona se tiver nome e preço
    if (product.name && product.price > 0) {
      products.push(product)
    }
  }

  return products
}

// Gerar CSV de exemplo para download
export function generateSampleCSV(): string {
  return `nome;preco;preco_original;imagem;categoria;badge;parcelas;tamanhos
Rasteirinha Rose Gold;25,00;;https://exemplo.com/img1.jpg;Rasteiras;destaque;12;33/34,35/36,37/38
Sandália Dourada;37,00;45,00;https://exemplo.com/img2.jpg;Sandálias;promocao;12;35/36,37/38
Tênis Casual Branco;89,90;;https://exemplo.com/img3.jpg;Tênis;novo;12;35,36,37,38,39
Chinelo Slide Rosa;22,00;;https://exemplo.com/img4.jpg;Chinelos;;12;35/36,37/38`
}
