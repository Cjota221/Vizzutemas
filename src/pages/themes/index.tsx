import { GetServerSideProps } from 'next'
import ThemeCard from '@/components/ThemeCard'
import { listPublishedThemes } from '@/lib/supabase/themes'
import { Theme } from '@/lib/types'
import Link from 'next/link'

type Props = {
  themes: Theme[]
}

/**
 * Galeria de Temas - Lista todos os temas publicados
 */
export default function ThemesPage({ themes }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simples */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-blue-600">
            Vizzutemas
          </Link>
          <nav className="flex gap-4">
            <Link href="/themes" className="text-gray-600 hover:text-gray-900">
              Temas
            </Link>
            <Link href="/admin/themes" className="text-gray-600 hover:text-gray-900">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Galeria de Temas</h1>
        <p className="text-gray-600 mb-8">
          Escolha o tema perfeito para transformar sua loja
        </p>

        {themes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500 mb-4">Nenhum tema disponível no momento.</p>
            <Link 
              href="/admin/themes/new" 
              className="text-blue-600 hover:underline"
            >
              Criar primeiro tema →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const themes = await listPublishedThemes()
  return { props: { themes } }
}
