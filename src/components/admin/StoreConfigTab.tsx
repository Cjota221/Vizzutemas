import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { StoreConfig } from '@/lib/supabase/store'

type Props = {
  themeId: string
  config: StoreConfig
  onUpdate: (config: StoreConfig) => void
  onMessage: (type: 'success' | 'error', text: string) => void
}

export default function StoreConfigTab({ themeId, config, onUpdate, onMessage }: Props) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localConfig, setLocalConfig] = useState<StoreConfig>(config)
  const logoInputRef = useRef<HTMLInputElement>(null)

  async function uploadImage(file: File): Promise<string | null> {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `logos/${fileName}`
      const { error: uploadError } = await supabase.storage.from('theme-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('theme-assets').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Erro no upload:', error)
      onMessage('error', 'Erro ao fazer upload da imagem')
      return null
    } finally {
      setUploading(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file)
    if (url) {
      setLocalConfig({ ...localConfig, store_logo: url })
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('store_config')
        .upsert({ ...localConfig, theme_id: themeId }, { onConflict: 'theme_id' })
        .select()
        .single()
      
      if (error) throw error
      onUpdate(data as StoreConfig)
      onMessage('success', 'Configurações salvas!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      onMessage('error', 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="space-y-8">
      {/* Identidade da Loja */}
      <section className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🏪 Identidade da Loja
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Nome da Loja</label>
            <input
              type="text"
              value={localConfig.store_name}
              onChange={e => setLocalConfig({ ...localConfig, store_name: e.target.value })}
              className={inputClass}
              placeholder="Minha Loja"
            />
          </div>
          <div>
            <label className={labelClass}>Logo</label>
            <div className="flex items-center gap-3">
              {localConfig.store_logo && (
                <img src={localConfig.store_logo} alt="Logo" className="h-12 w-auto object-contain rounded border" />
              )}
              <input type="file" ref={logoInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50"
              >
                {uploading ? 'Enviando...' : 'Enviar Logo'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          📱 Contato
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input
              type="text"
              value={localConfig.whatsapp}
              onChange={e => setLocalConfig({ ...localConfig, whatsapp: e.target.value })}
              className={inputClass}
              placeholder="5511999999999"
            />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              value={localConfig.email}
              onChange={e => setLocalConfig({ ...localConfig, email: e.target.value })}
              className={inputClass}
              placeholder="contato@minhaloja.com"
            />
          </div>
          <div>
            <label className={labelClass}>Instagram</label>
            <input
              type="text"
              value={localConfig.instagram}
              onChange={e => setLocalConfig({ ...localConfig, instagram: e.target.value })}
              className={inputClass}
              placeholder="@minhaloja"
            />
          </div>
          <div>
            <label className={labelClass}>Facebook</label>
            <input
              type="text"
              value={localConfig.facebook}
              onChange={e => setLocalConfig({ ...localConfig, facebook: e.target.value })}
              className={inputClass}
              placeholder="minhaloja"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Mensagem padrão do WhatsApp</label>
            <textarea
              value={localConfig.whatsapp_message}
              onChange={e => setLocalConfig({ ...localConfig, whatsapp_message: e.target.value })}
              className={inputClass}
              rows={2}
              placeholder="Olá! Vi um produto na loja..."
            />
          </div>
        </div>
      </section>

      {/* Barra Superior */}
      <section className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          📢 Barra Superior
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localConfig.top_bar_enabled}
              onChange={e => setLocalConfig({ ...localConfig, top_bar_enabled: e.target.checked })}
              className="w-4 h-4 text-pink-500 rounded"
            />
            <span className="text-sm text-gray-700">Exibir barra superior</span>
          </label>
          <div>
            <label className={labelClass}>Texto da Barra</label>
            <input
              type="text"
              value={localConfig.top_bar_text}
              onChange={e => setLocalConfig({ ...localConfig, top_bar_text: e.target.value })}
              className={inputClass}
              placeholder="FRETE GRÁTIS ACIMA DE R$ 299"
            />
          </div>
        </div>
      </section>

      {/* Textos dos Botões */}
      <section className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🔘 Textos dos Botões
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Botão Comprar</label>
            <input
              type="text"
              value={localConfig.btn_buy_text}
              onChange={e => setLocalConfig({ ...localConfig, btn_buy_text: e.target.value })}
              className={inputClass}
              placeholder="COMPRAR"
            />
          </div>
          <div>
            <label className={labelClass}>Botão Adicionar ao Carrinho</label>
            <input
              type="text"
              value={localConfig.btn_add_cart_text}
              onChange={e => setLocalConfig({ ...localConfig, btn_add_cart_text: e.target.value })}
              className={inputClass}
              placeholder="ADICIONAR"
            />
          </div>
          <div>
            <label className={labelClass}>Botão Finalizar Pedido</label>
            <input
              type="text"
              value={localConfig.btn_checkout_text}
              onChange={e => setLocalConfig({ ...localConfig, btn_checkout_text: e.target.value })}
              className={inputClass}
              placeholder="FINALIZAR PEDIDO"
            />
          </div>
          <div>
            <label className={labelClass}>Botão WhatsApp</label>
            <input
              type="text"
              value={localConfig.btn_whatsapp_text}
              onChange={e => setLocalConfig({ ...localConfig, btn_whatsapp_text: e.target.value })}
              className={inputClass}
              placeholder="COMPRAR PELO WHATSAPP"
            />
          </div>
        </div>
      </section>

      {/* Frete Grátis */}
      <section className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🚚 Frete Grátis
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localConfig.free_shipping_enabled}
              onChange={e => setLocalConfig({ ...localConfig, free_shipping_enabled: e.target.checked })}
              className="w-4 h-4 text-pink-500 rounded"
            />
            <span className="text-sm text-gray-700">Exibir widget de frete grátis</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Valor mínimo (R$)</label>
              <input
                type="number"
                value={localConfig.free_shipping_value}
                onChange={e => setLocalConfig({ ...localConfig, free_shipping_value: parseFloat(e.target.value) || 0 })}
                className={inputClass}
                step="0.01"
              />
            </div>
            <div>
              <label className={labelClass}>Texto</label>
              <input
                type="text"
                value={localConfig.free_shipping_text}
                onChange={e => setLocalConfig({ ...localConfig, free_shipping_text: e.target.value })}
                className={inputClass}
                placeholder="FRETE GRÁTIS acima de R$ 299"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cupom */}
      <section className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🎟️ Cupom de Desconto
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localConfig.coupon_enabled}
              onChange={e => setLocalConfig({ ...localConfig, coupon_enabled: e.target.checked })}
              className="w-4 h-4 text-pink-500 rounded"
            />
            <span className="text-sm text-gray-700">Exibir widget de cupom</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Código do Cupom</label>
              <input
                type="text"
                value={localConfig.coupon_code}
                onChange={e => setLocalConfig({ ...localConfig, coupon_code: e.target.value })}
                className={inputClass}
                placeholder="PRIMEIRACOMPRA"
              />
            </div>
            <div>
              <label className={labelClass}>Desconto</label>
              <input
                type="text"
                value={localConfig.coupon_discount}
                onChange={e => setLocalConfig({ ...localConfig, coupon_discount: e.target.value })}
                className={inputClass}
                placeholder="10% OFF"
              />
            </div>
            <div>
              <label className={labelClass}>Texto</label>
              <input
                type="text"
                value={localConfig.coupon_text}
                onChange={e => setLocalConfig({ ...localConfig, coupon_text: e.target.value })}
                className={inputClass}
                placeholder="na primeira compra"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Parcelamento */}
      <section className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          💳 Parcelamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Máximo de parcelas</label>
            <input
              type="number"
              value={localConfig.installments_max}
              onChange={e => setLocalConfig({ ...localConfig, installments_max: parseInt(e.target.value) || 12 })}
              className={inputClass}
              min="1"
              max="24"
            />
          </div>
          <div>
            <label className={labelClass}>Texto do parcelamento</label>
            <input
              type="text"
              value={localConfig.installments_text}
              onChange={e => setLocalConfig({ ...localConfig, installments_text: e.target.value })}
              className={inputClass}
              placeholder="em até 12x no cartão"
            />
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <section className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          📄 Rodapé
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Texto do rodapé</label>
            <input
              type="text"
              value={localConfig.footer_text}
              onChange={e => setLocalConfig({ ...localConfig, footer_text: e.target.value })}
              className={inputClass}
              placeholder="© 2025 Minha Loja. Todos os direitos reservados."
            />
          </div>
          <div>
            <label className={labelClass}>Sobre a loja</label>
            <textarea
              value={localConfig.footer_about}
              onChange={e => setLocalConfig({ ...localConfig, footer_about: e.target.value })}
              className={inputClass}
              rows={3}
              placeholder="Loja especializada em produtos de qualidade."
            />
          </div>
        </div>
      </section>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <span className="animate-spin">⏳</span>
              Salvando...
            </>
          ) : (
            <>
              💾 Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  )
}
