/**
 * Script de diagnóstico para verificar dados do tema Vivaz
 * Execute com: npx ts-node --esm scripts/check-vivaz.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkVivaz() {
  console.log('\n🔍 DIAGNÓSTICO DO TEMA VIVAZ\n')
  console.log('='.repeat(50))

  // 1. Buscar tema Vivaz
  const { data: vivaz, error: vivazError } = await supabase
    .from('themes')
    .select('*')
    .ilike('name', '%vivaz%')
    .single()

  if (vivazError || !vivaz) {
    console.log('❌ Tema Vivaz não encontrado!')
    
    // Listar todos os temas
    const { data: allThemes } = await supabase
      .from('themes')
      .select('id, name, slug, status')
    
    console.log('\n📋 Temas disponíveis:')
    allThemes?.forEach(t => {
      console.log(`   - ${t.name} (${t.slug}) [${t.status}]`)
    })
    return
  }

  console.log(`\n✅ Tema encontrado: ${vivaz.name}`)
  console.log(`   ID: ${vivaz.id}`)
  console.log(`   Slug: ${vivaz.slug}`)
  console.log(`   Status: ${vivaz.status}`)

  // 2. Verificar banners
  console.log('\n' + '='.repeat(50))
  console.log('🖼️ BANNERS')
  console.log('='.repeat(50))

  const { data: banners, error: bannersError } = await supabase
    .from('theme_banners')
    .select('*')
    .eq('theme_id', vivaz.id)

  if (bannersError) {
    console.log('❌ Erro ao buscar banners:', bannersError.message)
  } else if (!banners || banners.length === 0) {
    console.log('⚠️ Nenhum banner encontrado para o tema Vivaz')
  } else {
    console.log(`📊 Total de banners: ${banners.length}`)
    banners.forEach((b, i) => {
      console.log(`\n   Banner ${i + 1}:`)
      console.log(`   - Nome: ${b.name}`)
      console.log(`   - Ativo: ${b.is_active ? '✅' : '❌'}`)
      console.log(`   - Posição: ${b.position}`)
      console.log(`   - Desktop: ${b.image_desktop ? '✅ ' + b.image_desktop.substring(0, 50) + '...' : '❌ Sem imagem'}`)
      console.log(`   - Mobile: ${b.image_mobile ? '✅' : '⚠️ Sem imagem mobile'}`)
      console.log(`   - Ordem: ${b.sort_order}`)
    })
  }

  // 3. Verificar widgets
  console.log('\n' + '='.repeat(50))
  console.log('🧩 WIDGETS')
  console.log('='.repeat(50))

  const { data: widgets, error: widgetsError } = await supabase
    .from('theme_widgets')
    .select('*')
    .eq('theme_id', vivaz.id)

  if (widgetsError) {
    console.log('❌ Erro ao buscar widgets:', widgetsError.message)
  } else if (!widgets || widgets.length === 0) {
    console.log('⚠️ Nenhum widget encontrado')
  } else {
    console.log(`📊 Total de widgets: ${widgets.length}`)
    widgets.forEach((w, i) => {
      console.log(`\n   Widget ${i + 1}:`)
      console.log(`   - Tipo: ${w.widget_type}`)
      console.log(`   - Nome: ${w.name || '(sem nome)'}`)
      console.log(`   - Ativo: ${w.is_active ? '✅' : '❌'}`)
      console.log(`   - Página: ${w.page || 'home'}`)
      console.log(`   - Ordem: ${w.display_order}`)
      console.log(`   - HTML: ${w.html_content ? w.html_content.length + ' caracteres' : '❌ Vazio'}`)
    })
  }

  // 4. Verificar produtos
  console.log('\n' + '='.repeat(50))
  console.log('📦 PRODUTOS')
  console.log('='.repeat(50))

  const { data: products, error: productsError } = await supabase
    .from('theme_products')
    .select('id, name, is_active, is_featured, price')
    .eq('theme_id', vivaz.id)

  if (productsError) {
    console.log('❌ Erro ao buscar produtos:', productsError.message)
  } else if (!products || products.length === 0) {
    console.log('⚠️ Nenhum produto encontrado')
  } else {
    const ativos = products.filter(p => p.is_active).length
    const destaques = products.filter(p => p.is_featured).length
    console.log(`📊 Total: ${products.length} | Ativos: ${ativos} | Destaques: ${destaques}`)
  }

  // 5. Verificar layout_config
  console.log('\n' + '='.repeat(50))
  console.log('⚙️ LAYOUT CONFIG')
  console.log('='.repeat(50))

  if (vivaz.layout_config) {
    console.log('✅ layout_config presente')
    console.log('   Seções:', vivaz.layout_config.sections?.length || 0)
    vivaz.layout_config.sections?.forEach((s: any) => {
      console.log(`   - ${s.type}: ${s.enabled ? '✅' : '❌'} (ordem: ${s.order})`)
    })
  } else {
    console.log('❌ layout_config não configurado!')
  }

  // 6. Comparar com Lumina
  console.log('\n' + '='.repeat(50))
  console.log('📊 COMPARAÇÃO COM LUMINA')
  console.log('='.repeat(50))

  const { data: lumina } = await supabase
    .from('themes')
    .select('id, name')
    .ilike('name', '%lumina%')
    .single()

  if (lumina) {
    const { data: luminaBanners } = await supabase
      .from('theme_banners')
      .select('id')
      .eq('theme_id', lumina.id)

    const { data: luminaWidgets } = await supabase
      .from('theme_widgets')
      .select('id')
      .eq('theme_id', lumina.id)

    const { data: luminaProducts } = await supabase
      .from('theme_products')
      .select('id')
      .eq('theme_id', lumina.id)

    console.log(`\n              VIVAZ      LUMINA`)
    console.log(`   Banners:   ${banners?.length || 0}          ${luminaBanners?.length || 0}`)
    console.log(`   Widgets:   ${widgets?.length || 0}          ${luminaWidgets?.length || 0}`)
    console.log(`   Produtos:  ${products?.length || 0}         ${luminaProducts?.length || 0}`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Diagnóstico concluído!')
}

checkVivaz().catch(console.error)
