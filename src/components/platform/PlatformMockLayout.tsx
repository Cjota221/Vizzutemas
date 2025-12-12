import Head from 'next/head'
import {
  Header,
  StoreInfo,
  CategoriesBar,
  ProductsSection,
  ReviewsSection,
  Footer,
  ThemeStyle,
} from './index'

type Props = {
  /** CSS do tema que será injetado */
  themeCss?: string
  /** Conteúdo adicional para renderizar (páginas específicas) */
  children?: React.ReactNode
  /** Título da página */
  pageTitle?: string
}

/**
 * PlatformMockLayout
 * 
 * Esta é a "carcaça" HTML que imita a plataforma real da loja.
 * Monta todos os componentes na ordem correta e injeta o CSS do tema.
 * 
 * ESTRUTURA:
 * 1. Header (navbar-top, logo/busca, menu)
 * 2. Categories (carrossel de categorias)
 * 3. StoreInfo (selos/estatísticas)
 * 4. Products (carrossel de produtos)
 * 5. Reviews (avaliações de clientes)
 * 6. Footer (newsletter, links, pagamentos)
 * 
 * DEPENDÊNCIAS EXTERNAS (carregadas no _document.tsx):
 * - Bootstrap 4.x (CSS)
 * - Font Awesome 4.x (ícones)
 * - Swiper.js (carrosséis)
 * 
 * INTEGRAÇÃO DE TEMAS:
 * - Passe o CSS do tema via prop `themeCss`
 * - O CSS será injetado dinamicamente via <style>
 * - Use as classes e IDs documentados em cada componente
 * 
 * @example
 * ```tsx
 * const meuTema = `
 *   .navbar-top { background: #8B5CF6; }
 *   .btn-comprar { background: #10B981; }
 * `;
 * <PlatformMockLayout themeCss={meuTema} />
 * ```
 */
export default function PlatformMockLayout({ 
  themeCss, 
  children,
  pageTitle = 'Preview - Plataforma Mock'
}: Props) {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Injeta CSS do tema */}
      <ThemeStyle css={themeCss} />

      {/* ========== ESTRUTURA DA LOJA ========== */}
      
      {/* HEADER */}
      <Header />

      {/* CATEGORIAS */}
      <CategoriesBar />

      {/* INFO LOJA (Selos) */}
      <StoreInfo />

      {/* PRODUTOS - Acabaram de Chegar */}
      <ProductsSection />

      {/* Conteúdo adicional (páginas específicas) */}
      {children && (
        <section className="custom-content py-4">
          <div className="container">
            {children}
          </div>
        </section>
      )}

      {/* AVALIAÇÕES */}
      <ReviewsSection />

      {/* RODAPÉ */}
      <Footer />
    </>
  )
}
