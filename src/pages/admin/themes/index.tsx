import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { listThemes } from '@/lib/supabase/themes'
import { Theme } from '@/lib/types'
import AdminLayout, { PageHeader, Card } from '@/components/admin/AdminLayout'

type Props = {
  themes: Theme[]
}

export default function AdminThemes({ themes }: Props) {
  return (
    <AdminLayout title="Temas">
      <PageHeader
        title="Temas"
        description="Gerencie seus temas de e-commerce"
        action={
          <Link
            href="/admin/themes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Tema
          </Link>
        }
      />

      {themes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">Nenhum tema criado</h3>
          <p className="text-sm text-gray-500 mb-4">Comece criando seu primeiro tema.</p>
          <Link
            href="/admin/themes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Tema
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <Card key={theme.id} padding={false} className="overflow-hidden group">
              <div className="aspect-video bg-gray-100 relative">
                {theme.thumbnail_url ? (
                  <img src={theme.thumbnail_url} alt={theme.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    theme.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : theme.status === 'draft' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {theme.status === 'published' ? 'Publicado' : theme.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{theme.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{theme.description || 'Sem descrição'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {theme.price ? `R$ ${theme.price}` : 'Grátis'}
                  </span>
                  <div className="flex gap-2">
                    <Link 
                      href={`/preview/${theme.slug}`} 
                      target="_blank" 
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    >
                      Ver
                    </Link>
                    <Link 
                      href={`/admin/themes/${theme.id}`} 
                      className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const themes = await listThemes()
  return { props: { themes: themes || [] } }
}