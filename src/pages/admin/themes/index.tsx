import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { listThemes } from '@/lib/supabase/themes'
import { Theme } from '@/lib/types'

type Props = {
  themes: Theme[]
}

/**
 * Admin - Lista de temas
 */
export default function AdminThemes({ themes }: Props) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Admin */}
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/themes" className="font-bold text-xl">
            Vizzutemas Admin
          </Link>
          <nav className="flex gap-4">
            <Link href="/admin/themes" className="text-gray-300 hover:text-white">
              Temas
            </Link>
            <Link href="/admin/orders" className="text-gray-300 hover:text-white">
              Pedidos
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white">
              Ver Site
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Temas</h1>
          <Link
            href="/admin/themes/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Novo Tema
          </Link>
        </div>

        {/* Tabela de temas */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Preço</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Criado em</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {themes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhum tema cadastrado.{' '}
                    <Link href="/admin/themes/new" className="text-blue-600 hover:underline">
                      Criar primeiro tema
                    </Link>
                  </td>
                </tr>
              ) : (
                themes.map((theme) => (
                  <tr key={theme.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{theme.name}</td>
                    <td className="px-4 py-3 text-gray-600">{theme.slug}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {theme.price ? `R$ ${theme.price}` : 'Grátis'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          theme.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : theme.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {theme.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {theme.created_at ? new Date(theme.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/themes/${theme.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Editar
                        </Link>
                        <Link
                          href={`/preview/${theme.slug}`}
                          className="text-sm text-gray-600 hover:underline"
                        >
                          Preview
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const themes = await listThemes()
  return { props: { themes } }
}
