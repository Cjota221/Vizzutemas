# 📋 RELATÓRIO COMPLETO DO PROJETO VIZZUTEMAS

**Data de Geração:** 18 de Janeiro de 2026

---

## 1. VISÃO GERAL DO PROJETO

**Vizzutemas** é uma plataforma SaaS para venda de temas CSS para e-commerce. O sistema permite criar, gerenciar e vender temas personalizáveis que podem ser aplicados em lojas virtuais.

### Stack Tecnológico

| Tecnologia | Uso |
|------------|-----|
| **Next.js 16** | Framework frontend (Pages Router) |
| **TypeScript** | Tipagem estática |
| **Tailwind CSS** | Estilização |
| **Supabase** | Backend (PostgreSQL + API + Storage) |
| **Netlify** | Deploy |

---

## 2. ARQUITETURA DO PROJETO

### 2.1 Estrutura de Diretórios

```
src/
├── components/
│   ├── admin/          # Componentes do painel administrativo
│   │   ├── AdminLayout.tsx
│   │   ├── BannersTab.tsx
│   │   ├── BulkProductUpload.tsx
│   │   ├── ButtonsTab.tsx
│   │   ├── DeliveryTab.tsx
│   │   ├── PaymentsTab.tsx
│   │   ├── ProductsTab.tsx
│   │   ├── SectionsTab.tsx
│   │   ├── StoreConfigTab.tsx
│   │   └── index.ts
│   ├── platform/       # Componentes da loja de preview
│   │   ├── CatalogPage.tsx
│   │   ├── CategoriesBar.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HomePage.tsx
│   │   ├── PlatformMockLayout.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductModal.tsx
│   │   ├── ProductsSection.tsx
│   │   ├── ReviewsSection.tsx
│   │   ├── StoreInfo.tsx
│   │   ├── ThemeStyle.tsx
│   │   └── index.ts
│   ├── PlatformMockLayout.tsx
│   └── ThemeCard.tsx
├── lib/
│   ├── supabase/       # Funções de acesso ao banco de dados
│   │   ├── client.ts
│   │   ├── orders.ts
│   │   ├── products.ts
│   │   ├── store.ts
│   │   └── themes.ts
│   └── types.ts        # Tipos TypeScript
├── pages/
│   ├── admin/          # Páginas do painel admin
│   │   ├── orders/
│   │   │   └── index.tsx
│   │   └── themes/
│   │       ├── [id].tsx
│   │       ├── [id]/
│   │       │   └── products.tsx
│   │       ├── index.tsx
│   │       └── new.tsx
│   ├── api/            # API Routes
│   │   └── orders.ts
│   ├── checkout/       # Fluxo de compra
│   │   ├── [slug].tsx
│   │   └── success.tsx
│   ├── preview/        # Preview dos temas
│   │   ├── [slug].tsx
│   │   └── embed/
│   │       └── [slug].tsx
│   ├── preview-v2/
│   │   └── [slug].tsx
│   ├── themes/         # Vitrine pública
│   │   ├── [slug].tsx
│   │   └── index.tsx
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   └── preview-base.tsx
└── styles/
    └── globals.css     # Estilos globais
```

---

## 3. MÓDULOS E FUNÇÕES DETALHADAS

### 3.1 Biblioteca de Tipos (src/lib/types.ts)

