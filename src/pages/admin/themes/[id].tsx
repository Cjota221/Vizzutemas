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
import { getProducts, getDemoBanners } from '@/lib/supabase/store'
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
      { id: 'produtos', type: 'produtos', label: 'Produtos', enabled: true, order: 3 },
      { id: 'widgets', type: 'widgets', label: 'Widgets', enabled: true, order: 4 },
      { id: 'avaliacoes', type: 'avaliacoes', label: 'Avaliações', enabled: false, order: 5 },
      { id: 'info_loja', type: 'info_loja', label: 'Informações da Loja', enabled: false, order: 6 },
    ],
    products_per_row: 6
  }
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(defaultLayoutConfig)
  
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
        if (themeData.layout_config) setLayoutConfig({ ...defaultLayoutConfig, ...themeData.layout_config })
        
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
      await updateTheme(theme.id, { layout_config: layoutConfig } as any)
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

  if (loading) return (
    <AdminLayout title="Carregando...">
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </AdminLayout>
  )

  if (!theme) return (
    <AdminLayout title="Erro">
      <Card className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-red-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Tema não encontrado</h2>
        <p className="text-gray-500 mb-4">O tema que você está procurando não existe.</p>
        <button onClick={() => router.push('/admin/themes')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/themes" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{theme.name}</h1>
            <p className="text-sm text-gray-500">/{theme.slug}</p>
          </div>
        </div>
        <a 
          href={`/preview/${theme.slug}`} 
          target="_blank" 
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Ver Preview
        </a>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'info' && (
          <Card>
            <h2 className="text-lg font-semibold text-white mb-6 pb-4 border-b border-white/10">Informações do Tema</h2>
            <div className="space-y-5 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Tema</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-modern w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Slug (URL)</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="input-modern w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input-modern w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preço (R$)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} step="0.01" min="0" className="input-modern w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as any)} className="input-modern w-full">
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL da Thumbnail</label>
                <input type="url" value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="https://..." className="input-modern w-full" />
                {thumbnail && <img src={thumbnail} alt="Preview" className="mt-2 h-24 rounded-lg object-cover border border-white/10" />}
              </div>
              <button onClick={handleSaveInfo} disabled={saving} className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar Informações'}
              </button>
            </div>
          </Card>
        )}

        {/* Layout Tab - Ordenação de Seções */}
        {activeTab === 'layout' && (
          <Card>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Layout da Página</h2>
                  <p className="text-sm text-gray-500 mt-1">Arraste e organize as seções como preferir</p>
                </div>
                <button onClick={handleSaveLayout} disabled={saving} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition">
                  {saving ? 'Salvando...' : 'Salvar Layout'}
                </button>
              </div>

              {/* Ordenação de Seções */}
              <div className="space-y-2 mb-8">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Ordem das Seções</h3>
                {layoutConfig.sections.sort((a, b) => a.order - b.order).map((section, index) => (
                  <div 
                    key={section.id} 
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                      section.enabled 
                        ? 'bg-white border-gray-200 hover:border-pink-300' 
                        : 'bg-gray-50 border-gray-100 opacity-60'
                    }`}
                  >
                    {/* Número da ordem */}
                    <span className="w-8 h-8 flex items-center justify-center bg-pink-100 text-pink-600 font-bold rounded-lg text-sm">
                      {index + 1}
                    </span>
                    
                    {/* Nome da seção */}
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{section.label}</span>
                      <span className="text-xs text-gray-400 ml-2">({section.type})</span>
                    </div>
                    
                    {/* Toggle ativo/inativo */}
                    <button 
                      onClick={() => toggleSection(section.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        section.enabled 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                    >
                      {section.enabled ? '✓ Ativo' : 'Inativo'}
                    </button>
                    
                    {/* Botões de mover */}
                    <div className="flex gap-1">
                      <button 
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover para cima"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === layoutConfig.sections.length - 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover para baixo"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Produtos por linha */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Grid de Produtos</h3>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Produtos por linha (Desktop):</label>
                  <div className="flex gap-2">
                    {[4, 5, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => setLayoutConfig({ ...layoutConfig, products_per_row: num })}
                        className={`w-12 h-12 rounded-lg font-bold text-lg transition ${
                          layoutConfig.products_per_row === num
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">colunas</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">No mobile serão 2 produtos por linha automaticamente</p>
              </div>
            </div>

            {/* Preview visual do layout */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Preview do Layout</h3>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-2">
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
                        'bg-gray-100 text-gray-700 h-10'
                      } flex items-center justify-center`}
                    >
                      {section.label}
                      {section.type === 'produtos' && ` (${layoutConfig.products_per_row} por linha)`}
                    </div>
                  ))
                }
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'cores' && (
          <Card>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Paleta de Cores</h2>
                <div className="flex gap-3">
                  <button onClick={handleGenerateCss} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition">
                    Gerar CSS Base
                  </button>
                  <button onClick={handleSaveColors} disabled={saving} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition">
                    {saving ? 'Salvando...' : 'Salvar Cores'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(colorGroups).map(([groupName, keys]) => (
                  <div key={groupName} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">{groupName}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {keys.map(key => (
                        <div key={key} className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-2">{colorLabels[key]}</label>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <input 
                              type="color" 
                              value={colors[key as keyof ColorConfig] as string} 
                              onChange={e => setColors({ ...colors, [key]: e.target.value })} 
                              className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300 p-0" 
                            />
                            <input 
                              type="text" 
                              value={colors[key as keyof ColorConfig] as string} 
                              onChange={e => setColors({ ...colors, [key]: e.target.value })} 
                              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm font-mono" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Barra Superior */}
                <div className="p-2 text-center text-sm text-white" style={{ backgroundColor: colors.cor_fundo_barra_superior }}>
                  Frete grátis acima de R$ 299
                </div>
                {/* Header */}
                <div className="p-4" style={{ backgroundColor: colors.cor_fundo_cabecalho }}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">LOGO</span>
                    <button className="px-3 py-1.5 rounded text-sm text-white" style={{ backgroundColor: colors.cor_botoes_cabecalho }}>Menu</button>
                  </div>
                </div>
                {/* Menu Desktop */}
                <div className="px-4 py-2" style={{ backgroundColor: colors.cor_fundo_menu_desktop }}>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-700">Categorias</span>
                    <span className="text-gray-700">Promoções</span>
                    <span className="text-gray-700">Novidades</span>
                  </div>
                </div>
                {/* Conteúdo */}
                <div className="p-6" style={{ backgroundColor: colors.cor_fundo_pagina }}>
                  <div className="flex gap-4 mb-4">
                    <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: colors.cor_botao_enviar_pedido }}>Enviar Pedido</button>
                    <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: colors.cor_demais_botoes }}>Ver mais</button>
                  </div>
                  <div className="p-4 rounded mb-4" style={{ backgroundColor: colors.cor_detalhes_fundo }}>
                    <p className="text-sm text-gray-600">Área de detalhes do fundo</p>
                    <a href="#" className="text-sm" style={{ color: colors.cor_detalhes_gerais }}>Link de detalhes gerais</a>
                  </div>
                  <div className="p-4 rounded" style={{ backgroundColor: colors.cor_fundo_banner_catalogo }}>
                    <p className="text-sm text-gray-600">Banner do Catálogo</p>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Banner</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input type="text" value={newBanner.name} onChange={e => setNewBanner({ ...newBanner, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg" placeholder="Nome do banner" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
                  <input type="url" value={newBanner.link_url} onChange={e => setNewBanner({ ...newBanner, link_url: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg" placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Desktop (1920x600)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition">
                    {newBanner.image_desktop ? (
                      <div className="relative">
                        <img src={newBanner.image_desktop} alt="Desktop" className="w-full h-32 object-cover rounded" />
                        <button onClick={() => setNewBanner({ ...newBanner, image_desktop: '' })} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">×</button>
                      </div>
                    ) : (
                      <div>
                        <input type="file" ref={fileInputDesktop} accept="image/*" onChange={e => handleBannerImageUpload(e, 'desktop')} className="hidden" />
                        <button onClick={() => fileInputDesktop.current?.click()} disabled={uploading} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
                          {uploading ? 'Enviando...' : '📤 Escolher imagem'}
                        </button>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG até 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Mobile (768x400)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition">
                    {newBanner.image_mobile ? (
                      <div className="relative">
                        <img src={newBanner.image_mobile} alt="Mobile" className="w-full h-32 object-cover rounded" />
                        <button onClick={() => setNewBanner({ ...newBanner, image_mobile: '' })} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">×</button>
                      </div>
                    ) : (
                      <div>
                        <input type="file" ref={fileInputMobile} accept="image/*" onChange={e => handleBannerImageUpload(e, 'mobile')} className="hidden" />
                        <button onClick={() => fileInputMobile.current?.click()} disabled={uploading} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
                          {uploading ? 'Enviando...' : '📤 Escolher imagem'}
                        </button>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG até 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={handleAddBanner} disabled={saving || !newBanner.name || !newBanner.image_desktop} className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-lg font-medium transition">
                Adicionar Banner
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Banners Cadastrados</h2>
              <div className="space-y-3">
                {banners.map((banner, index) => (
                  <div key={banner.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-400 font-mono text-sm">{index + 1}</span>
                    <img src={banner.image_desktop} alt={banner.name} className="h-16 w-28 object-cover rounded border" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{banner.name}</h4>
                      <p className="text-sm text-gray-500">{banner.link_url || 'Sem link'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {banner.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingBanner(banner)} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm">Editar</button>
                      <button onClick={() => handleDeleteBanner(banner.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm">Excluir</button>
                    </div>
                  </div>
                ))}
                {banners.length === 0 && <div className="text-center text-slate-400 py-8">Nenhum banner cadastrado</div>}
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
            {/* Adicionar novo widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Widget HTML</h2>
              <p className="text-sm text-gray-500 mb-4">
                Widgets permitem adicionar código HTML/CSS personalizado no tema, como integrações de chat, analytics, ou estilos avançados.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Widget</label>
                    <input 
                      type="text" 
                      value={newWidget.name} 
                      onChange={e => setNewWidget({ ...newWidget, name: e.target.value })} 
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg" 
                      placeholder="Ex: Chat WhatsApp, Analytics, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select 
                      value={newWidget.widget_type} 
                      onChange={e => setNewWidget({ ...newWidget, widget_type: e.target.value as 'html' })} 
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg"
                    >
                      <option value="html">HTML Personalizado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código HTML/CSS/JS</label>
                  <textarea 
                    value={newWidget.html_content} 
                    onChange={e => setNewWidget({ ...newWidget, html_content: e.target.value })} 
                    rows={8} 
                    className="w-full px-4 py-3 bg-gray-900 text-green-400 border border-gray-300 rounded-lg font-mono text-sm" 
                    placeholder="<style>&#10;  /* Seu CSS aqui */&#10;</style>&#10;&#10;<div>&#10;  <!-- Seu HTML aqui -->&#10;</div>&#10;&#10;<script>&#10;  // Seu JavaScript aqui&#10;</script>"
                  />
                </div>
                <button 
                  onClick={handleAddWidget} 
                  disabled={saving || !newWidget.name || !newWidget.html_content} 
                  className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-lg font-medium transition"
                >
                  Adicionar Widget
                </button>
              </div>
            </div>

            {/* Lista de widgets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Widgets Cadastrados</h2>
              <div className="space-y-3">
                {widgets.map((widget, index) => (
                  <div key={widget.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-400 font-mono text-sm mt-1">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800">{widget.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Tipo: {widget.widget_type}</p>
                      <pre className="mt-2 p-2 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto max-h-24">
                        {widget.html_content?.substring(0, 200)}{(widget.html_content?.length || 0) > 200 ? '...' : ''}
                      </pre>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${widget.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {widget.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingWidget(widget)} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm">Editar</button>
                      <button onClick={() => handleDeleteWidget(widget.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm">Excluir</button>
                    </div>
                  </div>
                ))}
                {widgets.length === 0 && (
                  <div className="text-center text-gray-400 py-12">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">CSS por Página</h2>
              <div className="flex gap-3">
                <button onClick={handleGenerateCss} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition">
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
            <div className="flex gap-1 mb-4 border-b border-gray-200">
              {pageTypes.map(page => (
                <button 
                  key={page.id} 
                  onClick={() => setActiveCssPage(page.id)} 
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeCssPage === page.id 
                      ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
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
              className="w-full px-4 py-3 bg-gray-900 text-green-400 border border-gray-300 rounded-lg font-mono text-sm" 
              placeholder={`/* CSS específico para a página ${activeCssPage} */\n\n/* Use as variáveis de cores: */\n/* var(--cor-fundo-pagina) */\n/* var(--cor-botao-enviar-pedido) */\n/* etc... */`} 
            />
          </div>
        )}
      </div>

      {editingWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Widget</h3>
            <div className="space-y-4">
              <input type="text" value={editingWidget.name} onChange={e => setEditingWidget({ ...editingWidget, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg" />
              <textarea value={editingWidget.html_content || ''} onChange={e => setEditingWidget({ ...editingWidget, html_content: e.target.value })} rows={8} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-mono text-sm" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingWidget.is_active} onChange={e => setEditingWidget({ ...editingWidget, is_active: e.target.checked })} className="w-4 h-4" />
                <span className="text-gray-700">Ativo</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateWidget} disabled={saving} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg">Salvar</button>
                <button onClick={() => setEditingWidget(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Banner</h3>
            <div className="space-y-4">
              <input type="text" value={editingBanner.name} onChange={e => setEditingBanner({ ...editingBanner, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg" placeholder="Nome" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Desktop</label>
                  <img src={editingBanner.image_desktop} alt="" className="w-full h-24 object-cover rounded border mb-2" />
                  <input type="url" value={editingBanner.image_desktop} onChange={e => setEditingBanner({ ...editingBanner, image_desktop: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mobile</label>
                  <img src={editingBanner.image_mobile || ''} alt="" className="w-full h-24 object-cover rounded border mb-2" />
                  <input type="url" value={editingBanner.image_mobile || ''} onChange={e => setEditingBanner({ ...editingBanner, image_mobile: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <input type="url" value={editingBanner.link_url || ''} onChange={e => setEditingBanner({ ...editingBanner, link_url: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg" placeholder="Link" />
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
