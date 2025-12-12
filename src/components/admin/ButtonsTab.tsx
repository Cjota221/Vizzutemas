import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { StoreButton } from '@/lib/supabase/store'

type Props = {
  themeId: string
  buttons: StoreButton[]
  onUpdate: (buttons: StoreButton[]) => void
  onMessage: (type: 'success' | 'error', text: string) => void
}

const buttonTypes = [
  { id: 'add_cart', label: '🛒 Adicionar ao Carrinho', default_text: 'Adicionar ao Carrinho' },
  { id: 'buy_now', label: '⚡ Comprar Agora', default_text: 'Comprar Agora' },
  { id: 'whatsapp', label: '💬 WhatsApp', default_text: 'Comprar via WhatsApp' },
  { id: 'checkout', label: '✅ Finalizar Compra', default_text: 'Finalizar Pedido' },
  { id: 'continue_shopping', label: '🛍️ Continuar Comprando', default_text: 'Continuar Comprando' },
  { id: 'view_product', label: '👁️ Ver Produto', default_text: 'Ver Detalhes' },
]

const iconOptions = [
  { value: '', label: 'Nenhum' },
  { value: '🛒', label: '🛒 Carrinho' },
  { value: '⚡', label: '⚡ Raio' },
  { value: '💬', label: '💬 Chat' },
  { value: '✅', label: '✅ Check' },
  { value: '❤️', label: '❤️ Coração' },
  { value: '🔥', label: '🔥 Fogo' },
  { value: '⭐', label: '⭐ Estrela' },
  { value: '🎁', label: '🎁 Presente' },
  { value: '🏷️', label: '🏷️ Tag' },
]

const sizeOptions = [
  { value: 'sm', label: 'Pequeno' },
  { value: 'md', label: 'Médio' },
  { value: 'lg', label: 'Grande' },
]

