import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { 
  getThemeById, 
  updateTheme, 
  getWidgetsByTheme,
  createWidget,
  updateWidget,
  deleteWidget,
  getBannersByTheme,
  createBanner,
  updateBanner,
  deleteBanner,
  updateThemeColors,
  generateBaseCss,
  getCssByPage,
  upsertCssByPage
} from '@/lib/supabase/themes'
import { getProducts, getDemoBanners, createDemoBanner, updateDemoBanner, deleteDemoBanner } from '@/lib/supabase/store'
import type { Theme, ThemeWidget, ThemeBanner, ColorConfig, PageType, LayoutConfig, LayoutSection } from '@/lib/types'
import type { DemoProduct, DemoBanner } from '@/lib/supabase/store'
import { ProductsTab, BannersTab } from '@/components/admin'
import AdminLayout, { Card } from '@/components/admin/AdminLayout'

type TabType = 'info' | 'layout' | 'cores' | 'produtos' | 'banners' | 'widgets' | 'css'

// Cores padrão - exatamente como na plataforma
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

// Grupos de cores organizados por seção
const colorGroups = {
  'Página': ['cor_fundo_pagina', 'cor_detalhes_fundo'],
  'Barra Superior': ['cor_fundo_barra_superior'],
  'Cabeçalho': ['cor_fundo_cabecalho', 'cor_botoes_cabecalho'],
  'Botões': ['cor_botao_enviar_pedido', 'cor_demais_botoes', 'cor_detalhes_gerais'],
  'Menus': ['cor_fundo_menu_desktop', 'cor_fundo_submenu_desktop', 'cor_fundo_menu_mobile'],
  'Outros': ['cor_fundo_banner_catalogo', 'cor_fundo_rodape']
}

// Labels legíveis para cada cor (exatamente como na plataforma)
const colorLabels: Record<string, string> = {
  cor_fundo_pagina: 'Cor do fundo da página',
  cor_detalhes_fundo: 'Cor dos detalhes do fundo da página',
  cor_fundo_barra_superior: 'Cor do fundo da barra superior',
  cor_botoes_cabecalho: 'Cor dos botões do cabeçalho',
  cor_fundo_cabecalho: 'Cor do fundo do cabeçalho',
  cor_botao_enviar_pedido: 'Cor do botão enviar pedido',
  cor_demais_botoes: 'Cor dos demais botões',
  cor_detalhes_gerais: 'Cor dos detalhes gerais',
  cor_fundo_banner_catalogo: 'Cor do fundo do Banner do catálogo',
  cor_fundo_menu_desktop: 'Cor do fundo do menu desktop',
  cor_fundo_submenu_desktop: 'Cor do fundo do submenu desktop',
  cor_fundo_menu_mobile: 'Cor do fundo do menu mobile',
  cor_fundo_rodape: 'Cor do fundo do rodapé'
}

// Páginas disponíveis para CSS (alinhado com PageType: 'home' | 'product' | 'cart')
const pageTypes: { id: PageType; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'product', label: 'Produto' },
  { id: 'cart', label: 'Carrinho' }
]

