import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createTheme, upsertCssByPage } from '@/lib/supabase/themes'
import AdminLayout, { PageHeader, Card } from '@/components/admin/AdminLayout'
import { ArrowLeft, Save, Eye, Home, Package, ShoppingCart, AlertCircle } from 'lucide-react'

export default function NewTheme() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Campos do tema
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')

  // CSS por página
  const [cssHome, setCssHome] = useState('')
  const [cssProduct, setCssProduct] = useState('')
  const [cssCart, setCssCart] = useState('')

  // Tab ativa
  const [activeTab, setActiveTab] = useState<'home' | 'product' | 'cart'>('home')

  const cssTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'product', label: 'Produto', icon: Package },
    { id: 'cart', label: 'Carrinho', icon: ShoppingCart },
  ] as const

  async function handleSubmit(e: React.FormEvent, preview = false) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const theme = await createTheme({
        name,
        slug,
        description,
        price: price ? parseFloat(price) : undefined,
        thumbnail_url: thumbnailUrl || undefined,
        status,
      })

      if (!theme) {
        setError('Erro ao criar tema')
        setLoading(false)
        return
      }

      if (cssHome) await upsertCssByPage(theme.id, 'home', cssHome)
      if (cssProduct) await upsertCssByPage(theme.id, 'product', cssProduct)
      if (cssCart) await upsertCssByPage(theme.id, 'cart', cssCart)

      if (preview) {
        router.push(`/preview/${theme.slug}`)
      } else {
        router.push('/admin/themes')
      }
    } catch (err) {
      setError('Erro ao salvar tema')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Novo Tema">
      <div className="mb-6">
        <Link href="/admin/themes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista
        </Link>
      </div>

      <PageHeader
        title="Criar Novo Tema"
        description="Preencha as informações para criar um novo tema de e-commerce"
      />

      <Card>
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Informações básicas */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-500"
                  placeholder="Ex: Tema Moderno"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-500"
                  placeholder="Ex: tema-moderno"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Preço</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-500"
                  placeholder="Ex: 99.90 (deixe vazio para grátis)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">URL da Thumbnail</label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-500"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-500"
              placeholder="Descreva o tema..."
            />
          </div>

          {/* CSS por página */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">CSS do Tema</h3>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-4 p-1 bg-slate-800/50 rounded-xl w-fit">
              {cssTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === id
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <textarea
              value={activeTab === 'home' ? cssHome : activeTab === 'product' ? cssProduct : cssCart}
              onChange={(e) => {
                if (activeTab === 'home') setCssHome(e.target.value)
                else if (activeTab === 'product') setCssProduct(e.target.value)
                else setCssCart(e.target.value)
              }}
              rows={12}
              className="w-full bg-slate-900 border border-slate-700 text-emerald-400 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-600"
              placeholder={`/* CSS para a página ${activeTab} */\n\n/* Exemplo: */\n#store-header {\n  background-color: #1a1a2e;\n}`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 pt-4 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Salvar Tema'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 border border-indigo-500/50 text-indigo-400 font-medium rounded-xl hover:bg-indigo-500/10 transition disabled:opacity-50"
            >
              <Eye className="w-5 h-5" />
              Salvar e Visualizar
            </button>
          </div>
        </form>
      </Card>
    </AdminLayout>
  )
}
