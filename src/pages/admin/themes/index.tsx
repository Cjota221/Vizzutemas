import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { listThemes } from '@/lib/supabase/themes'
import { Theme } from '@/lib/types'
import AdminLayout, { PageHeader, Card } from '@/components/admin/AdminLayout'
import { Plus, Eye, Pencil, Calendar, DollarSign, Layers } from 'lucide-react'

type Props = {
  themes: Theme[]
}

export default function AdminThemes({ themes }: Props) {
  return (
    <AdminLayout title="Temas">
      <PageHeader
        title="Gerenciar Temas"
        description="Crie e gerencie seus temas de e-commerce"
        action={
          <Link
            href="/admin/themes/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            Novo Tema
          </Link>
        }
      />

      {themes.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Layers className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum tema criado</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Comece criando seu primeiro tema para e-commerce.
          </p>
          <Link
            href="/admin/themes/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Tema
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => (
            <Card key={theme.id} padding={false} className="overflow-hidden group">
              <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative overflow-hidden">
                {theme.thumbnail_url ? (
                  <img src={theme.thumbnail_url} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layers className="w-12 h-12 text-indigo-400/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : theme.status === 'draft' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                    {theme.status === 'published' ? 'Publicado' : theme.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-3">
                  <Link href={`/preview/${theme.slug}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-white/20 transition">
                    <Eye className="w-4 h-4" />Preview
                  </Link>
                  <Link href={`/admin/themes/${theme.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition">
                    <Pencil className="w-4 h-4" />Editar
                  </Link>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-white text-lg mb-1">{theme.name}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{theme.description || 'Sem descrição'}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <DollarSign className="w-4 h-4" />{theme.price ? `R$ ${theme.price}` : 'Grátis'}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-4 h-4" />{theme.created_at ? new Date(theme.created_at).toLocaleDateString('pt-BR') : '-'}
                  </span>
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