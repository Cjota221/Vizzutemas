import { useRouter } from 'next/router'

import { useEffect, useState, useRef } from 'react'
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
import type { Theme, ThemeWidget, ThemeBanner, ColorConfig, PageType } from '@/lib/types'

type TabType = 'info' | 'cores' | 'banners' | 'widgets' | 'css'

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
  
  // CSS por página
  const [cssByPage, setCssByPage] = useState<Record<PageType, string>>({
    home: '',
    produto: '',
    carrinho: '',
    checkout: ''
  })
  
  const [widgets, setWidgets] = useState<ThemeWidget[]>([])
  const [editingWidget, setEditingWidget] = useState<ThemeWidget | null>(null)
  const [newWidget, setNewWidget] = useState({ widget_type: 'html' as const, name: '', html_content: '', config: {} })
  const [banners, setBanners] = useState<ThemeBanner[]>([])
  const [editingBanner, setEditingBanner] = useState<ThemeBanner | null>(null)
  const [newBanner, setNewBanner] = useState({ name: '', image_desktop: '', image_mobile: '', link_url: '' })

  useEffect(() => {
    if (id && typeof id === 'string') loadData(id)
  }, [id])

  async function loadData(themeId: string) {
    try {
      setLoading(true)
      const [themeData, widgetsData, bannersData] = await Promise.all([
        getThemeById(themeId), getWidgetsByTheme(themeId), getBannersByTheme(themeId)
      ])
      if (themeData) {
        setTheme(themeData)
        setName(themeData.name)
        setSlug(themeData.slug)
        setDescription(themeData.description || '')
        setPrice(themeData.price?.toString() || '0')
        setStatus(themeData.status || 'draft')
        setThumbnail(themeData.thumbnail_url || '')
        if (themeData.color_config) setColors({ ...defaultColors, ...themeData.color_config })
        
        // Carregar CSS de cada página
        const cssPromises = pageTypes.map(async (page) => {
          const cssData = await getCssByPage(themeId, page.id)
          return { page: page.id, css: cssData?.css_code || '' }
        })
        const cssResults = await Promise.all(cssPromises)
        const cssMap: Record<PageType, string> = { home: '', produto: '', carrinho: '', checkout: '' }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-600">Carregando...</div></div>
  if (!theme) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-600">Tema não encontrado</div></div>

  const tabs: { id: TabType; label: string }[] = [
    { id: 'info', label: 'Informações' },
    { id: 'cores', label: 'Paleta de Cores' },
    { id: 'banners', label: 'Banners' },
    { id: 'widgets', label: 'Widgets' },
    { id: 'css', label: 'CSS Global' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/themes')} className="text-gray-500 hover:text-gray-800 flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Voltar
            </button>
            <h1 className="text-xl font-bold text-gray-800">Editando: {theme.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(`/admin/themes/${theme.id}/products`)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              📦 Produtos Demo
            </button>
            <a href={`/preview/${theme.slug}`} target="_blank" className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition">
              Ver Preview
            </a>
          </div>
        </div>
      </header>

      {message && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200">
        <nav className="flex gap-1 px-6 max-w-7xl mx-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 font-medium transition-colors ${activeTab === tab.id ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-800'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'info' && (
          <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">Informações do Tema</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Tema</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} step="0.01" min="0" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none">
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da Thumbnail</label>
              <input type="url" value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none" />
              {thumbnail && <img src={thumbnail} alt="Preview" className="mt-2 h-24 rounded-lg object-cover border" />}
            </div>
            <button onClick={handleSaveInfo} disabled={saving} className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-lg font-medium transition">
              {saving ? 'Salvando...' : 'Salvar Informações'}
            </button>
          </div>
        )}

        {activeTab === 'cores' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-6">
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
                {banners.length === 0 && <div className="text-center text-gray-500 py-8">Nenhum banner cadastrado</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'widgets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Widget</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={newWidget.widget_type} onChange={e => setNewWidget({ ...newWidget, widget_type: e.target.value as any })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg">
                    <option value="html">HTML Personalizado</option>
                    <option value="banner">Banner/Carrossel</option>
                    <option value="image_slider">Slider de Imagens</option>
                    <option value="product_carousel">Carrossel de Produtos</option>
                    <option value="text">Texto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input type="text" value={newWidget.name} onChange={e => setNewWidget({ ...newWidget, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg" placeholder="Nome do widget" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo HTML</label>
                <textarea value={newWidget.html_content} onChange={e => setNewWidget({ ...newWidget, html_content: e.target.value })} rows={5} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-mono text-sm" placeholder="<div>Seu HTML aqui...</div>" />
              </div>
              <button onClick={handleAddWidget} disabled={saving || !newWidget.name} className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-lg font-medium transition">
                Adicionar Widget
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Widgets Cadastrados</h2>
              <div className="space-y-3">
                {widgets.map((widget, index) => (
                  <div key={widget.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-400 font-mono text-sm">{index + 1}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{widget.widget_type}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{widget.name}</h4>
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
                {widgets.length === 0 && <div className="text-center text-gray-500 py-8">Nenhum widget cadastrado</div>}
              </div>
            </div>
          </div>
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
                <span className="text-gray-700">Ativo</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateBanner} disabled={saving} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg">Salvar</button>
                <button onClick={() => setEditingBanner(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
