import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type PaymentMethod = {
  id: string
  theme_id: string
  name: string
  type: string
  description: string | null
  fee_percent: number
  max_installments: number
  icon: string | null
  is_active: boolean
}

type Props = {
  themeId: string
  methods: PaymentMethod[]
  onUpdate: (methods: PaymentMethod[]) => void
  onMessage: (type: 'success' | 'error', text: string) => void
}

const paymentTypes = [
  { value: 'pix', label: 'PIX', icon: '💎', description: 'Pagamento instantâneo' },
  { value: 'credit_card', label: 'Cartão de Crédito', icon: '💳', description: 'Até 12x' },
  { value: 'debit_card', label: 'Cartão de Débito', icon: '💳', description: 'À vista' },
  { value: 'boleto', label: 'Boleto', icon: '📄', description: 'Bancário' },
  { value: 'wallet', label: 'Carteira Digital', icon: '📱', description: 'Apple Pay, Google Pay' },
]

export default function PaymentsTab({ themeId, methods, onUpdate, onMessage }: Props) {
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)

  const [form, setForm] = useState({
    name: '',
    type: 'pix',
    description: '',
    fee_percent: '0',
    max_installments: '1',
    icon: ''
  })

  function resetForm() {
    setForm({
      name: '',
      type: 'pix',
      description: '',
      fee_percent: '0',
      max_installments: '1',
      icon: ''
    })
    setEditingMethod(null)
    setShowForm(false)
  }

  function editMethod(method: PaymentMethod) {
    setForm({
      name: method.name,
      type: method.type,
      description: method.description || '',
      fee_percent: method.fee_percent.toString(),
      max_installments: method.max_installments.toString(),
      icon: method.icon || ''
    })
    setEditingMethod(method)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name) {
      onMessage('error', 'Preencha o nome do método')
      return
    }

    setSaving(true)
    try {
      const methodData = {
        theme_id: themeId,
        name: form.name,
        type: form.type,
        description: form.description || null,
        fee_percent: parseFloat(form.fee_percent) || 0,
        max_installments: parseInt(form.max_installments) || 1,
        icon: form.icon || null,
        is_active: true
      }

      if (editingMethod) {
        const { data, error } = await supabase
          .from('payment_methods')
          .update(methodData)
          .eq('id', editingMethod.id)
          .select()
          .single()

        if (error) throw error
        onUpdate(methods.map(m => m.id === editingMethod.id ? data as PaymentMethod : m))
        onMessage('success', 'Método atualizado!')
      } else {
        const { data, error } = await supabase
          .from('payment_methods')
          .insert(methodData)
          .select()
          .single()

        if (error) throw error
        onUpdate([...methods, data as PaymentMethod])
        onMessage('success', 'Método adicionado!')
      }

      resetForm()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      onMessage('error', 'Erro ao salvar método')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este método?')) return

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)

      if (error) throw error
      onUpdate(methods.filter(m => m.id !== id))
      onMessage('success', 'Método excluído!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      onMessage('error', 'Erro ao excluir método')
    }
  }

  async function toggleActive(method: PaymentMethod) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update({ is_active: !method.is_active })
        .eq('id', method.id)
        .select()
        .single()

      if (error) throw error
      onUpdate(methods.map(m => m.id === method.id ? data as PaymentMethod : m))
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  // Adiciona opções rápidas
  async function addQuickOptions() {
    setSaving(true)
    try {
      const quickMethods = [
        { theme_id: themeId, name: 'PIX', type: 'pix', description: '5% de desconto', fee_percent: 0, max_installments: 1, is_active: true },
        { theme_id: themeId, name: 'Cartão de Crédito', type: 'credit_card', description: 'Até 12x sem juros', fee_percent: 0, max_installments: 12, is_active: true },
        { theme_id: themeId, name: 'Boleto Bancário', type: 'boleto', description: 'Vencimento em 3 dias', fee_percent: 0, max_installments: 1, is_active: true },
      ]

      const { data, error } = await supabase
        .from('payment_methods')
        .insert(quickMethods)
        .select()

      if (error) throw error
      onUpdate([...methods, ...(data as PaymentMethod[])])
      onMessage('success', 'Métodos adicionados!')
    } catch (error) {
      console.error('Erro:', error)
      onMessage('error', 'Erro ao adicionar métodos')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          💳 Métodos de Pagamento ({methods.length})
        </h3>
        <div className="flex gap-2">
          {methods.length === 0 && (
            <button
              onClick={addQuickOptions}
              disabled={saving}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
            >
              ⚡ Adicionar Padrões
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            ➕ Novo Método
          </button>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-800">
              {editingMethod ? '✏️ Editar Método' : '➕ Novo Método de Pagamento'}
            </h4>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="PIX"
              />
            </div>
            <div>
              <label className={labelClass}>Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                {paymentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Descrição</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className={inputClass}
                placeholder="5% de desconto"
              />
            </div>
            <div>
              <label className={labelClass}>Taxa (%)</label>
              <input
                type="number"
                value={form.fee_percent}
                onChange={e => setForm({ ...form, fee_percent: e.target.value })}
                className={inputClass}
                step="0.1"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClass}>Parcelas Máximas</label>
              <input
                type="number"
                value={form.max_installments}
                onChange={e => setForm({ ...form, max_installments: e.target.value })}
                className={inputClass}
                min="1"
                max="24"
                placeholder="12"
              />
            </div>
            <div>
              <label className={labelClass}>Ícone (emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
                className={inputClass}
                placeholder="💳"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? '⏳ Salvando...' : '💾 Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {methods.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          <p className="text-4xl mb-2">💳</p>
          <p>Nenhum método de pagamento configurado</p>
          <p className="text-sm">Clique em "Adicionar Padrões" ou "Novo Método"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map(method => {
            const typeInfo = paymentTypes.find(t => t.value === method.type)
            return (
              <div
                key={method.id}
                className={`bg-white rounded-xl border p-4 ${!method.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{method.icon || typeInfo?.icon || '💳'}</span>
                  <div>
                    <h4 className="font-medium text-gray-800">{method.name}</h4>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-gray-600 mb-3">
                  {method.max_installments > 1 && (
                    <span>📊 Até {method.max_installments}x</span>
                  )}
                  {method.fee_percent > 0 && (
                    <span>📈 Taxa: {method.fee_percent}%</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(method)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      method.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {method.is_active ? '✅' : '⏸️'}
                  </button>
                  <button
                    onClick={() => editMethod(method)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
