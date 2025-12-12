import Link from 'next/link'
import { Theme } from '@/lib/types'

type Props = {
  theme: Theme
}

/**
 * Card de tema para a galeria
 * Mostra thumbnail, nome, descrição, preço e botões de ação
 */
export default function ThemeCard({ theme }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white">
      {/* Thumbnail */}
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        {theme.thumbnail_url ? (
          <img 
            src={theme.thumbnail_url} 
            alt={`${theme.name} thumbnail`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400">Sem imagem</span>
        )}
      </div>
      
      {/* Conteúdo */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-800">{theme.name}</h3>
          {theme.status === 'published' && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Publicado
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {theme.description || 'Sem descrição'}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-blue-600">
            {theme.price ? `R$ ${theme.price}` : 'Grátis'}
          </div>
          
          <div className="space-x-2">
            <Link 
              href={`/themes/${theme.slug}`}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Detalhes
            </Link>
            <Link 
              href={`/preview/${theme.slug}`}
              className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
