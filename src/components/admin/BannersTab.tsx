import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { DemoBanner } from '@/lib/supabase/store'

type Props = {
  themeId: string
  banners: DemoBanner[]
  onUpdate: (banners: DemoBanner[]) => void
  onMessage: (type: 'success' | 'error', text: string) => void
}

export default function BannersTab({ themeId, banners, onUpdate, onMessage }: Props) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'desktop' | 'mobile' | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<DemoBanner | null>(null)
  const desktopInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_desktop: '',
    image_mobile: '',
    button_text: '',
    button_link: ''
  })

  function resetForm() {
    setForm({
      title: '',
      subtitle: '',
      image_desktop: '',
      image_mobile: '',
      button_text: '',
      button_link: ''
    })
    setEditingBanner(null)
    setShowForm(false)
  }

  function editBanner(banner: DemoBanner) {
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_desktop: banner.image_desktop,
      image_mobile: banner.image_mobile || '',
      button_text: banner.button_text || '',
      button_link: banner.button_link || ''
    })
    setEditingBanner(banner)
    setShowForm(true)
  }

  async function uploadImage(file: File, type: 'desktop' | 'mobile'): Promise<string | null> {
    try {
      setUploading(type)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${type}.${fileExt}`
      const filePath = `banners/${fileName}`
      const { error: uploadError } = await supabase.storage.from('theme-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('theme-assets').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Erro no upload:', error)
      onMessage('error', 'Erro ao fazer upload da imagem')
      return null
    } finally {
      setUploading(null)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, type)
    if (url) {
      setForm({ ...form, [type === 'desktop' ? 'image_desktop' : 'image_mobile']: url })
    }
  }

  async function handleSave() {
    if (!form.image_desktop) {
      onMessage('error', 'Adicione pelo menos a imagem desktop do banner')
      return
    }

    setSaving(true)
    try {
      const bannerData = {
        theme_id: themeId,
        title: form.title || null,
        subtitle: form.subtitle || null,
        image_desktop: form.image_desktop,
        image_mobile: form.image_mobile || null,
        button_text: form.button_text || null,
        button_link: form.button_link || null,
        is_active: true,
        position: editingBanner ? editingBanner.position : banners.length
      }

      if (editingBanner) {
        const { data, error } = await supabase
          .from('demo_banners')
          .update(bannerData)
          .eq('id', editingBanner.id)
          .select()
          .single()

        if (error) throw error
        onUpdate(banners.map(b => b.id === editingBanner.id ? data as DemoBanner : b))
        onMessage('success', 'Banner atualizado!')
      } else {
        const { data, error } = await supabase
          .from('demo_banners')
          .insert(bannerData)
          .select()
          .single()

        if (error) throw error
        onUpdate([...banners, data as DemoBanner])
        onMessage('success', 'Banner adicionado!')
      }

      resetForm()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      onMessage('error', 'Erro ao salvar banner')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return

    try {
      const { error } = await supabase
        .from('demo_banners')
        .delete()
        .eq('id', id)

      if (error) throw error
      onUpdate(banners.filter(b => b.id !== id))
      onMessage('success', 'Banner excluído!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      onMessage('error', 'Erro ao excluir banner')
    }
  }

  async function toggleActive(banner: DemoBanner) {
    try {
      const { data, error } = await supabase
        .from('demo_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id)
        .select()
        .single()

      if (error) throw error
      onUpdate(banners.map(b => b.id === banner.id ? data as DemoBanner : b))
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
          🎨 Banners ({banners.length})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium flex items-center gap-2"
        >
          ➕ Novo Banner
        </button>
      </div>

      {/* Dica */}
      <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm">
        💡 <strong>Dica:</strong> Use imagens 1920x600px para desktop e 640x800px para mobile para melhor resultado.
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-800">
              {editingBanner ? '✏️ Editar Banner' : '➕ Novo Banner'}
            </h4>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imagem Desktop */}
            <div>
              <label className={labelClass}>Imagem Desktop *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                {form.image_desktop ? (
                  <div className="relative">
                    <img src={form.image_desktop} alt="Desktop" className="w-full h-32 object-cover rounded" />
                    <button
                      onClick={() => setForm({ ...form, image_desktop: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm"
                    >✕</button>
                  </div>
                ) : (
                  <div>
                    <input type="file" ref={desktopInputRef} accept="image/*" onChange={e => handleImageUpload(e, 'desktop')} className="hidden" />
                    <button
                      onClick={() => desktopInputRef.current?.click()}
                      disabled={uploading === 'desktop'}
                      className="p-4"
                    >
                      {uploading === 'desktop' ? '⏳ Enviando...' : '🖥️ Clique para enviar (1920x600px)'}
                    </button>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={form.image_desktop}
                onChange={e => setForm({ ...form, image_desktop: e.target.value })}
                className={`${inputClass} mt-2`}
                placeholder="ou cole a URL aqui"
              />
            </div>

            {/* Imagem Mobile */}
            <div>
              <label className={labelClass}>Imagem Mobile (opcional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                {form.image_mobile ? (
                  <div className="relative">
                    <img src={form.image_mobile} alt="Mobile" className="w-full h-32 object-cover rounded" />
                    <button
                      onClick={() => setForm({ ...form, image_mobile: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm"
                    >✕</button>
                  </div>
                ) : (
                  <div>
                    <input type="file" ref={mobileInputRef} accept="image/*" onChange={e => handleImageUpload(e, 'mobile')} className="hidden" />
                    <button
                      onClick={() => mobileInputRef.current?.click()}
                      disabled={uploading === 'mobile'}
                      className="p-4"
                    >
                      {uploading === 'mobile' ? '⏳ Enviando...' : '📱 Clique para enviar (640x800px)'}
                    </button>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={form.image_mobile}
                onChange={e => setForm({ ...form, image_mobile: e.target.value })}
                className={`${inputClass} mt-2`}
                placeholder="ou cole a URL aqui"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Título (overlay)</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="Oferta imperdível"
              />
            </div>
            <div>
              <label className={labelClass}>Subtítulo (overlay)</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={e => setForm({ ...form, subtitle: e.target.value })}
                className={inputClass}
                placeholder="Até 50% OFF"
              />
            </div>
            <div>
              <label className={labelClass}>Texto do botão</label>
              <input
                type="text"
                value={form.button_text}
                onChange={e => setForm({ ...form, button_text: e.target.value })}
                className={inputClass}
                placeholder="Comprar agora"
              />
            </div>
            <div>
              <label className={labelClass}>Link do botão</label>
              <input
                type="url"
                value={form.button_link}
                onChange={e => setForm({ ...form, button_link: e.target.value })}
                className={inputClass}
                placeholder="https://..."
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

      {/* Lista de Banners */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          <p className="text-4xl mb-2">🎨</p>
          <p>Nenhum banner cadastrado</p>
          <p className="text-sm">Clique em "Novo Banner" para começar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, idx) => (
            <div key={banner.id} className={`bg-white rounded-xl border overflow-hidden ${!banner.is_active ? 'opacity-50' : ''}`}>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative">
                  <img
                    src={banner.image_desktop}
                    alt={banner.title || 'Banner'}
                    className="w-full h-32 object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    #{idx + 1}
                  </span>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{banner.title || 'Sem título'}</h4>
                    <p className="text-sm text-gray-500">{banner.subtitle || 'Sem subtítulo'}</p>
                    {banner.button_text && (
                      <span className="inline-block mt-1 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        🔗 {banner.button_text}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => toggleActive(banner)}
                      className={`px-3 py-1.5 rounded text-sm ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {banner.is_active ? '✅ Ativo' : '⏸️ Inativo'}
                    </button>
                    <button
                      onClick={() => editBanner(banner)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