```typescript
// Configuração de cores do tema (13 cores customizáveis)
export type ColorConfig = {
  cor_fundo_pagina: string              // Cor do fundo da página
  cor_detalhes_fundo: string            // Cor dos detalhes do fundo da página
  cor_fundo_barra_superior: string      // Cor do fundo da barra superior
  cor_botoes_cabecalho: string          // Cor dos botões do cabeçalho
  cor_fundo_cabecalho: string           // Cor do fundo do cabeçalho
  cor_botao_enviar_pedido: string       // Cor do botão "Enviar Pedido"
  cor_demais_botoes: string             // Cor dos demais botões
  cor_detalhes_gerais: string           // Cor dos detalhes gerais
  cor_fundo_banner_catalogo: string     // Cor do fundo do banner do catálogo
  cor_fundo_menu_desktop: string        // Cor do fundo do menu desktop
  cor_fundo_submenu_desktop: string     // Cor do fundo do submenu desktop
  cor_fundo_menu_mobile: string         // Cor do fundo do menu mobile
  cor_fundo_rodape: string              // Cor do fundo do rodapé
}

// Tipo de página para CSS específico
export type PageType = 'home' | 'product' | 'cart'

// Seção do layout da página
export type LayoutSection = {
  id: string
  type: 'banner_principal' | 'banner_categorias' | 'produtos' | 'widgets' | 'avaliacoes' | 'info_loja' | 'carousel_custom'
  label: string
  enabled: boolean
  order: number
  category?: string
  product_ids?: string[]
  widget_ids?: string[]
}

// Configuração de estilo do carrossel
export type CarouselStyleConfig = {
  title_alignment: 'left' | 'center' | 'right'
  title_font_size: 'sm' | 'md' | 'lg' | 'xl'
  product_name_size: 'xs' | 'sm' | 'md'
  price_size: 'sm' | 'md' | 'lg'
  button_style: 'full' | 'outline' | 'minimal'
  show_badge: boolean
  card_shadow: 'none' | 'sm' | 'md' | 'lg'
}

// Fontes disponíveis
export const AVAILABLE_FONTS = [
  'Poppins', 'Oswald', 'Roboto', 'Lato', 'Cabin', 'Open Sans', 
  'Montserrat', 'Lora', 'Arvo', 'Josefin Slab', 'Merriweather',
  'Playfair Display', 'Quicksand', 'Playwrite', 'Cookie', 'Merienda',
  'Comic Neue', 'Rokkit', 'Raleway', 'Barlow Semi Condensed'
] as const

// Configuração de fontes
export type FontConfig = {
  title_font: FontName
  body_font: FontName
}

// Modelo de cabeçalho (1-6)
export type HeaderModel = '1' | '2' | '3' | '4' | '5' | '6'

// Configuração do cabeçalho
export type HeaderConfig = {
  model: HeaderModel
  show_search: boolean
  show_cart: boolean
  show_account: boolean
  show_whatsapp: boolean
}

// Configuração de layout
export type LayoutConfig = {
  sections: LayoutSection[]
  products_per_row: number
  logo_url?: string
  carousel_style?: CarouselStyleConfig
  fonts?: FontConfig
  header?: HeaderConfig
}

// Tema principal
export type Theme = {
  id: string
  name: string
  slug: string
  description?: string
  price?: number
  thumbnail_url?: string
  status?: 'draft' | 'published' | 'archived'
  color_config?: ColorConfig
  layout_config?: LayoutConfig
  created_at?: string
}

// CSS do tema por página
export type ThemeCSS = {
  id: string
  theme_id: string
  page_type: PageType
  css_code: string
  created_at?: string
  updated_at?: string
}

// Widget personalizado
export type ThemeWidget = {
  id: string
  theme_id: string
  name: string
  widget_type: 'html' | 'image_slider' | 'product_carousel' | 'text' | 'banner' | 'custom'
  html_content?: string
  config?: Record<string, any>
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Banner do tema
export type ThemeBanner = {
  id: string
  theme_id: string
  name: string
  image_desktop: string
  image_mobile: string
  link_url?: string
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Pedido de compra
export type Order = {
  id: string
  theme_id: string
  customer_name: string
  customer_email: string
  notes?: string
  status?: 'pending' | 'paid' | 'cancelled' | 'delivered'
  created_at?: string
  themes?: { name: string }
}
```

### 3.2 Funções de Temas (src/lib/supabase/themes.ts)

| Função | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `listThemes()` | - | `Promise<Theme[]>` | Lista todos os temas ordenados por data |
| `listPublishedThemes()` | - | `Promise<Theme[]>` | Lista apenas temas com status 'published' |
| `getThemeBySlug(slug)` | `slug: string` | `Promise<Theme \| null>` | Busca tema pelo slug único |
| `getThemeById(id)` | `id: string` | `Promise<Theme \| null>` | Busca tema pelo UUID |
| `createTheme(payload)` | `payload: Partial<Theme>` | `Promise<Theme \| null>` | Cria novo tema |
| `updateTheme(id, payload)` | `id: string, payload: Partial<Theme>` | `Promise<Theme \| null>` | Atualiza tema existente |
| `getCssByPage(theme_id, page_type)` | `theme_id: string, page_type: PageType` | `Promise<ThemeCSS \| null>` | Busca CSS de uma página específica |
| `getAllCssByTheme(theme_id)` | `theme_id: string` | `Promise<ThemeCSS[]>` | Busca todos os CSS de um tema |
| `upsertCssByPage(theme_id, page_type, css_code)` | `theme_id: string, page_type: PageType, css_code: string` | `Promise<ThemeCSS \| null>` | Insere ou atualiza CSS |
| `generateBaseCss(colors)` | `colors: ColorConfig` | `string` | Gera CSS com variáveis de cores |
| `getWidgetsByTheme(theme_id)` | `theme_id: string` | `Promise<ThemeWidget[]>` | Lista todos os widgets |
| `getActiveWidgetsByTheme(theme_id)` | `theme_id: string` | `Promise<ThemeWidget[]>` | Lista widgets ativos |
| `getWidgetById(id)` | `id: string` | `Promise<ThemeWidget \| null>` | Busca widget por ID |
| `createWidget(payload)` | `payload: Partial<ThemeWidget>` | `Promise<ThemeWidget \| null>` | Cria widget |
| `updateWidget(id, payload)` | `id: string, payload: Partial<ThemeWidget>` | `Promise<ThemeWidget \| null>` | Atualiza widget |
| `deleteWidget(id)` | `id: string` | `Promise<boolean>` | Remove widget |
| `getBannersByTheme(theme_id)` | `theme_id: string` | `Promise<ThemeBanner[]>` | Lista banners |
| `createBanner(payload)` | `payload: Partial<ThemeBanner>` | `Promise<ThemeBanner \| null>` | Cria banner |
| `updateBanner(id, payload)` | `id: string, payload: Partial<ThemeBanner>` | `Promise<ThemeBanner \| null>` | Atualiza banner |
| `deleteBanner(id)` | `id: string` | `Promise<boolean>` | Remove banner |
| `updateThemeColors(id, colors)` | `id: string, colors: ColorConfig` | `Promise<Theme \| null>` | Atualiza paleta de cores |

