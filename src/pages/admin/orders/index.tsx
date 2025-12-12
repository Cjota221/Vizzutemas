import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import { listOrders, updateOrderStatus } from '@/lib/supabase/orders'
import { Order } from '@/lib/types'

type Props = {
  orders: Order[]
}

/**
 * Admin - Lista de Pedidos
 * Tabela com colunas: tema (nome), cliente (e-mail), status, data de criação.
 * Campo simples para atualizar o status manualmente.
 */
export default function AdminOrders({ orders: initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [updating, setUpdating] = useState<string | null>(null)

  async function handleStatusChange(orderId: string, newStatus: Order['status']) {
    setUpdating(orderId)
    const updated = await updateOrderStatus(orderId, newStatus)
    if (updated) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    }
    setUpdating(null)
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getStatusBadgeClass(status: Order['status']) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'delivered':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusLabel(status: Order['status']) {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'paid':
        return 'Pago'
      case 'cancelled':
        return 'Cancelado'
      case 'delivered':
        return 'Entregue'
      default:
        return status
    }
  }

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
            <Link href="/admin/orders" className="text-white font-semibold">
              Pedidos
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-gray-600 text-lg">Nenhum pedido ainda.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Tema
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    E-mail
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Criado em
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">
                      {/* Idealmente aqui mostraria o nome do tema */}
                      <span className="font-mono text-sm">{order.theme_id.slice(0, 8)}...</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{order.customer_name}</td>
                    <td className="px-4 py-3 text-gray-600">{order.customer_email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {order.created_at ? formatDate(order.created_at) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as Order['status'])
                        }
                        disabled={updating === order.id}
                        className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-50"
                      >
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const orders = await listOrders()
  return { props: { orders } }
}