export default function EditThemePage() {
  const router = useRouter()
  const { id } = router.query
  const fileInputDesktop = useRef<HTMLInputElement>(null)
  const fileInputMobile = useRef<HTMLInputElement>(null)

  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [activeCssPage, setActiveCssPage] = useState<PageType>('home')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')
  const [thumbnail, setThumbnail] = useState('')
  const [colors, setColors] = useState<ColorConfig>(defaultColors)
  
  // Layout config - ordem das seções e produtos por linha
  const defaultLayoutConfig: LayoutConfig = {
    sections: [
      { id: 'banner_principal', type: 'banner_principal', label: 'Banner Principal', enabled: true, order: 1 },
      { id: 'banner_categorias', type: 'banner_categorias', label: 'Banner de Categorias', enabled: true, order: 2 },
      { id: 'widgets', type: 'widgets', label: 'Widgets HTML', enabled: true, order: 3 },
      { id: 'produtos', type: 'produtos', label: 'Produtos', enabled: true, order: 4 },
      { id: 'avaliacoes', type: 'avaliacoes', label: 'Avaliações', enabled: false, order: 5 },
      { id: 'info_loja', type: 'info_loja', label: 'Informações da Loja', enabled: false, order: 6 },
    ],
    products_per_row: 6
  }
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(defaultLayoutConfig)
  
  // Logo da loja
  const [logoUrl, setLogoUrl] = useState('')
  const fileInputLogo = useRef<HTMLInputElement>(null)
  
  // Carrosséis customizados de produtos
  const [customCarousels, setCustomCarousels] = useState<{id: string, name: string, category: string, enabled: boolean, order: number}[]>([])
  const [showAddCarousel, setShowAddCarousel] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [newCarouselName, setNewCarouselName] = useState('')
  const [newCarouselCategory, setNewCarouselCategory] = useState('')
  const [selectedCarouselProducts, setSelectedCarouselProducts] = useState<string[]>([]) // IDs dos produtos selecionados
  const [selectedLayoutWidgets, setSelectedLayoutWidgets] = useState<string[]>([]) // IDs dos widgets selecionados
  
  // Drag and drop
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  
  // CSS por página (alinhado com PageType: 'home' | 'product' | 'cart')
  const [cssByPage, setCssByPage] = useState<Record<PageType, string>>({
    home: '',
    product: '',
    cart: ''
  })
  
  const [widgets, setWidgets] = useState<ThemeWidget[]>([])
  const [editingWidget, setEditingWidget] = useState<ThemeWidget | null>(null)
  const [newWidget, setNewWidget] = useState({ widget_type: 'html' as const, name: '', html_content: '', config: {} })
  const [banners, setBanners] = useState<ThemeBanner[]>([])
  const [editingBanner, setEditingBanner] = useState<ThemeBanner | null>(null)
  const [newBanner, setNewBanner] = useState({ name: '', image_desktop: '', image_mobile: '', link_url: '' })
  
  // Estados para as novas abas
  const [products, setProducts] = useState<DemoProduct[]>([])
  const [demoBanners, setDemoBanners] = useState<DemoBanner[]>([])

  useEffect(() => {
    if (id && typeof id === 'string') loadData(id)
  }, [id])

  async function loadData(themeId: string) {
    try {
      setLoading(true)
      const [themeData, widgetsData, bannersData, productsData, demoBannersData] = await Promise.all([
        getThemeById(themeId), 
        getWidgetsByTheme(themeId), 
        getBannersByTheme(themeId),
        getProducts(themeId),
        getDemoBanners(themeId)
      ])
      
      setProducts(productsData || [])
      setDemoBanners(demoBannersData || [])
      
      if (themeData) {
        setTheme(themeData)
        setName(themeData.name)
        setSlug(themeData.slug)
        setDescription(themeData.description || '')
        setPrice(themeData.price?.toString() || '0')
        setStatus(themeData.status || 'draft')
        setThumbnail(themeData.thumbnail_url || '')
        if (themeData.color_config) setColors({ ...defaultColors, ...themeData.color_config })
        if (themeData.layout_config) {
          setLayoutConfig({ ...defaultLayoutConfig, ...themeData.layout_config })
          // Carregar logo se existir
          if ((themeData.layout_config as any).logo_url) {
            setLogoUrl((themeData.layout_config as any).logo_url)
          }
        }
        
        // Carregar CSS de cada página
        const cssPromises = pageTypes.map(async (page) => {
          const cssData = await getCssByPage(themeId, page.id)
          return { page: page.id, css: cssData?.css_code || '' }
        })
        const cssResults = await Promise.all(cssPromises)
        const cssMap: Record<PageType, string> = { home: '', product: '', cart: '' }
        cssResults.forEach(result => {
          cssMap[result.page] = result.css
        })
        setCssByPage(cssMap)
      }
      setWidgets(widgetsData || [])
      setBanners(bannersData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showMessage('error', 'Erro ao carregar dados do tema')
    } finally {
      setLoading(false)
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  async function uploadImage(file: File, folder: string): Promise<string | null> {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${folder}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('theme-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('theme-assets').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Erro no upload:', error)
      showMessage('error', 'Erro ao fazer upload da imagem')
      return null
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveInfo() {
    if (!theme) return
    setSaving(true)
    try {
      await updateTheme(theme.id, { name, slug, description, price: parseFloat(price) || 0, status, thumbnail_url: thumbnail })
      showMessage('success', 'Informações salvas!')
    } catch (error) {
      showMessage('error', 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveLayout() {
    if (!theme) return
    setSaving(true)
    try {
      const configToSave = { ...layoutConfig, logo_url: logoUrl }
      await updateTheme(theme.id, { layout_config: configToSave } as any)
      showMessage('success', 'Layout salvo!')
    } catch (error) {
      showMessage('error', 'Erro ao salvar layout')
    } finally {
      setSaving(false)
    }
  }

  function moveSection(index: number, direction: 'up' | 'down') {
    const newSections = [...layoutConfig.sections]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newSections.length) return
    
    // Trocar posições
    const temp = newSections[index]
    newSections[index] = newSections[newIndex]
    newSections[newIndex] = temp
    
    // Atualizar order
    newSections.forEach((s, i) => s.order = i + 1)
    setLayoutConfig({ ...layoutConfig, sections: newSections })
  }

  function toggleSection(sectionId: string) {
    const newSections = layoutConfig.sections.map(s => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    )
    setLayoutConfig({ ...layoutConfig, sections: newSections })
  }

  async function handleSaveColors() {
    if (!theme) return
    setSaving(true)
    try {
      await updateThemeColors(theme.id, colors)
      showMessage('success', 'Cores salvas!')
    } catch (error) {
      showMessage('error', 'Erro ao salvar cores')
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerateCss() {
    const css = generateBaseCss(colors)
    setCssByPage(prev => ({
      ...prev,
      [activeCssPage]: prev[activeCssPage] + '\n\n/* CSS Base gerado das cores */\n' + css
    }))
    setActiveTab('css')
    showMessage('success', 'CSS gerado!')
  }

  async function handleSaveCss() {
    if (!theme) return
    setSaving(true)
    try {
      await upsertCssByPage(theme.id, activeCssPage, cssByPage[activeCssPage])
      showMessage('success', `CSS da página ${activeCssPage} salvo!`)
    } catch (error) {
      showMessage('error', 'Erro ao salvar CSS')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAllCss() {
    if (!theme) return
    setSaving(true)
    try {
      for (const pageType of pageTypes) {
        if (cssByPage[pageType.id]) {
          await upsertCssByPage(theme.id, pageType.id, cssByPage[pageType.id])
        }
      }
      showMessage('success', 'CSS de todas as páginas salvo!')
    } catch (error) {
      showMessage('error', 'Erro ao salvar CSS')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddWidget() {
    if (!theme || !newWidget.name) return
    setSaving(true)
    try {
      const widget = await createWidget({
        theme_id: theme.id, widget_type: newWidget.widget_type, name: newWidget.name,
        html_content: newWidget.html_content, config: newWidget.config, display_order: widgets.length, is_active: true
      })
      if (widget) {
        setWidgets([...widgets, widget])
        setNewWidget({ widget_type: 'html', name: '', html_content: '', config: {} })
        showMessage('success', 'Widget adicionado!')
      }
    } catch (error) {
      showMessage('error', 'Erro ao adicionar widget')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateWidget() {
    if (!editingWidget) return
    setSaving(true)
    try {
      const updated = await updateWidget(editingWidget.id, {
        name: editingWidget.name, html_content: editingWidget.html_content,
        config: editingWidget.config, is_active: editingWidget.is_active
      })
      if (updated) {
        setWidgets(widgets.map(w => w.id === updated.id ? updated : w))
        setEditingWidget(null)
        showMessage('success', 'Widget atualizado!')
      }
    } catch (error) {
      showMessage('error', 'Erro ao atualizar widget')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteWidget(widgetId: string) {
    if (!confirm('Excluir widget?')) return
    try {
      await deleteWidget(widgetId)
      setWidgets(widgets.filter(w => w.id !== widgetId))
      showMessage('success', 'Widget excluído!')
    } catch (error) {
      showMessage('error', 'Erro ao excluir widget')
    }
  }

  async function handleBannerImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, 'banners')
    if (url) {
      if (type === 'desktop') setNewBanner({ ...newBanner, image_desktop: url })
      else setNewBanner({ ...newBanner, image_mobile: url })
    }
  }

  async function handleAddBanner() {
    if (!theme || !newBanner.name || !newBanner.image_desktop) return
    setSaving(true)
    try {
      const banner = await createBanner({
        theme_id: theme.id, name: newBanner.name, image_desktop: newBanner.image_desktop,
        image_mobile: newBanner.image_mobile || newBanner.image_desktop,
        link_url: newBanner.link_url, display_order: banners.length, is_active: true
      })
      if (banner) {
        setBanners([...banners, banner])
        setNewBanner({ name: '', image_desktop: '', image_mobile: '', link_url: '' })
        showMessage('success', 'Banner adicionado!')
      }
    } catch (error) {
      showMessage('error', 'Erro ao adicionar banner')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateBanner() {
    if (!editingBanner) return
    setSaving(true)
    try {
      const updated = await updateBanner(editingBanner.id, {
        name: editingBanner.name, image_desktop: editingBanner.image_desktop,
        image_mobile: editingBanner.image_mobile, link_url: editingBanner.link_url, is_active: editingBanner.is_active
      })
      if (updated) {
        setBanners(banners.map(b => b.id === updated.id ? updated : b))
        setEditingBanner(null)
        showMessage('success', 'Banner atualizado!')
      }
    } catch (error) {
      showMessage('error', 'Erro ao atualizar banner')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteBanner(bannerId: string) {
    if (!confirm('Excluir banner?')) return
    try {
      await deleteBanner(bannerId)
      setBanners(banners.filter(b => b.id !== bannerId))
      showMessage('success', 'Banner excluído!')
    } catch (error) {
      showMessage('error', 'Erro ao excluir banner')
    }
  }

  // DEMO BANNERS - Usados no Preview
  async function handleAddDemoBanner() {
    if (!theme || !newBanner.name || !newBanner.image_desktop) return
    setSaving(true)
    try {
      const banner = await createDemoBanner({
        theme_id: theme.id,
        title: newBanner.name,
        subtitle: '',
        image_desktop: newBanner.image_desktop,
        image_mobile: newBanner.image_mobile || newBanner.image_desktop,
        button_text: 'Ver mais',
        button_link: newBanner.link_url || '#',
        position: demoBanners.length,
        is_active: true
      })
      if (banner) {
        setDemoBanners([...demoBanners, banner])
        setNewBanner({ name: '', image_desktop: '', image_mobile: '', link_url: '' })
        showMessage('success', 'Banner adicionado! Ele aparecerá no preview.')
      }
    } catch (error) {
      console.error('Erro ao adicionar demo banner:', error)
      showMessage('error', 'Erro ao adicionar banner')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteDemoBanner(bannerId: string) {
    if (!confirm('Excluir banner?')) return
    try {
      await deleteDemoBanner(bannerId)
      setDemoBanners(demoBanners.filter(b => b.id !== bannerId))
      showMessage('success', 'Banner excluído!')
    } catch (error) {
      showMessage('error', 'Erro ao excluir banner')
    }
  }

  if (loading) return (
    <AdminLayout title="Carregando...">
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    </AdminLayout>
  )

  if (!theme) return (
    <AdminLayout title="Erro">
      <Card className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-sm font-medium text-slate-900 mb-1">Tema não encontrado</h2>
        <p className="text-sm text-slate-500 mb-4">O tema que você está procurando não existe.</p>
        <button onClick={() => router.push('/admin/themes')} className="px-3.5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-medium">
          Voltar para Temas
        </button>
      </Card>
    </AdminLayout>
  )

  const tabs: { id: TabType; label: string }[] = [
    { id: 'info', label: 'Informações' },
    { id: 'layout', label: 'Layout' },
    { id: 'cores', label: 'Cores' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'banners', label: 'Banners' },
    { id: 'widgets', label: 'Widgets' },
    { id: 'css', label: 'CSS Avançado' }
  ]

  return (
    <AdminLayout title={`Editando: ${theme.name}`}>
      {/* Header Moderno */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 mb-8 rounded-b-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/themes" 
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">{theme.name}</h1>
              <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="truncate">/{theme.slug}</span>
              </p>
            </div>
          </div>
          <a 
            href={`/preview/${theme.slug}`} 
            target="_blank" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors text-sm font-semibold shadow-lg flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preview
          </a>
        </div>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {/* Tabs Modernas com Ícones */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {tabs.map(tab => {
          const icons: Record<TabType, React.ReactNode> = {
            info: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            layout: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
            cores: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
            produtos: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
            banners: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            widgets: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
            css: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          }
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {icons[tab.id]}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal - Informações */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </span>
                    Informações do Tema
                  </h2>
                  
                  <div className="space-y-5">
                    {/* Nome do Tema */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nome do Tema</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full px-4 py-3 text-base bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all" 
                        placeholder="Ex: Tema Elegance"
                      />
                    </div>
                    
                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Slug (URL)</label>
                      <div className="flex items-center">
                        <span className="px-4 py-3 bg-slate-100 border-2 border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm">/preview/</span>
                        <input 
                          type="text" 
                          value={slug} 
                          onChange={e => setSlug(e.target.value)} 
                          className="flex-1 px-4 py-3 text-base bg-slate-50 border-2 border-slate-200 rounded-r-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all" 
                          placeholder="meu-tema"
                        />
                      </div>
                    </div>
                    
                    {/* Descrição */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição</label>
                      <textarea 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        rows={4} 
                        className="w-full px-4 py-3 text-base bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none" 
                        placeholder="Descreva seu tema..."
                      />
                    </div>
                    
                    {/* Preço e Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Preço (R$)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                          <input 
                            type="number" 
                            value={price} 
                            onChange={e => setPrice(e.target.value)} 
                            step="0.01" 
                            min="0" 
                            className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all" 
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                        <select 
                          value={status} 
                          onChange={e => setStatus(e.target.value as any)} 
                          className="w-full px-4 py-3 text-base bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="draft">📝 Rascunho</option>
                          <option value="published">✅ Publicado</option>
                          <option value="archived">📦 Arquivado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Botão Salvar */}
              <button 
                onClick={handleSaveInfo} 
                disabled={saving} 
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Informações
                  </>
                )}
              </button>
            </div>
            
            {/* Coluna Lateral - Thumbnail */}
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    Thumbnail
                  </h3>
                  
                  {/* Preview da Thumbnail */}
                  <div className="mb-4">
                    {thumbnail ? (
                      <div className="relative group">
                        <img 
                          src={thumbnail} 
                          alt="Preview" 
                          className="w-full aspect-video rounded-xl object-cover border-2 border-slate-200 shadow-sm" 
                        />
                        <button 
                          onClick={() => setThumbnail('')}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Input URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">URL da Imagem</label>
                    <input 
                      type="url" 
                      value={thumbnail} 
                      onChange={e => setThumbnail(e.target.value)} 
                      placeholder="https://exemplo.com/imagem.jpg" 
                      className="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all" 
                    />
                  </div>
                </div>
              </Card>
              
              {/* Card de Dicas */}
              <Card>
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                  <h3 className="text-base font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    Dicas
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Use um slug curto e sem espaços
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      A thumbnail aparece na listagem de temas
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Publique o tema quando estiver pronto
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Layout Tab - Completamente Reformulado */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            {/* Logo da Loja */}
            <Card>
              <div className="p-0">
                <h2 className="text-sm font-semibold text-slate-900 mb-1 uppercase tracking-wide">Logomarca da Loja</h2>
                <p className="text-sm text-slate-500 mb-4">Faça upload ou cole a URL da logo que aparecerá no cabeçalho</p>
                
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <input 
                      type="url" 
                      value={logoUrl} 
                      onChange={e => setLogoUrl(e.target.value)} 
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-200 focus:border-slate-400" 
                      placeholder="Cole a URL da logo aqui..." 
                    />
                    <div className="mt-2">
                      <input type="file" ref={fileInputLogo} accept="image/*" onChange={async e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = await uploadImage(file, 'logos')
                          if (url) setLogoUrl(url)
                        }
                      }} className="hidden" />
                      <button onClick={() => fileInputLogo.current?.click()} disabled={uploading} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-sm transition">
                        {uploading ? 'Enviando...' : 'Fazer upload'}
                      </button>
                    </div>
                  </div>
                  {logoUrl && (
                    <div className="relative">
                      <img src={logoUrl} alt="Logo" className="h-20 w-auto object-contain border rounded-lg p-2 bg-slate-50" />
                      <button onClick={() => setLogoUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">×</button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Seções do Layout */}
            <Card>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">📐 Seções da Página</h2>
                    <p className="text-sm text-slate-500 mt-1">Arraste para reordenar • Clique para ativar/desativar</p>
                  </div>
                  <button onClick={handleSaveLayout} disabled={saving} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition">
                    {saving ? 'Salvando...' : '💾 Salvar Layout'}
                  </button>
                </div>

                {/* Lista de seções com drag-and-drop */}
                <div className="space-y-2 mb-6">
                  {layoutConfig.sections.sort((a, b) => a.order - b.order).map((section, index) => (
                    <div 
                      key={section.id}
                      draggable
                      onDragStart={() => setDraggedItem(section.id)}
                      onDragEnd={() => setDraggedItem(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedItem && draggedItem !== section.id) {
                          const newSections = [...layoutConfig.sections]
                          const draggedIndex = newSections.findIndex(s => s.id === draggedItem)
                          const dropIndex = index
                          const [removed] = newSections.splice(draggedIndex, 1)
                          newSections.splice(dropIndex, 0, removed)
                          newSections.forEach((s, i) => s.order = i + 1)
                          setLayoutConfig({ ...layoutConfig, sections: newSections })
                        }
                      }}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition cursor-grab active:cursor-grabbing ${
                        draggedItem === section.id ? 'opacity-50 border-blue-400 bg-blue-50' :
                        section.enabled 
                          ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm' 
                          : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      {/* Handle de arrastar */}
                      <div className="text-slate-400 cursor-grab">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                        </svg>
                      </div>
                      
                      {/* Número da ordem */}
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-slate-700 font-bold rounded-lg text-sm">
                        {index + 1}
                      </span>
                      
                      {/* Ícone do tipo */}
                      <span className="text-2xl">
                        {section.type === 'banner_principal' ? '🖼️' :
                         section.type === 'banner_categorias' ? '📂' :
                         section.type === 'produtos' ? '🛍️' :
                         section.type === 'widgets' ? '🧩' :
                         section.type === 'avaliacoes' ? '⭐' :
                         section.type === 'carousel_custom' ? '🎠' :
                         '📋'}
                      </span>
                      
                      {/* Nome da seção */}
                      <div className="flex-1">
                        <span className="font-medium text-slate-800">{section.label}</span>
                        {section.type === 'carousel_custom' && (section as any).product_ids && (
                          <span className="text-xs text-purple-600 ml-2 px-2 py-0.5 bg-purple-50 rounded">
                            {(section as any).product_ids.length} produto(s)
                          </span>
                        )}
                        {section.type === 'carousel_custom' && (section as any).category && !(section as any).product_ids && (
                          <span className="text-xs text-slate-700 ml-2 px-2 py-0.5 bg-blue-50 rounded">
                            Categoria: {(section as any).category}
                          </span>
                        )}
                        {/* Mostrar nomes dos widgets individualmente */}
                        {section.type === 'widgets' && (section as any).widget_ids && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(section as any).widget_ids.map((widgetId: string) => {
                              const widget = widgets.find(w => w.id === widgetId)
                              return widget ? (
                                <span key={widgetId} className="text-xs text-yellow-700 px-2 py-0.5 bg-yellow-100 rounded-full">
                                  {widget.name}
                                </span>
                              ) : null
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Toggle ativo/inativo */}
                      <button 
                        onClick={() => toggleSection(section.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          section.enabled 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-200 text-slate-500 hover:bg-gray-300'
                        }`}
                      >
                        {section.enabled ? '✓ Ativo' : 'Inativo'}
                      </button>
                      
                      {/* Botão deletar - permite excluir qualquer seção exceto as essenciais */}
                      {!['banner_principal', 'produtos'].includes(section.id) && (
                        <button 
                          onClick={() => {
                            if (confirm(`Excluir a seção "${section.label}"?`)) {
                              const newSections = layoutConfig.sections.filter(s => s.id !== section.id)
                              newSections.forEach((s, i) => s.order = i + 1)
                              setLayoutConfig({ ...layoutConfig, sections: newSections })
                              showMessage('success', 'Seção excluída!')
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Excluir seção"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Botão Adicionar Seção */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">➕ Adicionar Nova Seção</h3>
                  
                  {!showAddCarousel && !showAddWidget ? (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setShowAddCarousel(true)}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium text-sm transition flex items-center gap-2"
                      >
                        🎠 Carrossel de Produtos
                      </button>
                      <button
                        onClick={() => setShowAddWidget(true)}
                        className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-sm transition flex items-center gap-2"
                      >
                        🧩 Widget HTML
                      </button>
                    </div>
                  ) : showAddWidget ? (
                    /* ===== FORMULÁRIO PARA ADICIONAR WIDGET ===== */
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-3">🧩 Adicionar Widgets ao Layout</h4>
                      
                      {/* Lista de widgets para seleção */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Selecione os Widgets ({selectedLayoutWidgets.length} selecionados)
                        </label>
                        
                        {widgets.length === 0 ? (
                          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-yellow-800">
                            <p>⚠️ Nenhum widget cadastrado. Cadastre widgets primeiro na aba &quot;Widgets&quot;.</p>
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg">
                            {widgets.map(widget => (
                              <label 
                                key={widget.id} 
                                className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                  selectedLayoutWidgets.includes(widget.id) ? 'bg-yellow-50' : ''
                                }`}
                              >
                                <input 
                                  type="checkbox"
                                  checked={selectedLayoutWidgets.includes(widget.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedLayoutWidgets([...selectedLayoutWidgets, widget.id])
                                    } else {
                                      setSelectedLayoutWidgets(selectedLayoutWidgets.filter(id => id !== widget.id))
                                    }
                                  }}
                                  className="w-5 h-5 text-yellow-600 rounded"
                                />
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-xl">
                                  🧩
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-800">{widget.name}</p>
                                  <p className="text-sm text-slate-500">
                                    {widget.widget_type === 'html' ? 'HTML Personalizado' : widget.widget_type}
                                    {widget.is_active ? ' • ✅ Ativo' : ' • ❌ Inativo'}
                                  </p>
                                </div>
                                {/* Preview do HTML (primeiros 50 chars) */}
                                <div className="text-xs text-slate-400 max-w-[150px] truncate">
                                  {widget.html_content?.substring(0, 50)}...
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {/* Botões de seleção rápida */}
                        {widgets.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => setSelectedLayoutWidgets(widgets.map(w => w.id))}
                              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg"
                            >
                              Selecionar Todos
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedLayoutWidgets([])}
                              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg"
                            >
                              Limpar Seleção
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (selectedLayoutWidgets.length > 0) {
                              // Criar label com os nomes dos widgets
                              const widgetNames = selectedLayoutWidgets
                                .map(id => widgets.find(w => w.id === id)?.name)
                                .filter(Boolean)
                                .join(', ')
                              
                              const newSection = {
                                id: `widget_section_${Date.now()}`,
                                type: 'widgets' as const,
                                label: widgetNames.length > 50 
                                  ? `Widgets: ${widgetNames.substring(0, 50)}...` 
                                  : `Widgets: ${widgetNames}`,
                                widget_ids: selectedLayoutWidgets,
                                enabled: true,
                                order: layoutConfig.sections.length + 1
                              }
                              setLayoutConfig({ 
                                ...layoutConfig, 
                                sections: [...layoutConfig.sections, newSection as any] 
                              })
                              setSelectedLayoutWidgets([])
                              setShowAddWidget(false)
                              showMessage('success', `Seção de widgets criada com ${selectedLayoutWidgets.length} widget(s)!`)
                            }
                          }}
                          disabled={selectedLayoutWidgets.length === 0}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg text-sm"
                        >
                          Adicionar Widgets ({selectedLayoutWidgets.length})
                        </button>
                        <button
                          onClick={() => {
                            setShowAddWidget(false)
                            setSelectedLayoutWidgets([])
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-lg text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-3">🎠 Criar Carrossel de Produtos</h4>
                      
                      {/* Nome do carrossel */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Carrossel</label>
                        <input 
                          type="text" 
                          value={newCarouselName}
                          onChange={e => setNewCarouselName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800" 
                          placeholder="Ex: Lançamentos, Promoções, Mais Vendidos..."
                        />
                      </div>

                      {/* Lista de produtos para seleção */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Selecione os Produtos ({selectedCarouselProducts.length} selecionados)
                        </label>
                        
                        {products.length === 0 ? (
                          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-yellow-800">
                            <p>⚠️ Nenhum produto cadastrado. Cadastre produtos primeiro na aba &quot;Produtos&quot;.</p>
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg">
                            {products.map(product => (
                              <label 
                                key={product.id} 
                                className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                  selectedCarouselProducts.includes(product.id) ? 'bg-blue-50' : ''
                                }`}
                              >
                                <input 
                                  type="checkbox"
                                  checked={selectedCarouselProducts.includes(product.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCarouselProducts([...selectedCarouselProducts, product.id])
                                    } else {
                                      setSelectedCarouselProducts(selectedCarouselProducts.filter(id => id !== product.id))
                                    }
                                  }}
                                  className="w-5 h-5 text-slate-700 rounded"
                                />
                                {product.image_url && (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-slate-800">{product.name}</p>
                                  <p className="text-sm text-slate-500">
                                    R$ {product.price?.toFixed(2)} {product.category && `• ${product.category}`}
                                  </p>
                                </div>
                                {product.badge && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    {product.badge}
                                  </span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {/* Botões de seleção rápida */}
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCarouselProducts(products.map(p => p.id))}
                            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg"
                          >
                            Selecionar Todos
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCarouselProducts([])}
                            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg"
                          >
                            Limpar Seleção
                          </button>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (newCarouselName && selectedCarouselProducts.length > 0) {
                              const newSection = {
                                id: `carousel_${Date.now()}`,
                                type: 'carousel_custom' as const,
                                label: newCarouselName,
                                product_ids: selectedCarouselProducts,
                                enabled: true,
                                order: layoutConfig.sections.length + 1
                              }
                              setLayoutConfig({ 
                                ...layoutConfig, 
                                sections: [...layoutConfig.sections, newSection as any] 
                              })
                              setNewCarouselName('')
                              setSelectedCarouselProducts([])
                              setShowAddCarousel(false)
                              showMessage('success', `Carrossel "${newCarouselName}" criado com ${selectedCarouselProducts.length} produtos!`)
                            }
                          }}
                          disabled={!newCarouselName || selectedCarouselProducts.length === 0}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-sm"
                        >
                          Criar Carrossel ({selectedCarouselProducts.length} produtos)
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCarousel(false)
                            setNewCarouselName('')
                            setSelectedCarouselProducts([])
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-lg text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Grid de Produtos */}
            <Card>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">🏗️ Grid de Produtos</h3>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-700">Produtos por linha (Desktop):</label>
                  <div className="flex gap-2">
                    {[4, 5, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => setLayoutConfig({ ...layoutConfig, products_per_row: num })}
                        className={`w-12 h-12 rounded-lg font-bold text-lg transition ${
                          layoutConfig.products_per_row === num
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-slate-500">colunas</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">No mobile serão 2 produtos por linha automaticamente</p>
              </div>
            </Card>

            {/* Preview Visual */}
            <Card>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">👁️ Preview do Layout</h3>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50">
                  {/* Header com logo */}
                  <div className="p-3 bg-white rounded text-center border-b-2 border-slate-200 flex items-center justify-center gap-4">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
                    ) : (
                      <span className="text-slate-400 text-sm">[ Logo ]</span>
                    )}
                    <span className="text-slate-400 text-xs">| Menu | Busca | Carrinho</span>
                  </div>
                  
                  {/* Seções */}
                  {layoutConfig.sections
                    .filter(s => s.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map(section => (
                      <div 
                        key={section.id}
                        className={`p-3 rounded text-center text-sm font-medium ${
                          section.type === 'banner_principal' ? 'bg-pink-100 text-pink-700 h-16' :
                          section.type === 'banner_categorias' ? 'bg-purple-100 text-purple-700 h-10' :
                          section.type === 'produtos' ? 'bg-blue-100 text-blue-700 h-24' :
                          section.type === 'widgets' ? 'bg-yellow-100 text-yellow-700 h-12' :
                          section.type === 'avaliacoes' ? 'bg-green-100 text-green-700 h-12' :
                          section.type === 'carousel_custom' ? 'bg-indigo-100 text-indigo-700 h-20' :
                          'bg-slate-100 text-slate-700 h-10'
                        } flex items-center justify-center`}
                      >
                        {section.label}
                        {section.type === 'produtos' && ` (${layoutConfig.products_per_row}/linha)`}
                        {section.type === 'carousel_custom' && section.category && ` [${section.category}]`}
                      </div>
                    ))
                  }
                  
                  {/* Rodapé */}
                  <div className="p-2 bg-gray-800 rounded text-center text-white text-xs">
                    Rodapé
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'cores' && (
          <Card>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Paleta de Cores</h2>
                <div className="flex gap-3">
                  <button onClick={handleGenerateCss} className="px-4 py-2 bg-blue-500 hover:bg-slate-900 text-white rounded-lg font-medium text-sm transition">
                    Gerar CSS Base
                  </button>
                  <button onClick={handleSaveColors} disabled={saving} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition">
                    {saving ? 'Salvando...' : 'Salvar Cores'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(colorGroups).map(([groupName, keys]) => (
                  <div key={groupName} className="border border-slate-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">{groupName}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {keys.map(key => (
                        <div key={key} className="flex flex-col">
                          <label className="text-sm font-medium text-slate-700 mb-2">{colorLabels[key]}</label>
                          <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <input 
                              type="color" 
                              value={colors[key as keyof ColorConfig] as string} 
                              onChange={e => setColors({ ...colors, [key]: e.target.value })} 
                              className="w-10 h-10 rounded cursor-pointer border-2 border-slate-200 p-0" 
                            />
                            <input 
                              type="text" 
                              value={colors[key as keyof ColorConfig] as string} 
                              onChange={e => setColors({ ...colors, [key]: e.target.value })} 
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded text-sm font-mono" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Preview</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Barra Superior */}
                <div className="p-2 text-center text-sm text-white" style={{ backgroundColor: colors.cor_fundo_barra_superior }}>
                  Frete grátis acima de R$ 299
                </div>
                {/* Header */}
                <div className="p-4" style={{ backgroundColor: colors.cor_fundo_cabecalho }}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">LOGO</span>
                    <button className="px-3 py-1.5 rounded text-sm text-white" style={{ backgroundColor: colors.cor_botoes_cabecalho }}>Menu</button>
                  </div>
                </div>
                {/* Menu Desktop */}
                <div className="px-4 py-2" style={{ backgroundColor: colors.cor_fundo_menu_desktop }}>
                  <div className="flex gap-4 text-sm">
                    <span className="text-slate-700">Categorias</span>
                    <span className="text-slate-700">Promoções</span>
                    <span className="text-slate-700">Novidades</span>
                  </div>
                </div>
                {/* Conteúdo */}
                <div className="p-6" style={{ backgroundColor: colors.cor_fundo_pagina }}>
                  <div className="flex gap-4 mb-4">
                    <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: colors.cor_botao_enviar_pedido }}>Enviar Pedido</button>
                    <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: colors.cor_demais_botoes }}>Ver mais</button>
                  </div>
                  <div className="p-4 rounded mb-4" style={{ backgroundColor: colors.cor_detalhes_fundo }}>
                    <p className="text-sm text-slate-600">Área de detalhes do fundo</p>
                    <a href="#" className="text-sm" style={{ color: colors.cor_detalhes_gerais }}>Link de detalhes gerais</a>
                  </div>
                  <div className="p-4 rounded" style={{ backgroundColor: colors.cor_fundo_banner_catalogo }}>
                    <p className="text-sm text-slate-600">Banner do Catálogo</p>
                  </div>
                </div>
                {/* Rodapé */}
                <div className="p-4" style={{ backgroundColor: colors.cor_fundo_rodape }}>
                  <span className="text-sm text-white">Rodapé © 2025</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'banners' && (
          <Card>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Adicionar Banner</h2>
              <p className="text-sm text-slate-500 mb-4">Banners são exibidos na home do preview. O primeiro banner é o principal.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                  <input type="text" value={newBanner.name} onChange={e => setNewBanner({ ...newBanner, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800" placeholder="Ex: Promoção de Verão" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link do Botão (opcional)</label>
                  <input type="url" value={newBanner.link_url} onChange={e => setNewBanner({ ...newBanner, link_url: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800" placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Imagem Desktop * (1920x600)</label>
                  <input 
                    type="url" 
                    value={newBanner.image_desktop} 
                    onChange={e => setNewBanner({ ...newBanner, image_desktop: e.target.value })} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 mb-2" 
                    placeholder="Cole a URL da imagem aqui..." 
                  />
                  {newBanner.image_desktop && (
                    <div className="relative">
                      <img src={newBanner.image_desktop} alt="Desktop" className="w-full h-32 object-cover rounded border" />
                      <button onClick={() => setNewBanner({ ...newBanner, image_desktop: '' })} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">×</button>
                    </div>
                  )}
                  <div className="mt-2 text-center">
                    <input type="file" ref={fileInputDesktop} accept="image/*" onChange={e => handleBannerImageUpload(e, 'desktop')} className="hidden" />
                    <button onClick={() => fileInputDesktop.current?.click()} disabled={uploading} className="px-4 py-2 bg-slate-100 hover:bg-gray-200 text-slate-700 rounded-lg text-sm">
                      {uploading ? 'Enviando...' : '📤 Ou fazer upload'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Imagem Mobile (768x400)</label>
                  <input 
                    type="url" 
                    value={newBanner.image_mobile} 
                    onChange={e => setNewBanner({ ...newBanner, image_mobile: e.target.value })} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 mb-2" 
                    placeholder="Cole a URL (opcional, usa desktop se vazio)" 
                  />
                  {newBanner.image_mobile && (
                    <div className="relative">
                      <img src={newBanner.image_mobile} alt="Mobile" className="w-full h-32 object-cover rounded border" />
                      <button onClick={() => setNewBanner({ ...newBanner, image_mobile: '' })} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">×</button>
                    </div>
                  )}
                  <div className="mt-2 text-center">
                    <input type="file" ref={fileInputMobile} accept="image/*" onChange={e => handleBannerImageUpload(e, 'mobile')} className="hidden" />
                    <button onClick={() => fileInputMobile.current?.click()} disabled={uploading} className="px-4 py-2 bg-slate-100 hover:bg-gray-200 text-slate-700 rounded-lg text-sm">
                      {uploading ? 'Enviando...' : '📤 Ou fazer upload'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleAddDemoBanner} 
                  disabled={saving || !newBanner.name || !newBanner.image_desktop} 
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                >
                  {saving ? 'Salvando...' : 'Adicionar Banner'}
                </button>
                {(!newBanner.name || !newBanner.image_desktop) && (
                  <span className="text-sm text-amber-600">* Preencha o título e a URL da imagem desktop</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Banners Cadastrados ({demoBanners.length})</h2>
              <div className="space-y-3">
                {demoBanners.map((banner, index) => (
                  <div key={banner.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-slate-700 font-bold rounded-lg text-sm">{index + 1}</span>
                    <img src={banner.image_desktop} alt={banner.title || 'Banner'} className="h-16 w-28 object-cover rounded border" />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{banner.title || 'Sem título'}</h4>
                      <p className="text-sm text-slate-500">{banner.button_link || 'Sem link'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {banner.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleDeleteDemoBanner(banner.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm">Excluir</button>
                    </div>
                  </div>
                ))}
                {demoBanners.length === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p>Nenhum banner cadastrado</p>
                    <p className="text-sm mt-1">Adicione banners para aparecerem no preview</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Novas Abas */}
        {activeTab === 'produtos' && (
          <ProductsTab 
            themeId={theme.id}
            products={products}
            onUpdate={setProducts}
            onMessage={showMessage}
          />
        )}

        {/* Widgets Tab */}
        {activeTab === 'widgets' && (
          <Card>
            {/* Guia de Variáveis CSS */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">🎨 Variáveis CSS da Paleta de Cores</h3>
              <p className="text-sm text-blue-700 mb-4">
                Use estas variáveis CSS nos seus widgets para adaptar automaticamente às cores do tema:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <code className="text-xs text-purple-600 font-mono">var(--cor-primaria)</code>
                  <p className="text-xs text-slate-500 mt-1">Cor principal/destaque</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <code className="text-xs text-purple-600 font-mono">var(--cor-secundaria)</code>
                  <p className="text-xs text-slate-500 mt-1">Cor secundária</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <code className="text-xs text-purple-600 font-mono">var(--cor-destaque)</code>
                  <p className="text-xs text-slate-500 mt-1">Botão principal</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <code className="text-xs text-purple-600 font-mono">var(--cor-fundo)</code>
                  <p className="text-xs text-slate-500 mt-1">Fundo da página</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <code className="text-xs text-purple-600 font-mono">var(--cor-detalhes-fundo)</code>
                  <p className="text-xs text-slate-500 mt-1">Fundos secundários</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <code className="text-xs text-purple-600 font-mono">var(--cor-fundo-rodape)</code>
                  <p className="text-xs text-slate-500 mt-1">Cor do rodapé</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Exemplo de uso:</p>
                <code className="text-xs text-green-400 font-mono">
                  {`<div style="background: var(--cor-primaria); color: white; padding: 20px;">`}<br/>
                  {`  Meu widget com a cor do tema!`}<br/>
                  {`</div>`}
                </code>
              </div>
            </div>

            {/* Adicionar novo widget */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Adicionar Widget HTML</h2>
              <p className="text-sm text-slate-500 mb-4">
                Widgets permitem adicionar código HTML/CSS personalizado no tema, como integrações de chat, analytics, ou estilos avançados.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Widget</label>
                    <input 
                      type="text" 
                      value={newWidget.name} 
                      onChange={e => setNewWidget({ ...newWidget, name: e.target.value })} 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800" 
                      placeholder="Ex: Banner Promocional, Chat WhatsApp, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select 
                      value={newWidget.widget_type} 
                      onChange={e => setNewWidget({ ...newWidget, widget_type: e.target.value as 'html' })} 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="html">HTML Personalizado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código HTML/CSS/JS</label>
                  <textarea 
                    value={newWidget.html_content} 
                    onChange={e => setNewWidget({ ...newWidget, html_content: e.target.value })} 
                    rows={10} 
                    className="w-full px-4 py-3 bg-gray-900 text-green-400 border border-slate-200 rounded-lg font-mono text-sm" 
                    placeholder={`<!-- Use var(--cor-primaria) para cores do tema -->\n<style>\n  .meu-widget {\n    background: var(--cor-primaria);\n    padding: 20px;\n    text-align: center;\n  }\n</style>\n\n<div class="meu-widget">\n  <h2>Meu Widget</h2>\n</div>`}
                  />
                </div>
                <button 
                  onClick={handleAddWidget} 
                  disabled={saving || !newWidget.name || !newWidget.html_content} 
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-medium transition"
                >
                  Adicionar Widget
                </button>
              </div>
            </div>

            {/* Lista de widgets */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Widgets Cadastrados</h2>
              <div className="space-y-3">
                {widgets.map((widget, index) => (
                  <div key={widget.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-mono text-sm mt-1">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800">{widget.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">Tipo: {widget.widget_type}</p>
                      <pre className="mt-2 p-2 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto max-h-24">
                        {widget.html_content?.substring(0, 200)}{(widget.html_content?.length || 0) > 200 ? '...' : ''}
                      </pre>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${widget.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {widget.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingWidget(widget)} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm">Editar</button>
                      <button onClick={() => handleDeleteWidget(widget.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm">Excluir</button>
                    </div>
                  </div>
                ))}
                {widgets.length === 0 && (
                  <div className="text-center text-slate-400 py-12">
                    <div className="text-4xl mb-2">🧩</div>
                    <p>Nenhum widget cadastrado</p>
                    <p className="text-sm mt-1">Adicione widgets HTML para personalizar o tema</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'css' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">CSS por Página</h2>
              <div className="flex gap-3">
                <button onClick={handleGenerateCss} className="px-4 py-2 bg-blue-500 hover:bg-slate-900 text-white rounded-lg font-medium text-sm transition">
                  Gerar CSS das Cores
                </button>
                <button onClick={handleSaveCss} disabled={saving} className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition">
                  Salvar {activeCssPage}
                </button>
                <button onClick={handleSaveAllCss} disabled={saving} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition">
                  {saving ? 'Salvando...' : 'Salvar Tudo'}
                </button>
              </div>
            </div>
            
            {/* Abas das páginas */}
            <div className="flex gap-1 mb-4 border-b border-slate-200">
              {pageTypes.map(page => (
                <button 
                  key={page.id} 
                  onClick={() => setActiveCssPage(page.id)} 
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeCssPage === page.id 
                      ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {page.label}
                  {cssByPage[page.id] && <span className="ml-1 text-xs text-green-500">●</span>}
                </button>
              ))}
            </div>

            {/* Informações sobre variáveis CSS */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Use as variáveis CSS geradas para aplicar as cores da paleta automaticamente.
                Clique em "Gerar CSS das Cores" para criar o CSS base com todas as variáveis.
              </p>
              <div className="mt-2 text-xs text-blue-700 font-mono">
                Variáveis: --cor-fundo-pagina, --cor-detalhes-fundo, --cor-botao-enviar-pedido, etc.
              </div>
            </div>
            
            <textarea 
              value={cssByPage[activeCssPage]} 
              onChange={e => setCssByPage(prev => ({ ...prev, [activeCssPage]: e.target.value }))} 
              rows={25} 
              className="w-full px-4 py-3 bg-gray-900 text-green-400 border border-slate-200 rounded-lg font-mono text-sm" 
              placeholder={`/* CSS específico para a página ${activeCssPage} */\n\n/* Use as variáveis de cores: */\n/* var(--cor-fundo-pagina) */\n/* var(--cor-botao-enviar-pedido) */\n/* etc... */`} 
            />
          </div>
        )}
      </div>

      {editingWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Editar Widget</h3>
            <div className="space-y-4">
              <input type="text" value={editingWidget.name} onChange={e => setEditingWidget({ ...editingWidget, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg" />
              <textarea value={editingWidget.html_content || ''} onChange={e => setEditingWidget({ ...editingWidget, html_content: e.target.value })} rows={8} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg font-mono text-sm" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingWidget.is_active} onChange={e => setEditingWidget({ ...editingWidget, is_active: e.target.checked })} className="w-4 h-4" />
                <span className="text-slate-700">Ativo</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateWidget} disabled={saving} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg">Salvar</button>
                <button onClick={() => setEditingWidget(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-lg">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Editar Banner</h3>
            <div className="space-y-4">
              <input type="text" value={editingBanner.name} onChange={e => setEditingBanner({ ...editingBanner, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg" placeholder="Nome" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Desktop</label>
                  <img src={editingBanner.image_desktop} alt="" className="w-full h-24 object-cover rounded border mb-2" />
                  <input type="url" value={editingBanner.image_desktop} onChange={e => setEditingBanner({ ...editingBanner, image_desktop: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Mobile</label>
                  <img src={editingBanner.image_mobile || ''} alt="" className="w-full h-24 object-cover rounded border mb-2" />
                  <input type="url" value={editingBanner.image_mobile || ''} onChange={e => setEditingBanner({ ...editingBanner, image_mobile: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <input type="url" value={editingBanner.link_url || ''} onChange={e => setEditingBanner({ ...editingBanner, link_url: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg" placeholder="Link" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingBanner.is_active} onChange={e => setEditingBanner({ ...editingBanner, is_active: e.target.checked })} className="w-4 h-4" />
                <span className="text-slate-300">Ativo</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateBanner} disabled={saving} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">Salvar</button>
                <button onClick={() => setEditingBanner(null)} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