### 3.3 Funções de Loja (src/lib/supabase/store.ts)

| Função | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `getStoreConfig(themeId)` | `themeId: string` | `Promise<StoreConfig \| null>` | Busca configurações da loja |
| `createDefaultStoreConfig(themeId)` | `themeId: string` | `Promise<StoreConfig \| null>` | Cria config padrão |
| `updateStoreConfig(themeId, config)` | `themeId: string, config: Partial<StoreConfig>` | `Promise<StoreConfig \| null>` | Atualiza configurações |
| `getProducts(themeId)` | `themeId: string` | `Promise<DemoProduct[]>` | Lista produtos ativos |
| `getAllProducts(themeId)` | `themeId: string` | `Promise<DemoProduct[]>` | Lista todos os produtos |
| `getFeaturedProducts(themeId, limit)` | `themeId: string, limit?: number` | `Promise<DemoProduct[]>` | Lista produtos em destaque |
| `getProductsByCategory(themeId, category)` | `themeId: string, category: string` | `Promise<DemoProduct[]>` | Lista produtos por categoria |
| `createProduct(product)` | `product: Partial<DemoProduct>` | `Promise<DemoProduct \| null>` | Cria produto |
| `updateProduct(id, product)` | `id: string, product: Partial<DemoProduct>` | `Promise<DemoProduct \| null>` | Atualiza produto |
| `deleteProduct(id)` | `id: string` | `Promise<boolean>` | Remove produto |
| `getBanners(themeId, position?)` | `themeId: string, position?: string` | `Promise<ThemeBanner[]>` | Lista banners |
| `getAllBanners(themeId)` | `themeId: string` | `Promise<ThemeBanner[]>` | Lista todos banners |
| `createBanner(banner)` | `banner: Partial<ThemeBanner>` | `Promise<ThemeBanner \| null>` | Cria banner |
| `updateBanner(id, banner)` | `id: string, banner: Partial<ThemeBanner>` | `Promise<ThemeBanner \| null>` | Atualiza banner |
| `deleteBanner(id)` | `id: string` | `Promise<boolean>` | Remove banner |
| `getCategories(themeId)` | `themeId: string` | `Promise<ThemeCategory[]>` | Lista categorias ativas |
| `getAllCategories(themeId)` | `themeId: string` | `Promise<ThemeCategory[]>` | Lista todas categorias |
| `createCategory(category)` | `category: Partial<ThemeCategory>` | `Promise<ThemeCategory \| null>` | Cria categoria |
| `updateCategory(id, category)` | `id: string, category: Partial<ThemeCategory>` | `Promise<ThemeCategory \| null>` | Atualiza categoria |
| `deleteCategory(id)` | `id: string` | `Promise<boolean>` | Remove categoria |
| `getWidgets(themeId, page?)` | `themeId: string, page?: string` | `Promise<ThemeWidget[]>` | Lista widgets |
| `getAllWidgets(themeId)` | `themeId: string` | `Promise<ThemeWidget[]>` | Lista todos widgets |
| `createWidget(widget)` | `widget: Partial<ThemeWidget>` | `Promise<ThemeWidget \| null>` | Cria widget |
| `updateWidget(id, widget)` | `id: string, widget: Partial<ThemeWidget>` | `Promise<ThemeWidget \| null>` | Atualiza widget |
| `deleteWidget(id)` | `id: string` | `Promise<boolean>` | Remove widget |
| `getHomeSections(themeId)` | `themeId: string` | `Promise<HomeSection[]>` | Lista seções da home |
| `getAllHomeSections(themeId)` | `themeId: string` | `Promise<HomeSection[]>` | Lista todas seções |
| `createHomeSection(section)` | `section: Partial<HomeSection>` | `Promise<HomeSection \| null>` | Cria seção |
| `updateHomeSection(id, section)` | `id: string, section: Partial<HomeSection>` | `Promise<HomeSection \| null>` | Atualiza seção |
| `deleteHomeSection(id)` | `id: string` | `Promise<boolean>` | Remove seção |
| `getReviews(themeId, productId?)` | `themeId: string, productId?: string` | `Promise<ThemeReview[]>` | Lista avaliações |
| `createReview(review)` | `review: Partial<ThemeReview>` | `Promise<ThemeReview \| null>` | Cria avaliação |
| `deleteReview(id)` | `id: string` | `Promise<boolean>` | Remove avaliação |
| `getStoreButtons(themeId)` | `themeId: string` | `Promise<StoreButton[]>` | Lista botões |
| `getDemoBanners(themeId)` | `themeId: string` | `Promise<DemoBanner[]>` | Lista banners demo |
| `createDemoBanner(banner)` | `banner: Partial<DemoBanner>` | `Promise<DemoBanner \| null>` | Cria banner demo |
| `updateDemoBanner(id, banner)` | `id: string, banner: Partial<DemoBanner>` | `Promise<DemoBanner \| null>` | Atualiza banner demo |
| `deleteDemoBanner(id)` | `id: string` | `Promise<boolean>` | Remove banner demo |
| `initializeThemeData(themeId)` | `themeId: string` | `Promise<void>` | Inicializa dados padrão |

