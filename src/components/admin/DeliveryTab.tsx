import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type DeliveryOption = {
  id: string
  theme_id: string
  name: string
  type: string
  price: number
  estimated_days: number
  min_cart_value: number | null
  is_active: boolean
}

type Props = {
  themeId: string
  options: DeliveryOption[]
  onUpdate: (options: DeliveryOption[]) => void
  onMessage: (type: 'success' | 'error', text: string) => void
}

const deliveryTypes = [
  { value: 'standard', label: '📦 Padrão', icon: '📦' },
  { value: 'express', label: '⚡ Expresso', icon: '⚡' },
  { value: 'free', label: '🎁 Frete Grátis', icon: '🎁' },
  { value: 'pickup', label: '🏪 Retirar na Loja', icon: '🏪' },
  { value: 'same_day', label: '🚀 Mesmo Dia', icon: '🚀' },
]

export default function DeliveryTab({ themeId, options, onUpdate, onMessage }: Props) {
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingOption, setEditingOption] = useState<DeliveryOption | null>(null)

  const [form, setForm] = useState({
    name: '',
    type: 'standard',
    price: '',
    estimated_days: '7',
    min_cart_value: ''
  })

  function resetForm() {
    setForm({
      name: '',
      type: 'standard',
      price: '',
      estimated_days: '7',
      min_cart_value: ''
    })
    setEditingOption(null)
    setShowForm(false)
  }

  function editOption(option: DeliveryOption) {
    setForm({
      name: option.name,
      type: option.type,
      price: option.price.toString(),
      estimated_days: option.estimated_days.toString(),
      min_cart_value: option.min_cart_value?.toString() || ''
    })
    setEditingOption(option)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name) {
      onMessage('error', 'Preencha o nome da opção')
      return
    }

    setSaving(true)
    try {
      const optionData = {
        theme_id: themeId,
        name: form.name,
        type: form.type,
        price: parseFloat(form.price) || 0,
        estimated_days: parseInt(form.estimated_days) || 7,
        min_cart_value: form.min_cart_value ? parseFloat(form.min_cart_value) : null,
        is_active: true
      }

      if (editingOption) {
        const { data, error } = await supabase
          .from('delivery_options')
          .update(optionData)
          .eq('id', editingOption.id)
          .select()
          .single()

        if (error) throw error
        onUpdate(options.map(o => o.id === editingOption.id ? data as DeliveryOption : o))
        onMessage('success', 'Opção atualizada!')
      } else {
        const { data, error } = await supabase
          .from('delivery_options')
          .insert(optionData)
          .select()
          .single()

        if (error) throw error
        onUpdate([...options, data as DeliveryOption])
        onMessage('success', 'Opção adicionada!')
      }

      resetForm()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      onMessage('error', 'Erro ao salvar opção')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta opção?')) return

    try {
      const { error } = await supabase
        .from('delivery_options')
        .delete()
        .eq('id', id)

      if (error) throw error
      onUpdate(options.filter(o => o.id !== id))
      onMessage('success', 'Opção excluída!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      onMessage('error', 'Erro ao excluir opção')
    }
  }

  async function toggleActive(option: DeliveryOption) {
    try {
      const { data, error } = await supabase
        .from('delivery_options')
        .update({ is_active: !option.is_active })
        .eq('id', option.id)
        .select()
        .single()

      if (error) throw error
      onUpdate(options.map(o => o.id === option.id ? data as DeliveryOption : o))
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          🚚 Opções de Entrega ({options.length})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium flex items-center gap-2"
        >
          ➕ Nova Opção
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-800">
              {editingOption ? '✏️ Editar Opção' : '➕ Nova Opção de Entrega'}
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
                placeholder="Entrega Padrão"
              />
            </div>
            <div>
              <label className={labelClass}>Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                {deliveryTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className={inputClass}
                step="0.01"
                min="0"
                placeholder="15.90"
              />
            </div>
            <div>
              <label className={labelClass}>Prazo (dias úteis)</label>
              <input
                type="number"
                value={form.estimated_days}
                onChange={e => setForm({ ...form, estimated_days: e.target.value })}
                className={inputClass}
                min="0"
                placeholder="7"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Valor mínimo do carrinho para habilitar (opcional)</label>
              <input
                type="number"
                value={form.min_cart_value}
                onChange={e => setForm({ ...form, min_cart_value: e.target.value })}
                className={inputClass}
                step="0.01"
                min="0"
                placeholder="100.00"
              />
              <p className="text-xs text-gray-500 mt-1">Se preenchido, a opção só aparece para carrinhos acima deste valor</p>
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
      {options.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          <p className="text-4xl mb-2">🚚</p>
          <p>Nenhuma opção de entrega configurada</p>
          <p className="text-sm">Clique em "Nova Opção" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map(option => {
            const typeInfo = deliveryTypes.find(t => t.value === option.type)
            return (
              <div
                key={option.id}
                className={`bg-white rounded-xl border p-4 ${!option.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeInfo?.icon || '📦'}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">{option.name}</h4>
                      <p className="text-sm text-gray-500">{typeInfo?.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-pink-500">
                      {option.price > 0 ? `R$ ${option.price.toFixed(2)}` : 'Grátis'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.estimated_days} dia{option.estimated_days !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {option.min_cart_value && (
                  <div className="mt-2 text-xs text-gray-500">
                    💰 Mínimo: R$ {option.min_cart_value.toFixed(2)}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => toggleActive(option)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      option.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {option.is_active ? '✅ Ativo' : '⏸️ Inativo'}
                  </button>
                  <button
                    onClick={() => editOption(option)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(option.id)}
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
