import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { DemoProduct } from '@/lib/supabase/store'
import BulkProductUpload from './BulkProductUpload'

type Props = {
  themeId: string
  products: DemoProduct[]
  onUpdate: (products: DemoProduct[]) => void
  onMessage: (type: 'success' | 'error', text: string) => void
}

const badges = [
  { value: '', label: 'Nenhum' },
  { value: 'destaque', label: 'Destaque' },
  { value: 'promocao', label: 'Promoção' },
  { value: 'novo', label: 'Novo' },
  { value: 'mais_vendido', label: 'Mais Vendido' },
]

export default function ProductsTab({ themeId, products, onUpdate, onMessage }: Props) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
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
      // Dados básicos que certamente existem na tabela
      const productData: Record<string, unknown> = {
        theme_id: themeId,
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        image_url: form.image_url,
        category: form.category || null,
        is_active: true
      }

      if (editingProduct) {
        const { data, error } = await supabase
          .from('demo_products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          onMessage('error', `Erro: ${error.message}`)
          return
        }
        onUpdate(products.map(p => p.id === editingProduct.id ? data as DemoProduct : p))
        onMessage('success', 'Produto atualizado!')
      } else {
        const { data, error } = await supabase
          .from('demo_products')
          .insert(productData)
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          onMessage('error', `Erro: ${error.message}`)
          return
        }
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

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  // Agrupar produtos por categoria
  const categories = [...new Set(products.map(p => p.category || 'Sem categoria'))]

  return (
    <div className="space-y-6">
      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkProductUpload
          themeId={themeId}
          existingProducts={products}
          onUpdate={onUpdate}
          onMessage={onMessage}
          onClose={() => setShowBulkUpload(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Produtos ({products.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cadastro em Massa
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            + Novo Produto
          </button>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-5">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h4>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="is_featured" className="text-sm text-gray-700">Produto em destaque</label>
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
                  {uploading ? 'Enviando...' : 'Enviar Imagem'}
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

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600 mb-1">Nenhum produto cadastrado</p>
          <p className="text-sm text-gray-400">Clique em "Novo Produto" ou "Cadastro em Massa"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                {product.badge && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                    {product.badge === 'destaque' && 'Destaque'}
                    {product.badge === 'promocao' && 'Promoção'}
                    {product.badge === 'novo' && 'Novo'}
                    {product.badge === 'mais_vendido' && 'Top'}
                  </span>
                )}
                {product.is_featured && (
                  <span className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.category || 'Sem categoria'}</p>
                <div className="flex items-center gap-2 mt-2">
                  {product.original_price && (
                    <span className="text-sm text-gray-400 line-through">
                      R$ {product.original_price.toFixed(2)}
                    </span>
                  )}
                  <span className="font-semibold text-blue-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => editProduct(product)}
                    className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm transition-colors"
                  >
                    Excluir
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
