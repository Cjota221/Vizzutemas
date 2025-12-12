import { useState } from 'react'
import { ColorConfig } from '@/lib/types'

type ProductVariation = {
  size: string
  sku: string
  available: boolean
}

type ProductImage = {
  url: string
  alt?: string
}

type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: ProductImage[]
  tag?: string
  variations: ProductVariation[]
  installments?: number
}

type Props = {
  product: Product
  colors: ColorConfig
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (variation: ProductVariation, quantity: number) => void
}

export default function ProductModal({ product, colors, isOpen, onClose, onAddToCart }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantities, setQuantities] = useState<Record<string, number>>(
    product.variations.reduce((acc, v) => ({ ...acc, [v.size]: 0 }), {})
  )

  if (!isOpen) return null

  const installmentValue = product.installments 
    ? (product.price / product.installments).toFixed(2).replace('.', ',')
    : null

  const updateQuantity = (size: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, (prev[size] || 0) + delta)
    }))
  }

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        {/* Header com imagem */}
        <div className="relative">
          {/* Imagem principal */}
          <div className="aspect-square bg-gray-100">
            <img 
              src={product.images[selectedImage]?.url} 
              alt={product.images[selectedImage]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Botão fechar */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Botão download */}
          <button className="absolute bottom-4 right-4 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>

        {/* Miniaturas */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {product.images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 transition ${
                selectedImage === index 
                  ? 'border-2 shadow-lg' 
                  : 'border-gray-200'
              }`}
              style={{ borderColor: selectedImage === index ? colors.cor_detalhes_gerais : undefined }}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Info do produto */}
        <div className="px-4 pb-4">
          <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
          
          {/* Tag */}
          {product.tag && (
            <span 
              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium rounded"
              style={{ backgroundColor: colors.cor_detalhes_fundo, color: colors.cor_detalhes_gerais }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {product.tag}
            </span>
          )}

          {/* Preço e parcelamento */}
          <div className="flex items-center justify-between mt-3">
            <div>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
              <p className="text-2xl font-bold text-gray-800">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            </div>
            
            {installmentValue && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span 
                  className="text-lg"
                  style={{ color: colors.cor_detalhes_gerais }}
                >⊕</span>
                {product.installments}x de R$ {installmentValue}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Variações */}
        <div className="px-4 pb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Escolha as Variações</h3>
          
          <div className="space-y-3">
            {product.variations.map((variation) => (
              <div 
                key={variation.size}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div>
                  <span className="font-bold text-gray-800">{variation.size}</span>
                  <p className="text-xs text-gray-400"># {variation.sku}</p>
                </div>

                {/* Controle de quantidade */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(variation.size, -1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold transition hover:opacity-80"
                    style={{ backgroundColor: colors.cor_demais_botoes }}
                    disabled={quantities[variation.size] === 0}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-800">
                    {quantities[variation.size]}
                  </span>
                  <button
                    onClick={() => updateQuantity(variation.size, 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold transition hover:opacity-80"
                    style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Barra inferior - Finalizar Pedido */}
        <div 
          className="sticky bottom-0 p-4"
          style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
        >
          <button 
            className="w-full py-3 text-white font-bold text-lg flex items-center justify-center gap-2"
            onClick={() => {
              product.variations.forEach(v => {
                if (quantities[v.size] > 0) {
                  onAddToCart?.(v, quantities[v.size])
                }
              })
            }}
          >
            FINALIZAR PEDIDO
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
