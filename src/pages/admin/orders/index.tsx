import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { listOrders, updateOrderStatus } from '@/lib/supabase/orders'
import { Order } from '@/lib/types'
import AdminLayout, { PageHeader, Card } from '@/components/admin/AdminLayout'

type Props = {
  orders: Order[]
}

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
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      delivered: 'bg-blue-100 text-blue-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-600'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      cancelled: 'Cancelado',
      delivered: 'Entregue',
    }
    return labels[status] || status
  }

  return (
    <AdminLayout title="Pedidos">
      <PageHeader
        title="Pedidos"
        description="Acompanhe os pedidos dos clientes"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pendentes</p>
          <p className="text-2xl font-semibold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pagos</p>
          <p className="text-2xl font-semibold text-green-600">{orders.filter(o => o.status === 'paid').length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Entregues</p>
          <p className="text-2xl font-semibold text-blue-600">{orders.filter(o => o.status === 'delivered').length}</p>
        </Card>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">Nenhum pedido</h3>
          <p className="text-sm text-gray-500">Os pedidos aparecerão aqui.</p>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{order.customer_name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{order.customer_email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(order.status || 'pending')}`}>
                        {getStatusLabel(order.status || 'pending')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {order.created_at ? formatDate(order.created_at) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        disabled={updating === order.id}
                        className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
        </Card>
      )}
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const orders = await listOrders()
  return { props: { orders } }
}
