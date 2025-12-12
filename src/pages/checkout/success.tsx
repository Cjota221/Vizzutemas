import Link from 'next/link'
import { useRouter } from 'next/router'

/**
 * Página de sucesso após criar pedido
 */
export default function CheckoutSuccess() {
  const router = useRouter()
  const { id } = router.query

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido Recebido!</h1>
        <p className="text-gray-600 mb-4">
          Obrigado pelo seu pedido. Entraremos em contato em breve.
        </p>

        {id && (
          <p className="text-sm text-gray-500 mb-6">
            ID do pedido: <code className="bg-gray-100 px-2 py-1 rounded">{id}</code>
          </p>
        )}

        <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-6">
          ⚠️ Status inicial: <strong>pending</strong><br />
          Este é um pedido de simulação. Nenhum pagamento foi processado.
        </p>

        <div className="space-y-2">
          <Link
            href="/themes"
            className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Ver mais temas
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
