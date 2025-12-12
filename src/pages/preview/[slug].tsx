import { GetServerSideProps } from 'next'
import Link from 'next/link'
import PlatformMockLayout from '@/components/PlatformMockLayout'
import { getThemeBySlug, getAllCssByTheme, getActiveWidgetsByTheme, generateBaseCss } from '@/lib/supabase/themes'
import { ThemeCSS, ThemeWidget, ColorConfig } from '@/lib/types'

type Props = {
  themeName: string
  themeSlug: string
  injectedCss: string
  widgets: ThemeWidget[]
  colorConfig: ColorConfig
}

/**
 * Processa o HTML do widget para:
 * 1. Remover estrutura HTML completa (DOCTYPE, html, head, body)
 * 2. Extrair apenas o conteúdo útil (style + div)
 * 3. Remover redefinições de :root que podem sobrescrever as variáveis do tema
 */
function processWidgetHtml(html: string): string {
  if (!html) return ''
  
  let processed = html
  
  // Remove DOCTYPE, html, head e body tags mantendo o conteúdo
  processed = processed.replace(/<!DOCTYPE[^>]*>/gi, '')
  processed = processed.replace(/<html[^>]*>/gi, '')
  processed = processed.replace(/<\/html>/gi, '')
  processed = processed.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, (match) => {
    // Extrai apenas os <style> do head
    const styles = match.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []
    return styles.join('\n')
  })
  processed = processed.replace(/<body[^>]*>/gi, '')
  processed = processed.replace(/<\/body>/gi, '')
  processed = processed.replace(/<meta[^>]*>/gi, '')
  processed = processed.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
  processed = processed.replace(/<link[^>]*>/gi, '') // Remove links externos (fontes serão carregadas globalmente)
  
  // Remove redefinições de :root dentro dos styles do widget
  // para que ele use as variáveis do tema
  processed = processed.replace(/:root\s*\{[^}]*\}/gi, '/* :root removido - usando variáveis do tema */')
  
  return processed.trim()
}

/**
 * Preview do tema - Mostra o tema aplicado na carcaça da loja
 */
export default function PreviewPage({ themeName, themeSlug, injectedCss, widgets, colorConfig }: Props) {
  return (
    <div>
      {/* Barra de controle do preview */}
      <div className="bg-gray-900 text-white py-2 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/themes" className="text-blue-400 hover:text-blue-300">
            ← Voltar
          </Link>
          <span className="text-gray-400">|</span>
          <span>Preview: <strong>{themeName}</strong></span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/themes/${themeSlug}`}
            className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
          >
            Ver detalhes
          </Link>
          <Link
            href={`/checkout/${themeSlug}`}
            className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700"
          >
            Comprar
          </Link>
        </div>
      </div>

      {/* Injeta o CSS das cores e das páginas */}
      <style dangerouslySetInnerHTML={{ __html: injectedCss }} />
      
      {/* Carrega Font Awesome para ícones dos widgets */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Carcaça da loja */}
      <PlatformMockLayout injectedCss="" colorConfig={colorConfig}>
        {/* Renderiza widgets na ordem */}
        {widgets.length > 0 ? (
          <div className="widgets-container">
            {widgets.map((widget) => (
              <div 
                key={widget.id} 
                className={`widget widget-${widget.widget_type}`}
                data-widget-id={widget.id}
                data-widget-name={widget.name}
                dangerouslySetInnerHTML={{ __html: processWidgetHtml(widget.html_content || '') }} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">
              🎨 Este é um preview do tema <strong>{themeName}</strong>.
            </p>
            <p className="text-yellow-600 text-sm mt-2">
              Nenhum widget foi adicionado ainda. Adicione widgets no painel admin.
            </p>
          </div>
        )}
      </PlatformMockLayout>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.slug as string
  const theme = await getThemeBySlug(slug)
  
  if (!theme) {
    return { notFound: true }
  }

  // Cores padrão caso não tenha configuração
  const defaultColors: ColorConfig = {
    cor_fundo_pagina: '#ffffff',
    cor_detalhes_fundo: '#f8f9fa',
    cor_fundo_barra_superior: '#1a1a2e',
    cor_botoes_cabecalho: '#e94560',
    cor_fundo_cabecalho: '#ffffff',
    cor_botao_enviar_pedido: '#e94560',
    cor_demais_botoes: '#6c757d',
    cor_detalhes_gerais: '#e94560',
    cor_fundo_banner_catalogo: '#f8f9fa',
    cor_fundo_menu_desktop: '#ffffff',
    cor_fundo_submenu_desktop: '#f8f9fa',
    cor_fundo_menu_mobile: '#ffffff',
    cor_fundo_rodape: '#1a1a2e'
  }

  // Usa cores do tema ou padrão
  const colorConfig = theme.color_config 
    ? { ...defaultColors, ...theme.color_config }
    : defaultColors

  // Busca todos os CSS do tema
  const allCss = await getAllCssByTheme(theme.id)
  
  // SEMPRE gera CSS base das cores (garante que variáveis existem)
  let injectedCss = generateBaseCss(colorConfig) + '\n\n'
  
  // Adiciona CSS customizado das páginas (se houver)
  if (allCss.length > 0) {
    injectedCss += allCss.map(css => `/* CSS Customizado */\n${css.css_code}`).join('\n\n')
  }

  // Busca widgets ativos ordenados
  const widgets = await getActiveWidgetsByTheme(theme.id)

  return {
    props: {
      themeName: theme.name,
      themeSlug: theme.slug,
      injectedCss,
      widgets,
      colorConfig,
    },
  }
}