### 3.4 Funções de Pedidos (src/lib/supabase/orders.ts)

| Função | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `createOrder(payload)` | `payload: Partial<Order>` | `Promise<Order \| null>` | Cria novo pedido |
| `listOrders()` | - | `Promise<Order[]>` | Lista todos os pedidos com join de temas |
| `updateOrderStatus(id, status)` | `id: string, status: Order['status']` | `Promise<Order \| null>` | Atualiza status |

---

## 4. PÁGINAS E ROTAS

### 4.1 Páginas Públicas

| Rota | Arquivo | Método SSR | Descrição |
|------|---------|------------|-----------|
| `/` | `pages/index.tsx` | Static | Landing page da plataforma |
| `/themes` | `pages/themes/index.tsx` | `getServerSideProps` | Galeria de temas publicados |
| `/themes/[slug]` | `pages/themes/[slug].tsx` | `getServerSideProps` | Detalhes do tema com botões de ação |
| `/preview/[slug]` | `pages/preview/[slug].tsx` | `getServerSideProps` | Container do preview com controles Desktop/Mobile |
| `/preview/embed/[slug]` | `pages/preview/embed/[slug].tsx` | `getServerSideProps` | Conteúdo renderizado no iframe |
| `/checkout/[slug]` | `pages/checkout/[slug].tsx` | `getServerSideProps` | Formulário de compra |
| `/checkout/success` | `pages/checkout/success.tsx` | Static | Página de confirmação |

### 4.2 Páginas Administrativas

| Rota | Arquivo | Método SSR | Descrição |
|------|---------|------------|-----------|
| `/admin/themes` | `pages/admin/themes/index.tsx` | `getServerSideProps` | Lista de todos os temas |
| `/admin/themes/new` | `pages/admin/themes/new.tsx` | Static | Formulário de criação de tema |
| `/admin/themes/[id]` | `pages/admin/themes/[id].tsx` | Client-side | Editor completo do tema (8 abas) |
| `/admin/themes/[id]/products` | `pages/admin/themes/[id]/products.tsx` | Client-side | Gerenciamento de produtos |
| `/admin/orders` | `pages/admin/orders/index.tsx` | `getServerSideProps` | Lista de pedidos |

### 4.3 API Routes

| Rota | Método | Body | Descrição |
|------|--------|------|-----------|
| `/api/orders` | POST | `{ theme_id, customer_name, customer_email, notes? }` | Cria pedido |

---

## 5. COMPONENTES DETALHADOS

### 5.1 Componentes Admin

#### AdminLayout (src/components/admin/AdminLayout.tsx)
```typescript
type Props = {
  children: React.ReactNode
  title?: string
}

export default function AdminLayout({ children, title }: Props)
// - Sidebar fixa com navegação
// - Header responsivo
// - Menu mobile
```

#### PageHeader
```typescript
export function PageHeader({ title, description, action }: { 
  title: string
  description?: string
  action?: React.ReactNode 
})
// - Título da página
// - Descrição opcional
// - Ação (botão) opcional
```

#### Card
```typescript
export function Card({ children, className }: { 
  children: React.ReactNode
  className?: string 
})
// - Container com borda e padding
```

#### ProductsTab (src/components/admin/ProductsTab.tsx)
- Lista de produtos em cards
- Criação/edição de produtos
- Upload de imagens
- Toggle de destaque

#### BannersTab (src/components/admin/BannersTab.tsx)
- Lista de banners
- Upload de imagem desktop/mobile
- Configuração de link
- Ordenação drag-and-drop

#### SectionsTab (src/components/admin/SectionsTab.tsx)
- Ordenação de seções da home
- Toggle de visibilidade
- Setas para reordenar

#### StoreConfigTab (src/components/admin/StoreConfigTab.tsx)
- Configurações da loja
- Textos de botões
- Informações de contato
- SEO

### 5.2 Componentes Platform (Preview)

#### Header (src/components/platform/Header.tsx)
```typescript
export default function Header()
// Classes importantes:
// - .navbar-top: Barra superior
// - .desktop-top: Seção logo/busca
// - .menu-section: Menu navegação
```

#### HomePage (src/components/platform/HomePage.tsx)
```typescript
type Props = {
  colors: ColorConfig
  children?: ReactNode
}

export default function HomePage({ colors, children }: Props)
// - Barra superior
// - Header com busca
// - Widget frete grátis
// - Banner principal
// - Carrossel vantagens
// - Widget cupom
// - Carrossel produtos
// - Slot para widgets injetados
```

#### ProductCard (src/components/platform/ProductCard.tsx)
```typescript
type Props = {
  product: Product
  colors: ColorConfig
  onQuero?: () => void
  onOpenProduct?: () => void
}

export default function ProductCard({ product, colors, onQuero, onOpenProduct }: Props)
// - Imagem com badge
// - Nome e preço
// - Botão comprar
// - Parcelamento
// - Ações (favorito, chat, compartilhar)
```

