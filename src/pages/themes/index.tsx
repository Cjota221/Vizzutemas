import { GetServerSideProps } from 'next'
import ThemeCard from '@/components/ThemeCard'
import { listPublishedThemes } from '@/lib/supabase/themes'
import { Theme } from '@/lib/types'
import Link from 'next/link'

type Props = {
  themes: Theme[]
}

/**
 * Galeria de Temas - Design: Modern SaaS / Linear-style
 */
export default function ThemesPage({ themes }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-900">Vizzutemas</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/themes" className="text-sm text-slate-900 font-medium">
              Temas
            </Link>
            <Link href="/admin/themes" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Galeria de Temas</h1>
        <p className="text-slate-600 mb-8">
          Escolha o tema perfeito para transformar sua loja
        </p>

        {themes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <p className="text-sm text-slate-500 mb-3">Nenhum tema disponível no momento.</p>
            <Link 
              href="/admin/themes/new" 
              className="text-sm text-slate-700 hover:text-slate-900 transition-colors"
            >
              Criar primeiro tema →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <p className="text-sm text-slate-400">© 2025 Vizzutemas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const themes = await listPublishedThemes()
    return { props: { themes: themes || [] } }
  } catch (error) {
    console.error('Erro no getServerSideProps de themes:', error)
    return { props: { themes: [] } }
  }
}
