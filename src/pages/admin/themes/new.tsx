import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createTheme, upsertCssByPage } from '@/lib/supabase/themes'
import AdminLayout, { PageHeader, Card } from '@/components/admin/AdminLayout'

export default function NewTheme() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')

  const [cssHome, setCssHome] = useState('')
  const [cssProduct, setCssProduct] = useState('')
  const [cssCart, setCssCart] = useState('')
  const [activeTab, setActiveTab] = useState<'home' | 'product' | 'cart'>('home')

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
      <div className="mb-4">
        <Link href="/admin/themes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Voltar
        </Link>
      </div>

      <PageHeader title="Novo Tema" description="Preencha as informações do tema" />

      <Card>
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Tema Moderno"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: tema-moderno"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deixe vazio para grátis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL da Thumbnail</label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva o tema..."
            />
          </div>

          {/* CSS Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CSS do Tema</label>
            <div className="flex gap-1 mb-2">
              {(['home', 'product', 'cart'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'home' ? 'Home' : tab === 'product' ? 'Produto' : 'Carrinho'}
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
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`/* CSS para ${activeTab} */`}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Salvar e Visualizar
            </button>
          </div>
        </form>
      </Card>
    </AdminLayout>
  )
}