#### ProductModal (src/components/platform/ProductModal.tsx)
- Modal de detalhes do produto
- Galeria de imagens
- Seletor de variações
- Botão adicionar ao carrinho

#### Footer (src/components/platform/Footer.tsx)
```typescript
// Classes importantes:
// - .footer-section
// - .footer-newsletter
// - .footer-links
// - .footer-payments
// - .footer-security
// - .footer-info
```

---

## 6. LÓGICA DO SISTEMA DE PREVIEW

### 6.1 Arquitetura de Preview com Iframe

O preview usa um sistema de **iframe isolado** para garantir que media queries funcionem corretamente:

```
┌────────────────────────────────────────────────────────────┐
│ preview/[slug].tsx (Container Principal)                   │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Barra de Controles (Desktop/Mobile, Link Editar)       │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ┌──────────────────────────────────────────────────┐   │ │
│ │ │ IFRAME → embed/[slug].tsx                        │   │ │
│ │ │ (Viewport isolado - 430px para mobile)           │   │ │
│ │ │                                                  │   │ │
│ │ │ - Header                                         │   │ │
│ │ │ - Banners                                        │   │ │
│ │ │ - Widgets (renderizados dinamicamente)           │   │ │
│ │ │ - Produtos                                       │   │ │
│ │ │ - Footer                                         │   │ │
│ │ │                                                  │   │ │
│ │ └──────────────────────────────────────────────────┘   │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 6.2 Fluxo do Preview

1. **Usuário acessa** `/preview/[slug]`
2. **Container externo** carrega controles e iframe
3. **Toggle Desktop/Mobile** altera largura do iframe:
   - Desktop: 100% (max 1400px)
   - Mobile: 430px (iPhone 14 Pro Max)
4. **Iframe recarrega** para recalcular media queries
5. **postMessage** comunica altura do conteúdo

### 6.3 WidgetRenderer - Renderização de Widgets

```typescript
function WidgetRenderer({ widget, colors }: { widget: ThemeWidget, colors: ColorConfig }) {
  // 1. Extrai scripts externos
  const externalScripts: string[] = []
  htmlClean = htmlClean.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi, (_, src) => {
    externalScripts.push(src)
    return ''
  })

  // 2. Extrai scripts inline
  const inlineScripts: string[] = []
  htmlClean = htmlClean.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_, code) => {
    inlineScripts.push(code)
    return ''
  })

  // 3. Extrai CSS externos
  const externalCSS: string[] = []
  htmlClean = htmlClean.replace(/<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*\/?>/gi, (_, href) => {
    externalCSS.push(href)
    return ''
  })

  // 4. Carrega CSS
  externalCSS.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  })

  // 5. Insere HTML limpo
  containerRef.current.innerHTML = htmlClean

  // 6. Carrega scripts externos em sequência
  for (const src of externalScripts) {
    await loadExternalScript(src)
  }

  // 7. Executa scripts inline
  inlineScripts.forEach(code => {
    const fn = new Function(code)
    fn()
  })

  // 8. Autoplay vídeos
  videos.forEach(video => {
    video.muted = true
    video.play()
  })
}
```

### 6.4 CSS de Contenção

O sistema injeta CSS especial para isolar widgets e evitar conflitos:

```css
/* Reset básico */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden !important;
  max-width: 100vw !important;
}

/* Isolamento de widgets */
.widget {
  position: relative !important;
  isolation: isolate !important;
  contain: layout style !important;
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  z-index: 1 !important;
  transform: translateZ(0) !important;
}

/* Forçar altura automática */
.widget > div,
.widget > section,
.widget > article {
  position: relative !important;
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
}

/* Anular position fixed */
.widget [style*="position: fixed"] {
  position: absolute !important;
}

/* Reset z-index */
.widget * {
  z-index: auto !important;
}

/* Exceções */
.widget .swiper-button-next,
.widget .swiper-button-prev,
.widget button {
  z-index: 10 !important;
}

.widget [class*="modal"],
.widget [class*="overlay"] {
  z-index: 100 !important;
}
```

---

## 7. BANCO DE DADOS

### 7.1 Schema das Tabelas

#### themes
```sql
CREATE TABLE themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2),
  thumbnail_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  color_config JSONB,
  layout_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### theme_css
```sql
CREATE TABLE theme_css (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  page_type VARCHAR(50) NOT NULL CHECK (page_type IN ('home', 'product', 'cart')),
  css_code TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, page_type)
);
```

#### theme_widgets
```sql
CREATE TABLE theme_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  widget_type VARCHAR(50),
  html_content TEXT,
  config JSONB DEFAULT '{}',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### demo_products
```sql
CREATE TABLE demo_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  category VARCHAR(100),
  subcategory VARCHAR(100),
  badge VARCHAR(50),
  sku VARCHAR(50),
  stock INT DEFAULT 100,
  variations JSONB DEFAULT '[]',
  installments INT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### store_config
