// Script para analisar widgets do tema Vivaz
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeWidgets() {
  console.log('🔍 Buscando tema Vivaz...\n')
  
  // Buscar tema
  const { data: theme, error: themeError } = await supabase
    .from('themes')
    .select('*')
    .ilike('name', '%vivaz%')
    .single()
  
  if (themeError || !theme) {
    console.log('❌ Tema Vivaz não encontrado. Buscando todos os temas...')
    const { data: themes } = await supabase.from('themes').select('id, name, slug')
    console.log('Temas disponíveis:', themes)
    return
  }
  
  console.log(`✅ Tema encontrado: ${theme.name} (ID: ${theme.id})\n`)
  
  // Buscar widgets do tema
  const { data: widgets, error: widgetsError } = await supabase
    .from('theme_widgets')
    .select('*')
    .eq('theme_id', theme.id)
    .order('display_order', { ascending: true })
  
  if (widgetsError) {
    console.log('❌ Erro ao buscar widgets:', widgetsError)
    return
  }
  
  console.log(`📦 Total de widgets: ${widgets?.length || 0}\n`)
  console.log('=' .repeat(80))
  
  widgets?.forEach((widget, index) => {
    console.log(`\n🔸 WIDGET ${index + 1}: ${widget.name}`)
    console.log(`   ID: ${widget.id}`)
    console.log(`   Tipo: ${widget.widget_type}`)
    console.log(`   Ativo: ${widget.is_active ? '✅ Sim' : '❌ Não'}`)
    console.log(`   Ordem: ${widget.display_order}`)
    
    const html = widget.html_content || ''
    console.log(`   Tamanho HTML: ${html.length} caracteres`)
    
    // Análise do HTML
    console.log('\n   📋 ANÁLISE DO HTML:')
    
    // Verificar se tem estrutura básica
    const hasDiv = html.includes('<div')
    const hasStyle = html.includes('<style') || html.includes('style=')
    const hasScript = html.includes('<script')
    const hasImages = html.includes('<img')
    const hasVideo = html.includes('<video') || html.includes('iframe')
    
    console.log(`   - Tem <div>: ${hasDiv ? '✅' : '❌'}`)
    console.log(`   - Tem CSS: ${hasStyle ? '✅' : '❌'}`)
    console.log(`   - Tem Script: ${hasScript ? '⚠️ Sim' : '❌ Não'}`)
    console.log(`   - Tem Imagens: ${hasImages ? '✅' : '❌'}`)
    console.log(`   - Tem Vídeo/Iframe: ${hasVideo ? '✅' : '❌'}`)
    
    // Verificar problemas comuns
    console.log('\n   ⚠️ POSSÍVEIS PROBLEMAS:')
    
    const hasFixed = html.includes('position: fixed') || html.includes('position:fixed')
    const hasAbsolute = html.includes('position: absolute') || html.includes('position:absolute')
    const hasVw100 = html.includes('100vw') || html.includes('width: 100vw')
    const hasVh100 = html.includes('100vh') || html.includes('height: 100vh')
    const hasOverflowHidden = html.includes('overflow: hidden') || html.includes('overflow:hidden')
    const hasZIndex = html.match(/z-index:\s*(\d+)/g)
    const hasMediaQueries = html.includes('@media')
    
    if (hasFixed) console.log(`   - ❌ position: fixed (pode sobrepor conteúdo)`)
    if (hasAbsolute) console.log(`   - ⚠️ position: absolute (verificar container)`)
    if (hasVw100) console.log(`   - ⚠️ 100vw (pode causar overflow horizontal)`)
    if (hasVh100) console.log(`   - ⚠️ 100vh (pode quebrar layout)`)
    if (hasOverflowHidden) console.log(`   - ⚠️ overflow: hidden (pode esconder conteúdo)`)
    if (hasZIndex) console.log(`   - ⚠️ z-index encontrados: ${hasZIndex.join(', ')}`)
    if (!hasMediaQueries) console.log(`   - ⚠️ Sem @media queries (não responsivo)`)
    else console.log(`   - ✅ Tem @media queries (responsivo)`)
    
    // Mostrar preview do HTML (primeiros 500 chars)
    console.log('\n   📄 PREVIEW DO HTML (primeiros 500 chars):')
    console.log('   ' + '-'.repeat(60))
    const preview = html.substring(0, 500).replace(/\n/g, '\n   ')
    console.log('   ' + preview)
    if (html.length > 500) console.log('   ... (truncado)')
    console.log('   ' + '-'.repeat(60))
    
    console.log('\n' + '='.repeat(80))
  })
}

analyzeWidgets().catch(console.error)
