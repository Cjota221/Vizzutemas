import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { DemoProduct } from '@/lib/supabase/store'

type Props = {
  themeId: string
  products: DemoProduct[]
  onUpdate: (products: DemoProduct[]) => void
  onMessage: (type: 'success' | 'error', text: string) => void
}

const badges = [
  { value: '', label: 'Nenhum' },
  { value: 'destaque', label: '⭐ Destaque' },
  { value: 'promocao', label: '🔥 Promoção' },
  { value: 'novo', label: '🆕 Novo' },
  { value: 'mais_vendido', label: '🏆 Mais Vendido' },
]

export default function ProductsTab({ themeId, products, onUpdate, onMessage }: Props) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<DemoProduct | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    category: '',
    badge: '',
    sku: '',
    stock: '100',
    is_featured: false,
    variations: [] as { type: string; options: string[] }[]
  })

  function resetForm() {
    setForm({
      name: '',
      description: '',
      price: '',
      original_price: '',
      image_url: '',
      category: '',
      badge: '',
      sku: '',
      stock: '100',
      is_featured: false,
      variations: []
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  function editProduct(product: DemoProduct) {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      image_url: product.image_url,
      category: product.category || '',
      badge: product.badge || '',
      sku: product.sku || '',
      stock: product.stock.toString(),
      is_featured: product.is_featured,
      variations: product.variations || []
    })
    setEditingProduct(product)
    setShowForm(true)
  }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`
      const { error: uploadError } = await supabase.storage.from('theme-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('theme-assets').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Erro no upload:', error)
      onMessage('error', 'Erro ao fazer upload da imagem')
      return null
    } finally {
      setUploading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file)
    if (url) {
      setForm({ ...form, image_url: url })
    }
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.image_url) {
      onMessage('error', 'Preencha nome, preço e imagem')
      return
    }

    setSaving(true)
    try {
      const productData = {
        theme_id: themeId,
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        image_url: form.image_url,
        category: form.category || null,
        badge: form.badge || null,
        sku: form.sku || null,
        stock: parseInt(form.stock) || 100,
        is_featured: form.is_featured,
        variations: form.variations,
        is_active: true,
        sort_order: editingProduct ? editingProduct.sort_order : products.length
      }

      if (editingProduct) {
        const { data, error } = await supabase
          .from('demo_products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single()

        if (error) throw error
        onUpdate(products.map(p => p.id === editingProduct.id ? data as DemoProduct : p))
        onMessage('success', 'Produto atualizado!')
      } else {
        const { data, error } = await supabase
          .from('demo_products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error
        onUpdate([...products, data as DemoProduct])
        onMessage('success', 'Produto adicionado!')
      }

      resetForm()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      onMessage('error', 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const { error } = await supabase
        .from('demo_products')
        .delete()
        .eq('id', id)

      if (error) throw error
      onUpdate(products.filter(p => p.id !== id))
      onMessage('success', 'Produto excluído!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      onMessage('error', 'Erro ao excluir produto')
    }
  }

  async function toggleFeatured(product: DemoProduct) {
    try {
      const { data, error } = await supabase
        .from('demo_products')
        .update({ is_featured: !product.is_featured })
        .eq('id', product.id)
        .select()
        .single()

      if (error) throw error
      onUpdate(products.map(p => p.id === product.id ? data as DemoProduct : p))
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  // Agrupar produtos por categoria
  const categories = [...new Set(products.map(p => p.category || 'Sem categoria'))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          📦 Produtos ({products.length})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium flex items-center gap-2"
        >
          ➕ Novo Produto
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-800">
              {editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}
            </h4>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Nome do produto"
              />
            </div>
            <div>
              <label className={labelClass}>SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                className={inputClass}
                placeholder="PROD001"
              />
            </div>
            <div>
              <label className={labelClass}>Preço *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className={inputClass}
                step="0.01"
                placeholder="99.90"
              />
            </div>
            <div>
              <label className={labelClass}>Preço Original (riscado)</label>
              <input
                type="number"
                value={form.original_price}
                onChange={e => setForm({ ...form, original_price: e.target.value })}
                className={inputClass}
                step="0.01"
                placeholder="149.90"
              />
            </div>
            <div>
              <label className={labelClass}>Categoria</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className={inputClass}
                placeholder="Calçados"
                list="categories"
              />
              <datalist id="categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Badge</label>
              <select
                value={form.badge}
                onChange={e => setForm({ ...form, badge: e.target.value })}
                className={inputClass}
              >
                {badges.map(badge => (
                  <option key={badge.value} value={badge.value}>{badge.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Estoque</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className={inputClass}
                min="0"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_featured"
                checked={form.is_featured}
                onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 text-pink-500 rounded"
              />
              <label htmlFor="is_featured" className="text-sm text-gray-700">⭐ Produto em destaque</label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              rows={3}
              placeholder="Descrição do produto"
            />
          </div>

          <div>
            <label className={labelClass}>Imagem *</label>
            <div className="flex items-center gap-4">
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />
              )}
              <div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50"
                >
                  {uploading ? '⏳ Enviando...' : '📷 Enviar Imagem'}
                </button>
                <p className="text-xs text-gray-500 mt-1">ou cole a URL abaixo</p>
              </div>
            </div>
            <input
              type="url"
              value={form.image_url}
              onChange={e => setForm({ ...form, image_url: e.target.value })}
              className={`${inputClass} mt-2`}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? '⏳ Salvando...' : '💾 Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          <p className="text-4xl mb-2">📦</p>
          <p>Nenhum produto cadastrado</p>
          <p className="text-sm">Clique em "Novo Produto" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                {product.badge && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-pink-500 text-white text-xs rounded-full">
                    {product.badge === 'destaque' && '⭐ Destaque'}
                    {product.badge === 'promocao' && '🔥 Promoção'}
                    {product.badge === 'novo' && '🆕 Novo'}
                    {product.badge === 'mais_vendido' && '🏆 Top'}
                  </span>
                )}
                <button
                  onClick={() => toggleFeatured(product)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full ${product.is_featured ? 'bg-yellow-400' : 'bg-gray-200'}`}
                  title={product.is_featured ? 'Remover destaque' : 'Destacar'}
                >
                  ⭐
                </button>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-800 truncate">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.category || 'Sem categoria'}</p>
                <div className="flex items-center gap-2 mt-2">
                  {product.original_price && (
                    <span className="text-sm text-gray-400 line-through">
                      R$ {product.original_price.toFixed(2)}
                    </span>
                  )}
                  <span className="font-bold text-pink-500">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => editProduct(product)}
                    className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