```sql
CREATE TABLE store_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  store_name VARCHAR(255) DEFAULT 'Minha Loja',
  store_logo TEXT,
  store_favicon TEXT,
  whatsapp VARCHAR(20),
  whatsapp_message TEXT,
  email VARCHAR(255),
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  top_bar_text VARCHAR(255),
  top_bar_enabled BOOLEAN DEFAULT true,
  btn_buy_text VARCHAR(50) DEFAULT 'COMPRAR',
  btn_add_cart_text VARCHAR(50) DEFAULT 'ADICIONAR',
  btn_checkout_text VARCHAR(50) DEFAULT 'FINALIZAR PEDIDO',
  btn_whatsapp_text VARCHAR(50) DEFAULT 'COMPRAR PELO WHATSAPP',
  free_shipping_enabled BOOLEAN DEFAULT true,
  free_shipping_value DECIMAL(10,2) DEFAULT 299.00,
  free_shipping_text VARCHAR(255),
  coupon_enabled BOOLEAN DEFAULT true,
  coupon_code VARCHAR(50),
  coupon_discount VARCHAR(50),
  coupon_text VARCHAR(255),
  cart_title VARCHAR(100),
  cart_empty_text VARCHAR(255),
  footer_text TEXT,
  footer_about TEXT,
  installments_max INT DEFAULT 12,
  installments_text VARCHAR(100),
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id)
);
```

#### orders
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.2 Diagrama de Relacionamentos

```
                    ┌──────────────┐
                    │    themes    │
                    │──────────────│
                    │ id (PK)      │
                    │ name         │
                    │ slug (UK)    │
                    │ description  │
                    │ price        │
                    │ thumbnail_url│
                    │ status       │
                    │ color_config │
                    │ layout_config│
                    │ created_at   │
                    │ updated_at   │
                    └──────┬───────┘
                           │
       ┌───────────────────┼───────────────────┬───────────────────┐
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  theme_css   │    │theme_widgets │    │demo_products │    │ store_config │
│──────────────│    │──────────────│    │──────────────│    │──────────────│
│ id (PK)      │    │ id (PK)      │    │ id (PK)      │    │ id (PK)      │
│ theme_id(FK) │    │ theme_id(FK) │    │ theme_id(FK) │    │ theme_id(FK) │
│ page_type    │    │ name         │    │ name         │    │ store_name   │
│ css_code     │    │ widget_type  │    │ price        │    │ whatsapp     │
│ ...          │    │ html_content │    │ image_url    │    │ ...          │
└──────────────┘    │ display_order│    │ category     │    └──────────────┘
                    │ is_active    │    │ is_featured  │
                    └──────────────┘    └──────────────┘

       │
       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   orders     │    │theme_banners │    │demo_banners  │
│──────────────│    │──────────────│    │──────────────│
│ id (PK)      │    │ id (PK)      │    │ id (PK)      │
│ theme_id(FK) │    │ theme_id(FK) │    │ theme_id(FK) │
│customer_name │    │ name         │    │ title        │
│customer_email│    │image_desktop │    │image_desktop │
│ status       │    │ image_mobile │    │ image_mobile │
│ ...          │    │ link_url     │    │ button_text  │
└──────────────┘    │ is_active    │    │ position     │
                    └──────────────┘    └──────────────┘
```

### 7.3 Índices

```sql
-- themes
CREATE INDEX idx_themes_slug ON themes(slug);
CREATE INDEX idx_themes_status ON themes(status);

-- theme_css
CREATE INDEX idx_theme_css_theme ON theme_css(theme_id);

-- demo_products
CREATE INDEX idx_demo_products_theme ON demo_products(theme_id);
CREATE INDEX idx_demo_products_category ON demo_products(category);
CREATE INDEX idx_demo_products_featured ON demo_products(is_featured);

-- theme_banners
CREATE INDEX idx_theme_banners_theme ON theme_banners(theme_id);
CREATE INDEX idx_theme_banners_position ON theme_banners(position);

-- orders
CREATE INDEX idx_orders_theme ON orders(theme_id);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
```

### 7.4 Triggers

```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas
CREATE TRIGGER trigger_themes_updated
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_theme_css_updated
  BEFORE UPDATE ON theme_css
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 8. FLUXOS PRINCIPAIS

### 8.1 Fluxo de Criação de Tema

```
┌─────────────────┐
│ Admin acessa    │
│ /admin/themes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Clica em        │
│ "Novo Tema"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Preenche:       │
│ - Nome          │
│ - Slug          │
│ - Descrição     │
│ - Preço         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ createTheme()   │
│ com cores       │
│ padrão          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redireciona     │
│ /admin/themes/  │
│ [id]            │
└─────────────────┘
```

### 8.2 Fluxo de Edição de Tema

```
┌─────────────────────────────────────────────────────────────────┐
│                     Página de Edição                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ABAS (8 no total)                     │   │
│  ├──────┬──────┬───────┬─────────┬──────┬─────────┬───────┤   │
│  │ Info │Layout│Fontes │Cabeçalho│Cores │Produtos │Banners│...│
│  └──────┴──────┴───────┴─────────┴──────┴─────────┴───────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                    CONTEÚDO DA ABA                      │   │
│  │                                                         │   │
│  │  [Info] Nome, slug, descrição, preço, status, thumb     │   │
│  │  [Layout] Ordem seções, logo, produtos por linha        │   │
│  │  [Fontes] Font título, font corpo                       │   │
│  │  [Cabeçalho] Modelo 1-6, busca, carrinho, whatsapp     │   │
│  │  [Cores] 13 color pickers organizados por grupo         │   │
│  │  [Produtos] Lista produtos + formulário                 │   │
│  │  [Banners] Lista banners + upload                       │   │
│  │  [Widgets] Editor HTML + preview                        │   │
│  │  [CSS] Editor por página (home, product, cart)          │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   BOTÕES DE AÇÃO                        │   │
│  │  [Salvar] [Gerar CSS] [Ver Preview]                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Fluxo de Preview