export default function ButtonsTab({ themeId, buttons, onUpdate, onMessage }: Props) {
  const [saving, setSaving] = useState<string | null>(null)

  // Criar estado local para edição
  const [editForms, setEditForms] = useState<Record<string, {
    texto: string
    cor_fundo: string
    cor_texto: string
    icone: string
    tamanho: string
    borda_raio: number
  }>>(() => {
    const forms: Record<string, any> = {}
    buttonTypes.forEach(type => {
      const existing = buttons.find(b => b.identificador === type.id)
      forms[type.id] = {
        texto: existing?.texto || type.default_text,
        cor_fundo: existing?.cor_fundo || '#ec4899',
        cor_texto: existing?.cor_texto || '#ffffff',
        icone: existing?.icone || '',
        tamanho: existing?.tamanho || 'md',
        borda_raio: existing?.borda_raio ?? 8,
      }
    })
    return forms
  })

  function updateForm(buttonId: string, field: string, value: any) {
    setEditForms(prev => ({
      ...prev,
      [buttonId]: {
        ...prev[buttonId],
        [field]: value
      }
    }))
  }

  async function handleSaveButton(buttonId: string) {
    setSaving(buttonId)
    try {
      const form = editForms[buttonId]
      const existing = buttons.find(b => b.identificador === buttonId)

      const buttonData = {
        theme_id: themeId,
        identificador: buttonId,
        texto: form.texto,
        cor_fundo: form.cor_fundo,
        cor_texto: form.cor_texto,
        icone: form.icone || null,
        tamanho: form.tamanho,
        borda_raio: form.borda_raio,
      }

      if (existing) {
        const { data, error } = await supabase
          .from('store_buttons')
          .update(buttonData)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        onUpdate(buttons.map(b => b.id === existing.id ? data as StoreButton : b))
      } else {
        const { data, error } = await supabase
          .from('store_buttons')
          .insert(buttonData)
          .select()
          .single()

        if (error) throw error
        onUpdate([...buttons, data as StoreButton])
      }

      onMessage('success', 'Botão salvo!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      onMessage('error', 'Erro ao salvar botão')
    } finally {
      setSaving(null)
    }
  }

  async function handleSaveAll() {
    setSaving('all')
    try {
      for (const type of buttonTypes) {
        const form = editForms[type.id]
        const existing = buttons.find(b => b.identificador === type.id)

        const buttonData = {
          theme_id: themeId,
          identificador: type.id,
          texto: form.texto,
          cor_fundo: form.cor_fundo,
          cor_texto: form.cor_texto,
          icone: form.icone || null,
          tamanho: form.tamanho,
          borda_raio: form.borda_raio,
        }

        if (existing) {
          await supabase
            .from('store_buttons')
            .update(buttonData)
            .eq('id', existing.id)
        } else {
          await supabase
            .from('store_buttons')
            .insert(buttonData)
        }
      }

      // Recarregar todos os botões
      const { data } = await supabase
        .from('store_buttons')
        .select('*')
        .eq('theme_id', themeId)

      if (data) onUpdate(data as StoreButton[])
      onMessage('success', 'Todos os botões salvos!')
    } catch (error) {
      console.error('Erro:', error)
      onMessage('error', 'Erro ao salvar botões')
    } finally {
      setSaving(null)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          🎛️ Botões da Loja
        </h3>
        <button
          onClick={handleSaveAll}
          disabled={saving === 'all'}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {saving === 'all' ? '⏳ Salvando...' : '💾 Salvar Todos'}
        </button>
      </div>

      {/* Dica */}
      <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm">
        💡 Personalize cada botão da sua loja: cores, textos, ícones e tamanhos.
      </div>

      {/* Lista de Botões */}
      <div className="space-y-6">
        {buttonTypes.map(type => {
          const form = editForms[type.id]
          const hasChanges = buttons.find(b => b.identificador === type.id)

          return (
            <div key={type.id} className="bg-white rounded-xl border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-gray-800">{type.label}</h4>
                  <p className="text-xs text-gray-500">Identificador: {type.id}</p>
                </div>
                {hasChanges && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Configurado</span>
                )}
              </div>

              {/* Preview */}
              <div className="mb-4 p-4 bg-gray-100 rounded-lg flex justify-center">
                <button
                  style={{
                    backgroundColor: form.cor_fundo,
                    color: form.cor_texto,
                    borderRadius: `${form.borda_raio}px`,
                    padding: form.tamanho === 'sm' ? '8px 16px' : form.tamanho === 'lg' ? '16px 32px' : '12px 24px',
                    fontSize: form.tamanho === 'sm' ? '14px' : form.tamanho === 'lg' ? '18px' : '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {form.icone && <span>{form.icone}</span>}
                  {form.texto}
                </button>
              </div>

              {/* Configurações */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Texto</label>
                  <input
                    type="text"
                    value={form.texto}
                    onChange={e => updateForm(type.id, 'texto', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cor de Fundo</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.cor_fundo}
                      onChange={e => updateForm(type.id, 'cor_fundo', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={form.cor_fundo}
                      onChange={e => updateForm(type.id, 'cor_fundo', e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Cor do Texto</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.cor_texto}
                      onChange={e => updateForm(type.id, 'cor_texto', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={form.cor_texto}
                      onChange={e => updateForm(type.id, 'cor_texto', e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Ícone</label>
                  <select
                    value={form.icone}
                    onChange={e => updateForm(type.id, 'icone', e.target.value)}
                    className={inputClass}
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tamanho</label>
                  <select
                    value={form.tamanho}
                    onChange={e => updateForm(type.id, 'tamanho', e.target.value)}
                    className={inputClass}
                  >
                    {sizeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Borda (px)</label>
                  <input
                    type="number"
                    value={form.borda_raio}
                    onChange={e => updateForm(type.id, 'borda_raio', parseInt(e.target.value) || 0)}
                    className={inputClass}
                    min="0"
                    max="50"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleSaveButton(type.id)}
                  disabled={saving === type.id}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50"
                >
                  {saving === type.id ? '⏳ Salvando...' : '💾 Salvar Botão'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
