import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { getThemeBySlug } from '@/lib/supabase/themes'
import { Theme } from '@/lib/types'

type Props = {
  theme: Theme | null
}

/**
 * Página de checkout - Formulário para comprar um tema
 */
export default function CheckoutPage({ theme }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!theme) {
      setError('Tema não encontrado')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme_id: theme.id,
          customer_name: name,
          customer_email: email,
          notes,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push(`/checkout/success?id=${data.order.id}`)
      } else {
        setError(data.error || 'Erro ao criar pedido')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-blue-600">
            Vizzutemas
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/themes/${theme.slug}`} className="text-blue-600 hover:underline mb-6 inline-block">
          ← Voltar para detalhes
        </Link>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Finalizar Compra</h1>

          {/* Resumo do tema */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-800">{theme.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
            <div className="text-xl font-bold text-blue-600 mt-2">
              {theme.price ? `R$ ${theme.price}` : 'Grátis'}
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Alguma informação adicional..."
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : 'Confirmar Pedido'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              * Por enquanto, este é um pedido de simulação. Nenhum pagamento será processado.
            </p>
          </form>
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
