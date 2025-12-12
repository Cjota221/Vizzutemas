import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { listOrders, updateOrderStatus } from '@/lib/supabase/orders'
import { Order } from '@/lib/types'
import AdminLayout, { PageHeader, Card } from '@/components/admin/AdminLayout'
import { ShoppingBag, User, Mail, Calendar, Clock, CheckCircle, XCircle, Truck, AlertCircle } from 'lucide-react'

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
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getStatusConfig(status: Order['status']) {
    switch (status) {
      case 'pending':
        return { class: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Pendente', icon: Clock }
      case 'paid':
        return { class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Pago', icon: CheckCircle }
      case 'cancelled':
        return { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Cancelado', icon: XCircle }
      case 'delivered':
        return { class: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Entregue', icon: Truck }
      default:
        return { class: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: status, icon: AlertCircle }
    }
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <AdminLayout title="Pedidos">
      <PageHeader
        title="Gerenciar Pedidos"
        description="Acompanhe e gerencie os pedidos dos seus clientes"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-slate-400 text-sm">Total</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-amber-400 mb-1">{stats.pending}</div>
          <div className="text-slate-400 text-sm">Pendentes</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.paid}</div>
          <div className="text-slate-400 text-sm">Pagos</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">{stats.delivered}</div>
          <div className="text-slate-400 text-sm">Entregues</div>
        </Card>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum pedido ainda</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Os pedidos aparecerão aqui quando seus clientes comprarem temas.
          </p>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Tema</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Cliente</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300 hidden md:table-cell">E-mail</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300 hidden lg:table-cell">Data</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status)
                  const StatusIcon = statusConfig.icon
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                          {order.theme_id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                            {order.customer_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{order.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 hidden md:table-cell">{order.customer_email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.class}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm hidden lg:table-cell">
                        {order.created_at ? formatDate(order.created_at) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                          disabled={updating === order.id}
                          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition"
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                          <option value="delivered">Entregue</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
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
