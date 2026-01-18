/**
 * 🛡️ WIDGET RENDERER - Componente Seguro para Renderização de Widgets
 * 
 * Este componente é responsável por:
 * 1. Sanitizar HTML perigoso (XSS prevention) usando DOMPurify
 * 2. Isolar cada widget com Error Boundary
 * 3. Injetar CSS Variables do tema no container
 * 4. Carregar scripts externos de forma segura e sequencial
 * 5. Herdar fontes configuradas no tema
 */

import React, { useRef, useEffect, useState, Component, ReactNode, ErrorInfo } from 'react'
import DOMPurify from 'dompurify'
import { ColorConfig, FontConfig } from '@/lib/types'

// ========================================
// TIPOS
// ========================================

export interface ThemeWidget {
  id: string
  theme_id: string
  name: string
  widget_type: string
  html_content?: string
  display_order: number
  is_active: boolean
}

export interface WidgetRendererProps {
  widget: ThemeWidget
  colors: ColorConfig
  fonts?: FontConfig
  onError?: (error: Error, widgetId: string) => void
}

// ========================================
// 🚨 ERROR BOUNDARY - Isolamento de Falhas
// ========================================

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  widgetName: string
  widgetId: string
  onError?: (error: Error, widgetId: string) => void
}

class WidgetErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`❌ [WIDGET ERROR] "${this.props.widgetName}" falhou:`, error, errorInfo)
    this.props.onError?.(error, this.props.widgetId)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-error" role="alert">
          <div className="widget-error-title">
            ⚠️ Widget "{this.props.widgetName}" não pôde ser carregado
          </div>
          <div className="widget-error-message">
            {this.state.error?.message || 'Erro desconhecido'}
          </div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// ========================================
// 🧹 SANITIZAÇÃO DE HTML
// ========================================

/**
 * Configura o DOMPurify para permitir elementos seguros
 * enquanto remove scripts maliciosos
 */
function sanitizeHTML(html: string): string {
  // Sanitizar o HTML usando configuração inline
  const cleanHTML = DOMPurify.sanitize(html, {
    // Permitir tags comuns de estrutura
    ALLOWED_TAGS: [
      // Estrutura
      'div', 'span', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
      // Texto
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'i', 'em', 'u', 'small', 'mark', 'del', 'ins', 'sub', 'sup',
      // Listas
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      // Links e mídia
      'a', 'img', 'picture', 'source', 'video', 'audio', 'iframe', 'figure', 'figcaption',
      // Tabelas
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
      // Formulários (apenas para exibição)
      'form', 'input', 'textarea', 'select', 'option', 'optgroup', 'button', 'label', 'fieldset', 'legend',
      // Outros
      'br', 'hr', 'blockquote', 'pre', 'code', 'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'use', 'symbol',
      // Swiper/Carrossel (comum em widgets)
      'swiper-container', 'swiper-slide', 'swiper-wrapper',
    ],
    
    // Atributos permitidos
    ALLOWED_ATTR: [
      // Globais
      'id', 'class', 'style', 'title', 'lang', 'dir', 'tabindex', 'role',
      // Links
      'href', 'target', 'rel',
      // Mídia
      'src', 'srcset', 'alt', 'width', 'height', 'loading', 'decoding', 'poster', 'preload', 'autoplay', 'muted', 'loop', 'controls', 'playsinline',
      // Iframe
      'frameborder', 'allowfullscreen', 'allow', 'sandbox',
      // Formulários
      'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'checked', 'selected', 'maxlength', 'minlength', 'min', 'max', 'step', 'pattern', 'for', 'action', 'method',
      // SVG
      'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'xmlns',
    ],
    
    // Permitir data URIs para imagens
    ALLOW_DATA_ATTR: true,
    
    // Bloquear tags perigosas
    FORBID_TAGS: ['script', 'style', 'link', 'meta', 'base', 'object', 'embed', 'applet'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onsubmit', 'onchange'],
  })
  
  return cleanHTML
}

/**
 * Extrai scripts e CSS externos do HTML para carregamento separado
 */
function extractAssets(html: string): {
  cleanHTML: string
  externalScripts: string[]
  inlineScripts: string[]
  externalCSS: string[]
  inlineStyles: string[]
} {
  let cleanHTML = html
  const externalScripts: string[] = []
  const inlineScripts: string[] = []
  const externalCSS: string[] = []
  const inlineStyles: string[] = []

  // Extrair scripts externos (com src)
  cleanHTML = cleanHTML.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi, (_, src) => {
    externalScripts.push(src)
    return ''
  })

  // Extrair scripts inline
  cleanHTML = cleanHTML.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_, code) => {
    if (code.trim()) {
      inlineScripts.push(code)
    }
    return ''
  })

  // Extrair links de CSS externos
  cleanHTML = cleanHTML.replace(/<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*\/?>/gi, (_, href) => {
    externalCSS.push(href)
    return ''
  })

  // Extrair links de Google Fonts
  cleanHTML = cleanHTML.replace(/<link[^>]+href=["'](https:\/\/fonts\.googleapis\.com[^"']+)["'][^>]*\/?>/gi, (_, href) => {
    externalCSS.push(href)
    return ''
  })

  // Extrair styles inline
  cleanHTML = cleanHTML.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
    if (css.trim()) {
      inlineStyles.push(css)
    }
    return ''
  })

  return { cleanHTML, externalScripts, inlineScripts, externalCSS, inlineStyles }
}