```
┌─────────────────┐
│ Usuário acessa  │
│ /preview/[slug] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ getServerSide   │─────▶│ getThemeBySlug  │
│ Props           │      └─────────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Renderiza       │
│ container com   │
│ controles       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Carrega iframe  │
│ /preview/embed/ │
│ [slug]          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Embed carrega:  │
│ - Cores         │
│ - Layout        │
│ - Widgets       │
│ - Produtos      │
│ - Banners       │
│ - CSS           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Renderiza       │
│ seções conforme │
│ layoutConfig    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ WidgetRenderer  │
│ processa cada   │
│ widget          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ postMessage     │
│ altura para     │
│ container       │
└─────────────────┘
```

### 8.4 Fluxo de Compra

```
┌─────────────────┐
│ Usuário em      │
│ /themes/[slug]  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Clica em        │
│ "Adquirir Tema" │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redireciona     │
│ /checkout/[slug]│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Preenche:       │
│ - Nome          │
│ - Email         │
│ - Observações   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /api/orders│
│ {theme_id, ...} │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ createOrder()   │
│ status: pending │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redireciona     │
│ /checkout/      │
│ success         │
└─────────────────┘
```

---

## 9. ANÁLISE DE ERROS E PROBLEMAS

### 9.1 Problemas de Segurança 🔴

| Problema | Localização | Impacto | Recomendação |
|----------|-------------|---------|--------------|
| **Sem autenticação** | `/admin/*` | 🔴 CRÍTICO | Implementar Supabase Auth com RLS |
| **XSS em widgets** | `WidgetRenderer` | 🔴 CRÍTICO | Usar DOMPurify para sanitização |
| **postMessage sem validação** | `preview/[slug].tsx` | 🟠 ALTO | Validar `event.origin` |
| **Execução de código arbitrário** | `new Function(code)` | 🔴 CRÍTICO | Usar sandbox ou iframe isolado |

### 9.2 Problemas de Arquitetura 🟡

| Problema | Localização | Impacto | Recomendação |
|----------|-------------|---------|--------------|
| **Arquivo muito grande** | `admin/themes/[id].tsx` (2400+ linhas) | 🟡 MÉDIO | Dividir em componentes por aba |
| **Funções duplicadas** | `themes.ts` vs `store.ts` | 🟡 MÉDIO | Consolidar em um único arquivo |
| **Sem tratamento de erro adequado** | Todas as funções supabase | 🟡 MÉDIO | Implementar error boundaries |
| **Sem cache** | Funções de listagem | 🟡 MÉDIO | Usar SWR ou React Query |

### 9.3 Problemas de Código 🟢

| Problema | Localização | Impacto | Recomendação |
|----------|-------------|---------|--------------|
| **Strings hardcoded** | Vários componentes | 🟢 BAIXO | Criar arquivo de i18n |
| **Sem validação de forms** | Forms de edição | 🟢 BAIXO | Usar react-hook-form + zod |
| **Console.error sem throw** | Funções supabase | 🟢 BAIXO | Propagar erros para UI |
| **Tipos any implícitos** | Alguns lugares | 🟢 BAIXO | Adicionar tipos explícitos |

### 9.4 Código com Problema - Exemplos

#### 1. Execução de código arbitrário (CRÍTICO)
```typescript
// src/pages/preview/embed/[slug].tsx - linha ~135
inlineScripts.forEach((code, index) => {
  try {
    const fn = new Function(code) // ⚠️ PERIGOSO
    fn()
  } catch (error) {
    console.error(`❌ [INLINE ${index + 1}] Erro:`, error)
  }
})
```

**Problema:** Executa qualquer código JavaScript enviado pelo widget.

**Solução:**
```typescript
// Usar sandbox ou validar origem do widget
const trustedWidgets = await getTrustedWidgets()
if (!trustedWidgets.includes(widget.id)) {
  console.warn('Widget não confiável, pulando scripts')
  return
}
```

#### 2. Sem validação de origem no postMessage
```typescript
// src/pages/preview/[slug].tsx - linha ~42
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // ⚠️ Não valida origem!
    if (event.data?.type === 'EMBED_HEIGHT') {
      setIframeHeight(event.data.height)
    }
  }
  window.addEventListener('message', handleMessage)
  // ...
}, [])
```

**Solução:**
```typescript
const handleMessage = (event: MessageEvent) => {
  // ✅ Validar origem
  const trustedOrigins = [window.location.origin, 'https://vizzutemas.com']
  if (!trustedOrigins.includes(event.origin)) return
  
  if (event.data?.type === 'EMBED_HEIGHT') {
    setIframeHeight(event.data.height)
  }
}
```

