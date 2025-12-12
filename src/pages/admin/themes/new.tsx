import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createTheme, upsertCss } from '@/lib/supabase/themes'

/**
 * Admin - Criar novo tema
 */
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

  async function handleSubmit(e: React.FormEvent, preview = false) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Criar tema
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

      // Salvar CSS
      if (cssHome) await upsertCss(theme.id, 'home', cssHome)
      if (cssProduct) await upsertCss(theme.id, 'product', cssProduct)
      if (cssCart) await upsertCss(theme.id, 'cart', cssCart)

      // Redirecionar
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
    <div className="min-h-screen bg-gray-100">
      {/* Header Admin */}
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/themes" className="font-bold text-xl">
            Vizzutemas Admin
          </Link>
          <nav className="flex gap-4">
            <Link href="/admin/themes" className="text-gray-300 hover:text-white">
              Temas
            </Link>
            <Link href="/admin/orders" className="text-gray-300 hover:text-white">
              Pedidos
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/admin/themes" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Voltar para lista
        </Link>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Novo Tema</h1>

          <form onSubmit={(e) => handleSubmit(e, false)}>
            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Ex: 99.90 (deixe vazio para grátis)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da Thumbnail</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Descreva o tema..."
              />
            </div>

            {/* CSS por página */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">CSS do Tema</h2>
              
              {/* Tabs */}
              <div className="flex border-b mb-4">
                {(['home', 'product', 'cart'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab === 'home' ? 'Home' : tab === 'product' ? 'Produto' : 'Carrinho'}
                  </button>
                ))}
              </div>

              {/* Textarea do CSS */}
              <textarea
                value={activeTab === 'home' ? cssHome : activeTab === 'product' ? cssProduct : cssCart}
                onChange={(e) => {
                  if (activeTab === 'home') setCssHome(e.target.value)
                  else if (activeTab === 'product') setCssProduct(e.target.value)
                  else setCssCart(e.target.value)
                }}
                rows={12}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
                placeholder={`/* CSS para a página ${activeTab} */\n\n/* Exemplo: */\n#store-header {\n  background-color: #1a1a2e;\n}`}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
              >
                Salvar e Pré-visualizar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