// ========================================
// 🎨 WIDGET RENDERER COMPONENT
// ========================================

function WidgetRendererInner({ widget, colors, fonts, onError }: WidgetRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || !widget.html_content) return

    const abortController = new AbortController()
    let isMounted = true

    async function loadWidget() {
      if (!containerRef.current || !isMounted) return

      console.log(`🔧 [WIDGET] Carregando: "${widget.name}"`)

      try {
        // 1. Extrair assets do HTML
        const { cleanHTML, externalScripts, inlineScripts, externalCSS, inlineStyles } = extractAssets(widget.html_content || '')

        // 2. Sanitizar o HTML limpo
        const sanitizedHTML = sanitizeHTML(cleanHTML)

        console.log(`📦 [WIDGET ${widget.name}] Scripts: ${externalScripts.length} externos, ${inlineScripts.length} inline | CSS: ${externalCSS.length} externos, ${inlineStyles.length} inline`)

        // 3. Carregar CSS externos primeiro
        for (const href of externalCSS) {
          if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = href
            document.head.appendChild(link)
            console.log(`🎨 [CSS] Carregado: ${href}`)
          }
        }

        // 4. Injetar styles inline no head (com scope)
        if (inlineStyles.length > 0) {
          const styleId = `widget-style-${widget.id}`
          let existingStyle = document.getElementById(styleId)
          if (!existingStyle) {
            existingStyle = document.createElement('style')
            existingStyle.id = styleId
            document.head.appendChild(existingStyle)
          }
          existingStyle.textContent = inlineStyles.join('\n')
        }

        // 5. Inserir HTML sanitizado
        if (containerRef.current && isMounted) {
          containerRef.current.innerHTML = sanitizedHTML
        }

        // 6. Carregar scripts externos em sequência
        for (const src of externalScripts) {
          if (abortController.signal.aborted) return

          await new Promise<void>((resolve, reject) => {
            // Verificar se já foi carregado
            if (document.querySelector(`script[src="${src}"]`)) {
              console.log(`⏭️ [SCRIPT] Já carregado: ${src}`)
              resolve()
              return
            }

            const script = document.createElement('script')
            script.src = src
            script.async = false
            
            const timeout = setTimeout(() => {
              reject(new Error(`Timeout ao carregar script: ${src}`))
            }, 10000) // 10s timeout

            script.onload = () => {
              clearTimeout(timeout)
              console.log(`✅ [SCRIPT] Carregado: ${src}`)
              resolve()
            }
            script.onerror = () => {
              clearTimeout(timeout)
              console.error(`❌ [SCRIPT] Erro ao carregar: ${src}`)
              // Não rejeitar para continuar com outros scripts
              resolve()
            }
            document.head.appendChild(script)
          })
        }

        // 7. Aguardar bibliotecas inicializarem
        await new Promise(resolve => setTimeout(resolve, 100))

        // 8. Executar scripts inline com tratamento de erro individual
        for (let i = 0; i < inlineScripts.length; i++) {
          if (abortController.signal.aborted) return

          try {
            // Criar função com escopo isolado
            const fn = new Function(inlineScripts[i])
            fn()
            console.log(`✅ [INLINE ${i + 1}] Executado`)
          } catch (error) {
            console.error(`❌ [INLINE ${i + 1}] Erro:`, error)
            // Continuar com próximo script, não derrubar o widget
          }
        }

        // 9. Autoplay vídeos
        if (containerRef.current && isMounted) {
          const videos = containerRef.current.querySelectorAll('video')
          videos.forEach(video => {
            video.muted = true
            video.playsInline = true
            video.play().catch(() => {
              // Silenciar erro de autoplay (comum em browsers)
            })
          })
        }

        if (isMounted) {
          setIsLoaded(true)
          console.log(`✅ [WIDGET] "${widget.name}" carregado com sucesso`)
        }

      } catch (error) {
        console.error(`❌ [WIDGET] Erro ao carregar "${widget.name}":`, error)
        if (isMounted) {
          setLoadError((error as Error).message)
          onError?.(error as Error, widget.id)
        }
      }
    }

    loadWidget()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [widget.html_content, widget.id, widget.name, onError])

  // Gerar CSS Variables inline para o widget
  const cssVariables: React.CSSProperties = {
    // Cores do tema
    ['--cor-fundo-pagina' as string]: colors.cor_fundo_pagina,
    ['--cor-detalhes-fundo' as string]: colors.cor_detalhes_fundo,
    ['--cor-fundo-barra-superior' as string]: colors.cor_fundo_barra_superior,
    ['--cor-botoes-cabecalho' as string]: colors.cor_botoes_cabecalho,
    ['--cor-fundo-cabecalho' as string]: colors.cor_fundo_cabecalho,
    ['--cor-botao-enviar-pedido' as string]: colors.cor_botao_enviar_pedido,
    ['--cor-demais-botoes' as string]: colors.cor_demais_botoes,
    ['--cor-detalhes-gerais' as string]: colors.cor_detalhes_gerais,
    ['--cor-fundo-banner-catalogo' as string]: colors.cor_fundo_banner_catalogo,
    ['--cor-fundo-menu-desktop' as string]: colors.cor_fundo_menu_desktop,
    ['--cor-fundo-submenu-desktop' as string]: colors.cor_fundo_submenu_desktop,
    ['--cor-fundo-menu-mobile' as string]: colors.cor_fundo_menu_mobile,
    ['--cor-fundo-rodape' as string]: colors.cor_fundo_rodape,
    // Aliases semânticos
    ['--cor-primaria' as string]: colors.cor_detalhes_gerais,
    ['--cor-secundaria' as string]: colors.cor_demais_botoes,
    ['--cor-destaque' as string]: colors.cor_botao_enviar_pedido,
    ['--cor-fundo' as string]: colors.cor_fundo_pagina,
    ['--cor-texto' as string]: '#333333',
    // Fontes (se disponíveis)
    ['--preview-font-title' as string]: fonts?.title_font ? `'${fonts.title_font}', sans-serif` : undefined,
    ['--preview-font-body' as string]: fonts?.body_font ? `'${fonts.body_font}', sans-serif` : undefined,
    // Estrutura
    position: 'relative' as const,
    isolation: 'isolate' as const,
    display: 'block',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
  }

  if (loadError) {
    return (
      <div className="widget-error" role="alert">
        <div className="widget-error-title">
          ⚠️ Widget "{widget.name}" não pôde ser carregado
        </div>
        <div className="widget-error-message">{loadError}</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`widget widget-container ${isLoaded ? 'widget-loaded' : 'widget-loading'}`}
      data-widget-id={widget.id}
      data-widget-name={widget.name}
      data-widget-type={widget.widget_type}
      style={cssVariables}
    />
  )
}

// ========================================
// 🔒 EXPORTED COMPONENT COM ERROR BOUNDARY
// ========================================

export default function WidgetRenderer(props: WidgetRendererProps) {
  return (
    <WidgetErrorBoundary
      widgetName={props.widget.name}
      widgetId={props.widget.id}
      onError={props.onError}
    >
      <WidgetRendererInner {...props} />
    </WidgetErrorBoundary>
  )
}

// ========================================
// 🔧 UTILITY EXPORTS
// ========================================

export { sanitizeHTML, extractAssets, WidgetErrorBoundary }
