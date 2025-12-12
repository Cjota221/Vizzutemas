import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { DemoProduct } from '@/lib/supabase/store'

type Props = {
  themeId: string
  onUpdate: (products: DemoProduct[]) => void
  onMessage: (type: 'success' | 'error', text: string) => void
  onClose: () => void
  existingProducts: DemoProduct[]
}

type PendingProduct = {
  id: string
  file: File
  preview: string
  name: string
  price: string
  selected: boolean
  uploading: boolean
  uploaded: boolean
  error?: string
}

export default function BulkProductUpload({ themeId, onUpdate, onMessage, onClose, existingProducts }: Props) {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([])
  const [globalPrice, setGlobalPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const newProducts: PendingProduct[] = files.map((file, index) => {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      return {
        id: `pending-${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
        name: nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        price: globalPrice,
        selected: true,
        uploading: false,
        uploaded: false
      }
    })

    setPendingProducts(prev => [...prev, ...newProducts])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [globalPrice])

  // Update individual product
  const updateProduct = (id: string, updates: Partial<PendingProduct>) => {
    setPendingProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  // Remove product
  const removeProduct = (id: string) => {
    setPendingProducts(prev => {
      const product = prev.find(p => p.id === id)
      if (product) URL.revokeObjectURL(product.preview)
      return prev.filter(p => p.id !== id)
    })
  }

  // Toggle selection
  const toggleSelection = (id: string) => {
    updateProduct(id, { selected: !pendingProducts.find(p => p.id === id)?.selected })
  }

  // Select all / deselect all
  const toggleSelectAll = () => {
    const allSelected = pendingProducts.every(p => p.selected)
    setPendingProducts(prev => prev.map(p => ({ ...p, selected: !allSelected })))
  }

  // Apply global price to all
  const applyGlobalPrice = () => {
    if (!globalPrice) return
    setPendingProducts(prev => prev.map(p => ({ ...p, price: globalPrice })))
  }

  // Upload single image
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`
      const { error } = await supabase.storage.from('theme-assets').upload(filePath, file)
      if (error) throw error
      const { data } = supabase.storage.from('theme-assets').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  // Save all selected products
  const handleSaveAll = async () => {
    const selectedProducts = pendingProducts.filter(p => p.selected && !p.uploaded)
    
    if (selectedProducts.length === 0) {
      onMessage('error', 'Selecione pelo menos um produto')
      return
    }

    const invalidProducts = selectedProducts.filter(p => !p.name || !p.price)
    if (invalidProducts.length > 0) {
      onMessage('error', 'Preencha nome e preço de todos os produtos selecionados')
      return
    }

    setSaving(true)
    const newProducts: DemoProduct[] = []

    for (const product of selectedProducts) {
      updateProduct(product.id, { uploading: true })

      try {
        // Upload image
        const imageUrl = await uploadImage(product.file)
        if (!imageUrl) {
          updateProduct(product.id, { uploading: false, error: 'Erro no upload' })
          continue
        }

        // Create product in database
        const { data, error } = await supabase
          .from('demo_products')
          .insert({
            theme_id: themeId,
            name: product.name,
            price: parseFloat(product.price),
            image_url: imageUrl,
            stock: 100,
            is_active: true,
            is_featured: false,
            sort_order: existingProducts.length + newProducts.length
          })
          .select()
          .single()

        if (error) throw error

        newProducts.push(data as DemoProduct)
        updateProduct(product.id, { uploading: false, uploaded: true })
      } catch (error) {
        console.error('Error saving product:', error)
        updateProduct(product.id, { uploading: false, error: 'Erro ao salvar' })
      }
    }

    setSaving(false)

    if (newProducts.length > 0) {
      onUpdate([...existingProducts, ...newProducts])
      onMessage('success', `${newProducts.length} produto(s) adicionado(s)!`)
      
      // Remove uploaded products from pending list
      setPendingProducts(prev => prev.filter(p => !p.uploaded))
    }
  }

  const selectedCount = pendingProducts.filter(p => p.selected && !p.uploaded).length
  const uploadedCount = pendingProducts.filter(p => p.uploaded).length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Cadastro em Massa</h2>
            <p className="text-sm text-gray-500">Selecione imagens para criar produtos automaticamente</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3 items-center">
            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Adicionar Imagens
            </button>

            {/* Global price */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Preço:</span>
              <input
                type="number"
                step="0.01"
                value={globalPrice}
                onChange={(e) => setGlobalPrice(e.target.value)}
                placeholder="0.00"
                className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={applyGlobalPrice}
                disabled={!globalPrice || pendingProducts.length === 0}
                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar a todos
              </button>
            </div>

            {/* Select all */}
            {pendingProducts.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                {pendingProducts.every(p => p.selected) ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {pendingProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">Nenhuma imagem selecionada</p>
              <p className="text-sm text-gray-400">Clique em "Adicionar Imagens" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pendingProducts.map((product) => (
                <div 
                  key={product.id} 
                  className={`relative border rounded-lg overflow-hidden transition-all ${
                    product.uploaded 
                      ? 'border-green-300 bg-green-50' 
                      : product.selected 
                        ? 'border-blue-300 ring-2 ring-blue-200' 
                        : 'border-gray-200'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={product.preview} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Checkbox overlay */}
                    {!product.uploaded && (
                      <button
                        onClick={() => toggleSelection(product.id)}
                        className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          product.selected 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {product.selected && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Remove button */}
                    {!product.uploaded && !product.uploading && (
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}

                    {/* Status overlay */}
                    {(product.uploading || product.uploaded || product.error) && (
                      <div className={`absolute inset-0 flex items-center justify-center ${
                        product.uploading ? 'bg-white/80' : product.uploaded ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {product.uploading && (
                          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                        {product.uploaded && (
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {product.error && (
                          <span className="text-xs text-red-600 bg-white px-2 py-1 rounded">{product.error}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  {!product.uploaded && (
                    <div className="p-2 space-y-2">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                        placeholder="Nome do produto"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, { price: e.target.value })}
                          placeholder="0.00"
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedCount > 0 && <span>{selectedCount} selecionado(s)</span>}
            {uploadedCount > 0 && <span className="ml-2 text-green-600">• {uploadedCount} salvo(s)</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving || selectedCount === 0}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : `Salvar ${selectedCount} Produto(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
