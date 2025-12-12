import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { getThemeBySlug } from '@/lib/supabase/themes'
import { Theme } from '@/lib/types'

type Props = {
  theme: Theme | null
}

/**
 * Página de detalhes de um tema
 */
export default function ThemeDetails({ theme }: Props) {
  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Tema não encontrado</h1>
          <Link href="/themes" className="text-blue-600 hover:underline">
            ← Voltar para galeria
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-blue-600">
            Vizzutemas
          </Link>
          <nav className="flex gap-4">
            <Link href="/themes" className="text-gray-600 hover:text-gray-900">
              Temas
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8">
        <Link href="/themes" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Voltar para galeria
        </Link>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thumbnail */}
            <div className="bg-gray-100 rounded-lg h-64 md:h-96 flex items-center justify-center">
              {theme.thumbnail_url ? (
                <img 
                  src={theme.thumbnail_url} 
                  alt={theme.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-400">Sem imagem</span>
              )}
            </div>

            {/* Informações */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{theme.name}</h1>
              
              <p className="text-gray-600 mb-6">
                {theme.description || 'Sem descrição disponível.'}
              </p>

              <div className="text-3xl font-bold text-blue-600 mb-6">
                {theme.price ? `R$ ${theme.price}` : 'Grátis'}
              </div>

              {/* Destaques (placeholder) */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Destaques:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Design responsivo</li>
                  <li>Fácil personalização</li>
                  <li>Compatível com a plataforma</li>
                  <li>Suporte incluído</li>
                </ul>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-4">
                <Link
                  href={`/preview/${theme.slug}`}
                  className="flex-1 text-center px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                  Ver Demo
                </Link>
                <Link
                  href={`/checkout/${theme.slug}`}
                  className="flex-1 text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  Comprar Tema
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.slug as string
  const theme = await getThemeBySlug(slug)
  return { props: { theme } }
}
