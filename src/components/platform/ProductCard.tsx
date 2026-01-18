import { ColorConfig } from '@/lib/types'

type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  badge?: 'destaque' | 'promocao' | 'novo'
  installments?: number
}

type Props = {
  product: Product
  colors: ColorConfig
  onQuero?: () => void
  onOpenProduct?: () => void
}

export default function ProductCard({ product, colors, onQuero, onOpenProduct }: Props) {
  const installmentValue = product.installments 
    ? (product.price / product.installments).toFixed(2).replace('.', ',')
    : null

  return (
    <div className="product-card bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
      {/* Imagem do produto */}
      <div 
        className="relative aspect-square cursor-pointer"
        onClick={onOpenProduct}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {/* Badge */}
        {product.badge && (
          <span 
            className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded"
            style={{ 
              backgroundColor: product.badge === 'promocao' ? '#ef4444' : 
                              product.badge === 'novo' ? '#22c55e' : 
                              colors.cor_detalhes_gerais 
            }}
          >
            {product.badge === 'destaque' ? 'Destaque' : 
             product.badge === 'promocao' ? 'Promoção' : 'Novo'}
          </span>
        )}
      </div>

      {/* Info do produto */}
      <div className="p-3">
        <h3 
          className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px] cursor-pointer hover:underline"
          onClick={onOpenProduct}
        >
          {product.name}
        </h3>

        {/* Preço */}
        <div className="mt-2">
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              R$ {product.originalPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
          <p className="text-lg font-bold" style={{ color: colors.cor_detalhes_gerais }}>
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
        </div>

        {/* Botão Comprar */}
        <button
          onClick={onQuero}
          className="w-full mt-3 py-2.5 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 transition hover:opacity-90"
          style={{ backgroundColor: colors.cor_botao_enviar_pedido }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          COMPRAR
        </button>

        {/* Parcelamento */}
        {installmentValue && (
          <p className="text-xs text-gray-500 mt-2">
            <span style={{ color: colors.cor_detalhes_gerais }}>⊕</span> {product.installments}x de{' '}
            <span style={{ color: colors.cor_detalhes_gerais }}>R$ {installmentValue}</span>{' '}
            <span className="text-gray-400">no Cartão</span>
          </p>
        )}

        {/* Ícones de ação */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
          <button className="text-gray-400 hover:text-red-500 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-blue-500 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-green-500 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
