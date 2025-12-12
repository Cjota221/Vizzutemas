import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { HomeSection } from '@/lib/supabase/store'

type Props = {
  themeId: string
  sections: HomeSection[]
  onUpdate: (sections: HomeSection[]) => void
  onMessage: (type: 'success' | 'error', text: string) => void
}

const sectionTypes = [
  { value: 'banner', label: '🎨 Banner Principal', description: 'Carrossel de banners em destaque' },
  { value: 'products_featured', label: '⭐ Produtos em Destaque', description: 'Grid com produtos marcados como destaque' },
  { value: 'products_new', label: '🆕 Novidades', description: 'Produtos mais recentes' },
  { value: 'products_sale', label: '🔥 Promoções', description: 'Produtos em promoção' },
  { value: 'categories', label: '📂 Categorias', description: 'Lista de categorias disponíveis' },
  { value: 'reviews', label: '💬 Avaliações', description: 'Depoimentos de clientes' },
  { value: 'newsletter', label: '📧 Newsletter', description: 'Formulário de captura de e-mail' },
  { value: 'custom_html', label: '🔧 HTML Customizado', description: 'Conteúdo HTML livre' },
]

export default function SectionsTab({ themeId, sections, onUpdate, onMessage }: Props) {
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null)

  const [form, setForm] = useState({
    section_type: 'banner' as HomeSection['section_type'],
    title: '',
    subtitle: '',
    config: {} as Record<string, unknown>
  })

  function resetForm() {
    setForm({
      section_type: 'banner',
      title: '',
      subtitle: '',
      config: {}
    })
    setEditingSection(null)
    setShowForm(false)
  }

  function editSection(section: HomeSection) {
    setForm({
      section_type: section.section_type,
      title: section.title || '',
      subtitle: section.subtitle || '',
      config: section.config || {}
    })
    setEditingSection(section)
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const sectionData = {
        theme_id: themeId,
        section_type: form.section_type,
        title: form.title || null,
        subtitle: form.subtitle || null,
        config: form.config,
        is_active: true,
        sort_order: editingSection ? editingSection.sort_order : sections.length
      }

      if (editingSection) {
        const { data, error } = await supabase
          .from('home_sections')
          .update(sectionData)
          .eq('id', editingSection.id)
          .select()
          .single()

        if (error) throw error
        onUpdate(sections.map(s => s.id === editingSection.id ? data as HomeSection : s))
        onMessage('success', 'Seção atualizada!')
      } else {
        const { data, error } = await supabase
          .from('home_sections')
          .insert(sectionData)
          .select()
          .single()

        if (error) throw error
        onUpdate([...sections, data as HomeSection])
        onMessage('success', 'Seção adicionada!')
      }

      resetForm()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      onMessage('error', 'Erro ao salvar seção')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta seção?')) return

    try {
      const { error } = await supabase
        .from('home_sections')
        .delete()
        .eq('id', id)

      if (error) throw error
      onUpdate(sections.filter(s => s.id !== id))
      onMessage('success', 'Seção excluída!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      onMessage('error', 'Erro ao excluir seção')
    }
  }

  async function toggleActive(section: HomeSection) {
    try {
      const { data, error } = await supabase
        .from('home_sections')
        .update({ is_active: !section.is_active })
        .eq('id', section.id)
        .select()
        .single()

      if (error) throw error
      onUpdate(sections.map(s => s.id === section.id ? data as HomeSection : s))
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  async function moveSection(section: HomeSection, direction: 'up' | 'down') {
    const currentIndex = sections.findIndex(s => s.id === section.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= sections.length) return

    try {
      const otherSection = sections[newIndex]
      
      // Trocar as posições
      await Promise.all([
        supabase
          .from('home_sections')
          .update({ sort_order: newIndex })
          .eq('id', section.id),
        supabase
          .from('home_sections')
          .update({ sort_order: currentIndex })
          .eq('id', otherSection.id)
      ])

      // Atualizar local
      const newSections = [...sections]
      newSections[currentIndex] = { ...otherSection, sort_order: currentIndex }
      newSections[newIndex] = { ...section, sort_order: newIndex }
      onUpdate(newSections)
    } catch (error) {
      console.error('Erro ao mover:', error)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          📐 Seções da Home ({sections.length})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium flex items-center gap-2"
        >
          ➕ Nova Seção
        </button>
      </div>

      {/* Dica */}
      <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm">
        💡 Arraste ou use as setas para reordenar as seções. A ordem aqui define a ordem de exibição na loja.
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-800">
              {editingSection ? '✏️ Editar Seção' : '➕ Nova Seção'}
            </h4>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div>
            <label className={labelClass}>Tipo de Seção *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sectionTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, section_type: type.value as HomeSection['section_type'] })}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    form.section_type === type.value
                      ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Título</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="Nossos Destaques"
              />
            </div>
            <div>
              <label className={labelClass}>Subtítulo</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={e => setForm({ ...form, subtitle: e.target.value })}
                className={inputClass}
                placeholder="Confira os produtos mais vendidos"
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

      {/* Lista de Seções */}
      {sortedSections.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          <p className="text-4xl mb-2">📐</p>
          <p>Nenhuma seção configurada</p>
          <p className="text-sm">Clique em "Nova Seção" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSections.map((section, idx) => {
            const typeInfo = sectionTypes.find(t => t.value === section.section_type)
            return (
              <div
                key={section.id}
                className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
                  !section.is_active ? 'opacity-50' : ''
                }`}
              >
                {/* Ordem */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveSection(section, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    ⬆️
                  </button>
                  <span className="text-center text-sm font-bold text-gray-400">{idx + 1}</span>
                  <button
                    onClick={() => moveSection(section, 'down')}
                    disabled={idx === sortedSections.length - 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    ⬇️
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {typeInfo?.label || section.section_type}
                  </div>
                  {section.title && (
                    <p className="text-sm text-gray-500">{section.title}</p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(section)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      section.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {section.is_active ? '✅ Ativa' : '⏸️ Inativa'}
                  </button>
                  <button
                    onClick={() => editSection(section)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
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
