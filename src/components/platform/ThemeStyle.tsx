import { useEffect } from 'react'

type Props = {
  /** CSS string que será injetado no documento */
  css?: string
  /** ID único para a tag style (permite múltiplos temas) */
  id?: string
}

/**
 * ThemeStyle
 * 
 * Componente que injeta CSS de tema dinamicamente no <head> do documento.
 * 
 * @example
 * ```tsx
 * const cssCode = `
 *   .navbar-top { background: #8B5CF6; }
 *   .btn-comprar { background: #10B981; }
 * `;
 * <ThemeStyle css={cssCode} id="tema-roxo" />
 * ```
 * 
 * INTEGRAÇÃO FUTURA:
 * - O `css` virá do banco de dados (Supabase) via props
 * - Cada tema terá seu próprio CSS armazenado
 * - O admin poderá editar o CSS por tipo de página (home, produto, carrinho)
 */
export default function ThemeStyle({ css, id = 'theme-custom-css' }: Props) {
  useEffect(() => {
    if (!css) return

    // Remove tag anterior se existir (evita duplicação)
    const existingStyle = document.getElementById(id)
    if (existingStyle) {
      existingStyle.remove()
    }

    // Cria nova tag <style> e insere no <head>
    const styleTag = document.createElement('style')
    styleTag.id = id
    styleTag.textContent = css
    document.head.appendChild(styleTag)

    // Cleanup: remove a tag quando o componente desmonta
    return () => {
      const tagToRemove = document.getElementById(id)
      if (tagToRemove) {
        tagToRemove.remove()
      }
    }
  }, [css, id])

  return null
}
