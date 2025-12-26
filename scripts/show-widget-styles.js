require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function main() {
  const { data: widgets } = await supabase
    .from('theme_widgets')
    .select('name, html_content')
    .eq('theme_id', '42de1008-d5ad-474e-823c-f0aa6a5a3351')
    .eq('is_active', true)
    .order('display_order')

  widgets.forEach(w => {
    console.log('\n\n' + '='.repeat(60))
    console.log('WIDGET:', w.name)
    console.log('='.repeat(60))
    
    // Extrair todas as tags <style>
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
    let match
    while ((match = styleRegex.exec(w.html_content)) !== null) {
      const css = match[1]
      
      // Procurar regras de altura e espaçamento
      const heightRules = css.match(/[^{}]*{[^}]*(height|min-height|max-height|margin|padding|top|bottom)[^}]*}/gi)
      
      if (heightRules) {
        console.log('\n📏 REGRAS DE ALTURA/ESPAÇAMENTO:')
        heightRules.slice(0, 10).forEach(rule => {
          // Limpar e mostrar
          const clean = rule.replace(/\s+/g, ' ').trim()
          if (clean.length < 500) {
            console.log('  •', clean.substring(0, 200))
          }
        })
      }
      
      // Procurar regras com iframe
      const iframeRules = css.match(/iframe[^{]*{[^}]*}/gi)
      if (iframeRules) {
        console.log('\n🖼️ REGRAS DE IFRAME:')
        iframeRules.forEach(rule => {
          console.log('  •', rule.replace(/\s+/g, ' ').trim())
        })
      }
      
      // Procurar regras com html-content ou fz-
      const platformRules = css.match(/\.(fz-|html-content)[^{]*{[^}]*}/gi)
      if (platformRules) {
        console.log('\n🏪 REGRAS DE PLATAFORMA (Frainer/Nuvem):')
        platformRules.forEach(rule => {
          console.log('  •', rule.replace(/\s+/g, ' ').trim())
        })
      }
    }
  })
}

main().catch(console.error)
