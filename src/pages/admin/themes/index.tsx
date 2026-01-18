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
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo Tema
          </Link>
        }
      />

      {themes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">Nenhum tema criado</h3>
          <p className="text-sm text-slate-500 mb-5">Comece criando seu primeiro tema.</p>
          <Link
            href="/admin/themes/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
          >
            Criar Tema
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <Card key={theme.id} padding={false} className="overflow-hidden group hover:border-slate-300 transition-colors">
              <div className="aspect-video bg-slate-100 relative">
                {theme.thumbnail_url ? (
                  <img src={theme.thumbnail_url} alt={theme.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    theme.status === 'published' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : theme.status === 'draft' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {theme.status === 'published' ? 'Publicado' : theme.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-900 mb-1">{theme.name}</h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{theme.description || 'Sem descrição'}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-900">
                    {theme.price ? `R$ ${theme.price}` : 'Grátis'}
                  </span>
                  <div className="flex gap-1">
                    <Link 
                      href={`/preview/${theme.slug}`} 
                      target="_blank" 
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                      title="Visualizar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                    <Link 
                      href={`/admin/themes/${theme.id}`} 
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
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
  try {
    const themes = await listThemes()
    return { props: { themes: themes || [] } }
  } catch (error) {
    console.error('Erro no getServerSideProps de admin/themes:', error)
    return { props: { themes: [] } }
  }
}