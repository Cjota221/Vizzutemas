import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getThemeById } from '@/lib/supabase/themes'
import { 
  getAllProductsByTheme, 
  createProductsBulk, 
  deleteProduct, 
  deleteAllProductsByTheme,
  getNiches,
  importNicheToTheme,
  parseCSV,
  generateSampleCSV,
  DemoProduct
} from '@/lib/supabase/products'

type Theme = {
  id: string
  name: string
  slug: string
}

export default function ThemeProductsPage() {
  const router = useRouter()
  const { id } = router.query

  const [theme, setTheme] = useState<Theme | null>(null)
  const [products, setProducts] = useState<DemoProduct[]>([])
  const [niches, setNiches] = useState<{ niche: string; niche_label: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'bulk' | 'niche'>('list')
  
  // Form para cadastro em massa
  const [bulkText, setBulkText] = useState('')
  const [bulkFormat, setBulkFormat] = useState<'csv' | 'simple'>('simple')

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [themeData, productsData, nichesData] = await Promise.all([
        getThemeById(id as string),
        getAllProductsByTheme(id as string),
        getNiches()
      ])
      setTheme(themeData)
      setProducts(productsData)
      setNiches(nichesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setLoading(false)
  }

  // Importar de nicho
  const handleImportNiche = async (niche: string) => {
    if (!id) return
    
    setImporting(true)
    try {
      const result = await importNicheToTheme(id as string, niche)
      alert(`✅ Importados ${result.success} produtos!`)
      loadData()
    } catch (error) {
      console.error('Erro ao importar:', error)
      alert('❌ Erro ao importar produtos')
    }
    setImporting(false)
  }

  // Cadastro em massa (texto simples ou CSV)
  const handleBulkImport = async () => {
    if (!id || !bulkText.trim()) return

    setImporting(true)
    try {
      let productsToCreate: Omit<DemoProduct, 'id'>[] = []

      if (bulkFormat === 'csv') {
        productsToCreate = parseCSV(bulkText, id as string)
      } else {
        // Formato simples: uma linha por produto
        // Nome | Preço | Imagem | Categoria
        const lines = bulkText.trim().split('\n').filter(l => l.trim())
        productsToCreate = lines.map((line, index) => {
          const parts = line.split('|').map(p => p.trim())
          return {
            theme_id: id as string,
            name: parts[0] || 'Produto sem nome',
            price: parseFloat(parts[1]?.replace(',', '.')) || 0,
            image_url: parts[2] || 'https://via.placeholder.com/400',
            category: parts[3] || undefined,
            badge: null,
            installments: 12,
            variations: [],
            sort_order: index,
            active: true,
          }
        }).filter(p => p.name && p.price > 0)
      }

      if (productsToCreate.length === 0) {
        alert('⚠️ Nenhum produto válido encontrado')
        setImporting(false)
        return
      }

      const result = await createProductsBulk(productsToCreate)
      alert(`✅ Cadastrados ${result.success} produtos!`)
      setBulkText('')
      loadData()
    } catch (error) {
      console.error('Erro ao importar:', error)
      alert('❌ Erro ao cadastrar produtos')
    }
    setImporting(false)
  }

  // Download CSV de exemplo
  const handleDownloadSample = () => {
    const csv = generateSampleCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'produtos_exemplo.csv'
    link.click()
  }

  // Deletar produto
  const handleDelete = async (productId: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return
    
    const success = await deleteProduct(productId)
    if (success) {
      setProducts(products.filter(p => p.id !== productId))
    }
  }

  // Limpar todos os produtos
  const handleClearAll = async () => {
    if (!id) return
    if (!confirm('⚠️ ATENÇÃO: Isso vai excluir TODOS os produtos deste tema. Continuar?')) return
    
    const success = await deleteAllProductsByTheme(id as string)
    if (success) {
      setProducts([])
      alert('✅ Todos os produtos foram removidos')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (!theme) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">Tema não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/themes/${id}`} className="text-gray-500 hover:text-gray-700">
              ← Voltar
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Produtos de Demonstração</h1>
              <p className="text-sm text-gray-500">Tema: {theme.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {products.length} produto(s)
            </span>
            {products.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
              >
                Limpar Todos
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'list' 
                ? 'bg-pink-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 Lista ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('niche')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'niche' 
                ? 'bg-pink-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🏷️ Importar por Nicho
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'bulk' 
                ? 'bg-pink-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📥 Cadastro em Massa
          </button>
        </div>

        {/* Tab: Lista de produtos */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-lg shadow-sm">
            {products.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-lg">Nenhum produto cadastrado</p>
                <p className="text-sm mt-2">
                  Use as abas acima para importar produtos de um nicho ou cadastrar em massa.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagem</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {product.original_price && (
                            <span className="text-gray-400 line-through mr-2">
                              R$ {product.original_price.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                          <span className="text-pink-600 font-bold">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product.category || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {product.badge && (
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              product.badge === 'destaque' ? 'bg-yellow-100 text-yellow-800' :
                              product.badge === 'promocao' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {product.badge}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            🗑️ Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Importar por Nicho */}
        {activeTab === 'niche' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              🏷️ Importar Produtos por Nicho
            </h2>
            <p className="text-gray-600 mb-6">
              Selecione um nicho para importar produtos de demonstração pré-configurados:
            </p>

            {niches.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Nenhum nicho disponível.</p>
                <p className="text-sm mt-2">Execute a migration para criar os templates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {niches.map((niche) => (
                  <div 
                    key={niche.niche}
                    className="border rounded-lg p-4 hover:border-pink-300 transition"
                  >
                    <h3 className="font-bold text-gray-900">{niche.niche_label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{niche.count} produtos</p>
                    <button
                      onClick={() => handleImportNiche(niche.niche)}
                      disabled={importing}
                      className="mt-3 w-full py-2 bg-pink-500 text-white rounded font-medium hover:bg-pink-600 disabled:opacity-50 transition"
                    >
                      {importing ? 'Importando...' : '📥 Importar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Cadastro em Massa */}
        {activeTab === 'bulk' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              📥 Cadastro em Massa
            </h2>

            {/* Seletor de formato */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={bulkFormat === 'simple'}
                  onChange={() => setBulkFormat('simple')}
                  className="text-pink-500"
                />
                <span className="text-sm">Formato Simples</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={bulkFormat === 'csv'}
                  onChange={() => setBulkFormat('csv')}
                  className="text-pink-500"
                />
                <span className="text-sm">CSV Completo</span>
              </label>
            </div>

            {/* Instruções */}
            <div className="bg-gray-50 rounded p-4 mb-4 text-sm">
              {bulkFormat === 'simple' ? (
                <>
                  <p className="font-medium text-gray-700 mb-2">Formato simples (uma linha por produto):</p>
                  <code className="block bg-gray-200 p-2 rounded text-xs">
                    Nome do Produto | Preço | URL da Imagem | Categoria
                  </code>
                  <p className="mt-2 text-gray-600">Exemplo:</p>
                  <code className="block bg-gray-200 p-2 rounded text-xs mt-1">
                    Rasteirinha Rose Gold | 25,00 | https://img.com/foto.jpg | Rasteiras<br/>
                    Sandália Dourada | 37,00 | https://img.com/foto2.jpg | Sandálias
                  </code>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-700 mb-2">Formato CSV (com cabeçalho):</p>
                  <p className="text-gray-600">
                    Colunas: nome, preco, preco_original, imagem, categoria, badge, parcelas, tamanhos
                  </p>
                  <button
                    onClick={handleDownloadSample}
                    className="mt-2 text-pink-600 hover:text-pink-700 font-medium"
                  >
                    📄 Baixar CSV de exemplo
                  </button>
                </>
              )}
            </div>

            {/* Textarea para colar dados */}
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={bulkFormat === 'simple' 
                ? "Cole aqui os produtos (um por linha)...\n\nExemplo:\nRasteirinha Rose | 25,00 | https://img.com/1.jpg | Rasteiras\nSandália Dourada | 37,00 | https://img.com/2.jpg | Sandálias"
                : "Cole aqui o conteúdo CSV..."
              }
              className="w-full h-64 p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setBulkText('')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Limpar
              </button>
              <button
                onClick={handleBulkImport}
                disabled={importing || !bulkText.trim()}
                className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 transition"
              >
                {importing ? 'Importando...' : '📥 Importar Produtos'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
