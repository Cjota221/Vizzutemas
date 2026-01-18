/**
 * 📦 GERADOR DE PACOTE DE TEMA
 * 
 * Este módulo gera um pacote completo do tema para download pelo cliente
 * após a confirmação do pagamento.
 * 
 * O pacote inclui:
 * - config.json: Configurações do tema (cores, fontes, layout)
 * - widgets.json: Definições de todos os widgets
 * - styles.css: CSS compilado do tema
 * - README.md: Instruções de uso
 */

import { supabase } from '@/lib/supabase/client'
import { Theme, ColorConfig, ThemeWidget } from '@/lib/types'

// Tipo para paleta de cores simplificada (compatível com o sistema)
interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  border?: string
  success?: string
  warning?: string
  error?: string
}

// ============================================
// TIPOS
// ============================================

export interface ThemePackage {
  meta: {
    name: string
    slug: string
    version: string
    generated_at: string
    license: 'single-site' | 'multi-site' | 'unlimited'
  }
  config: {
    colors: ColorPalette
    fonts: {
      heading: string
      body: string
    }
    layout: {
      style: string
      rounded: string
      shadow: string
    }
  }
  widgets: WidgetDefinition[]
  css: string
  html_templates?: Record<string, string>
  readme: string
}

interface WidgetDefinition {
  id: string
  type: string
  name: string
  order: number
  page: string
  html: string
  css: string
  settings?: Record<string, any>
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Busca dados completos do tema no Supabase
 */
async function fetchThemeData(themeId: string) {
  // Buscar tema
  const { data: theme, error: themeError } = await supabase
    .from('themes')
    .select('*')
    .eq('id', themeId)
    .maybeSingle()

  if (themeError || !theme) {
    throw new Error(`Tema não encontrado: ${themeId}`)
  }

  // Buscar widgets do tema
  const { data: widgets, error: widgetsError } = await supabase
    .from('theme_widgets')
    .select('*')
    .eq('theme_id', themeId)
    .order('order', { ascending: true })

  if (widgetsError) {
    throw new Error(`Erro ao buscar widgets: ${widgetsError.message}`)
  }

  return { theme, widgets: widgets || [] }
}

/**
 * Gera CSS compilado do tema
 */
function generateThemeCSS(
  colors: ColorPalette,
  fonts: { heading: string; body: string },
  widgets: WidgetDefinition[]
): string {
  // CSS Variables
  const cssVariables = `
/* ====================================
   🎨 VARIÁVEIS CSS DO TEMA
   ==================================== */
:root {
  /* Cores */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-text: ${colors.text};
  --color-border: ${colors.border || '#e5e7eb'};
  --color-success: ${colors.success || '#22c55e'};
  --color-warning: ${colors.warning || '#eab308'};
  --color-error: ${colors.error || '#ef4444'};
  
  /* Fontes */
  --font-heading: '${fonts.heading}', system-ui, sans-serif;
  --font-body: '${fonts.body}', system-ui, sans-serif;
  
  /* Fluid Typography */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.813rem, 0.75rem + 0.3vw, 0.938rem);
  --text-base: clamp(0.875rem, 0.8rem + 0.4vw, 1rem);
  --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-xl: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);
  --text-2xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-3xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);
  --text-4xl: clamp(1.875rem, 1.6rem + 1.4vw, 2.25rem);
  
  /* Espaçamento */
  --space-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem);
  --space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-md: clamp(0.75rem, 0.6rem + 0.75vw, 1rem);
  --space-lg: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}

/* ====================================
   📱 RESET & BASE
   ==================================== */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-background);
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.2;
  margin-top: 0;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  color: var(--color-secondary);
}

img {
  max-width: 100%;
  height: auto;
}

/* ====================================
   🧱 UTILITÁRIOS
   ==================================== */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-lg);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

/* ====================================
   📦 WIDGETS
   ==================================== */
.widget {
  isolation: isolate;
  contain: layout style;
  position: relative;
}
`.trim()

  // CSS dos widgets
  const widgetCSS = widgets
    .filter(w => w.css && w.css.trim())
    .map(w => `
/* Widget: ${w.name || w.type} */
${w.css}
`.trim())
    .join('\n\n')

  return `${cssVariables}\n\n${widgetCSS}`
}

/**
 * Gera README com instruções de uso
 */
function generateReadme(theme: Theme): string {
  return `# ${theme.name}

> Tema gerado pela plataforma Vizzutemas

## 📦 Conteúdo do Pacote

- \`config.json\` - Configurações do tema (cores, fontes, layout)
- \`widgets.json\` - Definições de todos os widgets
- \`styles.css\` - CSS compilado pronto para uso
- \`README.md\` - Este arquivo

## 🚀 Como Usar

### 1. Integração com HTML

Adicione o CSS no seu \`<head>\`:

\`\`\`html
<link rel="stylesheet" href="styles.css">
\`\`\`

### 2. Fontes do Google

Adicione as fontes no \`<head>\`:

\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.layout_config?.fonts?.title_font || 'Inter')}:wght@400;500;600;700&family=${encodeURIComponent(theme.layout_config?.fonts?.body_font || 'Inter')}:wght@400;500;600&display=swap" rel="stylesheet">
\`\`\`

### 3. Usando as Variáveis CSS

O tema define variáveis CSS que você pode usar:

\`\`\`css
.meu-elemento {
  color: var(--color-primary);
  font-family: var(--font-heading);
  padding: var(--space-md);
}
\`\`\`

### 4. Cores Disponíveis

| Variável | Descrição |
|----------|-----------|
| \`--color-primary\` | Cor principal |
| \`--color-secondary\` | Cor secundária |
| \`--color-accent\` | Cor de destaque |
| \`--color-background\` | Fundo |
| \`--color-text\` | Texto |

### 5. Tipografia Fluida

O tema usa tipografia responsiva com \`clamp()\`:

\`\`\`css
.titulo {
  font-size: var(--text-2xl); /* Adapta automaticamente */
}
\`\`\`

## 📄 Licença

Este tema é licenciado para uso conforme os termos de compra.
Data de geração: ${new Date().toLocaleDateString('pt-BR')}

---

Desenvolvido com ❤️ por Vizzutemas
`
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

/**
 * Gera o pacote completo do tema
 * 
 * @param themeId - ID do tema no Supabase
 * @param license - Tipo de licença do pacote
 * @returns ThemePackage pronto para serialização/download
 */
export async function generateThemePackage(
  themeId: string,
  license: 'single-site' | 'multi-site' | 'unlimited' = 'single-site'
): Promise<ThemePackage> {
  // Buscar dados do tema
  const { theme, widgets } = await fetchThemeData(themeId)

  // Extrair configurações
  const colors: ColorPalette = theme.color_palette || {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937',
  }

  const fonts = theme.layout_config?.fonts || {
    heading: 'Inter',
    body: 'Inter',
  }

  const layout = {
    style: theme.layout_config?.style || 'modern',
    rounded: theme.layout_config?.rounded || 'md',
    shadow: theme.layout_config?.shadow || 'md',
  }

  // Preparar widgets
  const widgetDefinitions: WidgetDefinition[] = widgets.map(w => ({
    id: w.id,
    type: w.widget_type,
    name: w.name || w.widget_type,
    order: w.order || 0,
    page: w.page || 'home',
    html: w.html_content || '',
    css: w.css_content || '',
    settings: w.settings || {},
  }))

  // Gerar CSS
  const css = generateThemeCSS(colors, fonts, widgetDefinitions)

  // Gerar README
  const readme = generateReadme(theme)

  // Montar pacote
  const themePackage: ThemePackage = {
    meta: {
      name: theme.name,
      slug: theme.slug,
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      license,
    },
    config: {
      colors,
      fonts,
      layout,
    },
    widgets: widgetDefinitions,
    css,
    readme,
  }

  return themePackage
}

/**
 * Gera pacote como arquivo JSON para download
 */
export function packageToJSON(pkg: ThemePackage): string {
  return JSON.stringify(pkg, null, 2)
}

/**
 * Gera pacote como arquivo ZIP (estrutura para implementar com JSZip)
 */
export async function packageToZipBuffer(pkg: ThemePackage): Promise<{
  files: Array<{ name: string; content: string }>
}> {
  return {
    files: [
      {
        name: 'config.json',
        content: JSON.stringify(pkg.config, null, 2),
      },
      {
        name: 'widgets.json',
        content: JSON.stringify(pkg.widgets, null, 2),
      },
      {
        name: 'styles.css',
        content: pkg.css,
      },
      {
        name: 'README.md',
        content: pkg.readme,
      },
      {
        name: 'meta.json',
        content: JSON.stringify(pkg.meta, null, 2),
      },
    ],
  }
}

export default generateThemePackage