#### 3. HTML inserido sem sanitização
```typescript
// src/pages/preview/embed/[slug].tsx - linha ~89
containerRef.current.innerHTML = htmlClean // ⚠️ XSS potencial
```

**Solução:**
```typescript
import DOMPurify from 'dompurify'

// ✅ Sanitizar HTML
const sanitizedHtml = DOMPurify.sanitize(htmlClean, {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
})
containerRef.current.innerHTML = sanitizedHtml
```

---

## 10. BOAS PRÁTICAS IDENTIFICADAS ✅

| Prática | Onde |
|---------|------|
| ✅ TypeScript com tipos bem definidos | `src/lib/types.ts` |
| ✅ Separação de responsabilidades | `lib/supabase/*` |
| ✅ CSS Variables para customização | `generateBaseCss()` |
| ✅ Preview com viewport isolado (iframe) | `preview/embed/*` |
| ✅ Upload de imagens com Storage | Supabase Storage |
| ✅ Triggers automáticos no banco | `updated_at` |
| ✅ Índices nas tabelas | Migrations SQL |
| ✅ Componentes reutilizáveis | `components/admin/*` |
| ✅ Organização por domínio | `platform/`, `admin/` |
| ✅ Server-side rendering onde necessário | `getServerSideProps` |

---

## 11. RECOMENDAÇÕES DE MELHORIA

### 11.1 Segurança (Prioridade ALTA)

1. **Implementar autenticação**
   ```typescript
   // lib/supabase/auth.ts
   import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
   
   export async function requireAuth() {
     const supabase = createClientComponentClient()
     const { data: { session } } = await supabase.auth.getSession()
     if (!session) throw new Error('Not authenticated')
     return session
   }
   ```

2. **Adicionar RLS (Row Level Security)**
   ```sql
   -- Apenas admin pode modificar themes
   CREATE POLICY "Admin can CRUD themes"
   ON themes FOR ALL
   USING (auth.jwt() ->> 'role' = 'admin');
   ```

3. **Sanitizar widgets**
   ```bash
   npm install dompurify @types/dompurify
   ```

### 11.2 Arquitetura (Prioridade MÉDIA)

1. **Dividir arquivo de edição em componentes**
   ```
   src/components/admin/theme-editor/
   ├── InfoTab.tsx
   ├── LayoutTab.tsx
   ├── FontsTab.tsx
   ├── HeaderTab.tsx
   ├── ColorsTab.tsx
   ├── WidgetsTab.tsx
   ├── CssTab.tsx
   └── index.tsx
   ```

2. **Implementar SWR para cache**
   ```typescript
   import useSWR from 'swr'
   
   function useTheme(id: string) {
     return useSWR(`/api/themes/${id}`, fetcher)
   }
   ```

3. **Criar camada de serviço**
   ```typescript
   // services/theme.service.ts
   export class ThemeService {
     async create(data: CreateThemeDTO): Promise<Theme>
     async update(id: string, data: UpdateThemeDTO): Promise<Theme>
     async delete(id: string): Promise<void>
   }
   ```

### 11.3 UX (Prioridade BAIXA)

1. **Validação de formulários com Zod**
   ```typescript
   import { z } from 'zod'
   
   const themeSchema = z.object({
     name: z.string().min(3, 'Nome muito curto'),
     slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug inválido'),
     price: z.number().min(0, 'Preço inválido'),
   })
   ```

2. **Toast notifications**
   ```bash
   npm install react-hot-toast
   ```

3. **Loading states**
   ```typescript
   const [isLoading, setIsLoading] = useState(false)
   
   async function handleSave() {
     setIsLoading(true)
     try {
       await saveTheme()
       toast.success('Tema salvo!')
     } finally {
       setIsLoading(false)
     }
   }
   ```

---

## 12. MÉTRICAS DO PROJETO

| Métrica | Valor |
|---------|-------|
| **Total de arquivos TypeScript** | ~35 |
| **Total de componentes React** | ~25 |
| **Total de páginas** | 14 |
| **Total de tabelas no banco** | ~10 |
| **Maior arquivo** | `admin/themes/[id].tsx` (2407 linhas) |
| **Total de funções Supabase** | ~60 |
| **Dependências principais** | Next.js, Supabase, Tailwind |

---

## 13. CONCLUSÃO

O **Vizzutemas** é um projeto bem estruturado para venda de temas CSS para e-commerce. Utiliza tecnologias modernas (Next.js, TypeScript, Supabase, Tailwind) e possui uma arquitetura clara.

### Pontos Fortes
- Sistema de preview inovador com iframe isolado
- Customização completa de cores e layout
- Widgets HTML dinâmicos
- Interface administrativa intuitiva

### Pontos de Melhoria
1. **Segurança**: Adicionar autenticação e sanitização de widgets
2. **Manutenibilidade**: Refatorar arquivos grandes
3. **Performance**: Implementar cache e lazy loading

### Status Geral
O projeto compila sem erros e está funcional. As melhorias sugeridas são para aumentar segurança e facilitar manutenção futura.

---

*Relatório gerado automaticamente em 18/01/2026*
