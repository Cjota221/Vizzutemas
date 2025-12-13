import Link from 'next/link'
import { Theme } from '@/lib/types'

type Props = {
  theme: Theme
}

/**
 * Card de tema para a galeria
 * Design: Modern SaaS / Linear-style
 */
export default function ThemeCard({ theme }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
      {/* Thumbnail */}
      <div className="aspect-video bg-slate-100 flex items-center justify-center">
        {theme.thumbnail_url ? (
          <img 
            src={theme.thumbnail_url} 
            alt={`${theme.name} thumbnail`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        )}
      </div>
      
      {/* Conteúdo */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-900">{theme.name}</h3>
          {theme.status === 'published' && (
            <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Publicado
            </span>
          )}
        </div>
        
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {theme.description || 'Sem descrição'}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-sm font-semibold text-slate-900">
            {theme.price ? `R$ ${theme.price}` : 'Grátis'}
          </div>
          
          <div className="flex gap-2">
            <Link 
              href={`/themes/${theme.slug}`}
              className="text-sm px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              Detalhes
            </Link>
            <Link 
              href={`/preview/${theme.slug}`}
              className="text-sm px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
