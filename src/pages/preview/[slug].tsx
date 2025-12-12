import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import { useState } from 'react'
import { getThemeBySlug, generateBaseCss } from '@/lib/supabase/themes'
import { getProducts, getDemoBanners } from '@/lib/supabase/store'
import { ColorConfig } from '@/lib/types'
import type { DemoProduct, DemoBanner } from '@/lib/supabase/store'

type Props = {
  theme: { id: string; name: string; slug: string }
  products: DemoProduct[]
  banners: DemoBanner[]
  colors: ColorConfig
  injectedCss: string
}

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

export default function PreviewPage({ theme, products, banners, colors, injectedCss }: Props) {
  const [cartCount, setCartCount] = useState(0)

  return (
    <>
      <Head>
        <title>Preview - {theme.name}</title>
        <style dangerouslySetInnerHTML={{ __html: injectedCss }} />
      </Head>

      {/* Barra Admin */}
      <div className="bg-gray-900 text-white py-2 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin/themes" className="text-blue-400 hover:text-blue-300 text-sm">
            Voltar ao Admin
          </Link>
          <span className="text-sm">Preview: <strong>{theme.name}</strong></span>
        </div>
        <Link href={`/admin/themes/${theme.id}`} className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700">
          Editar Tema
        </Link>
      </div>

      {/* Preview da Loja */}
      <div style={{ backgroundColor: colors.cor_fundo_pagina }} className="min-h-screen">
        {/* Barra Superior */}
        <div className="text-center py-2 text-xs font-medium text-white" style={{ backgroundColor: colors.cor_fundo_barra_superior }}>
          Frete Gratis acima de R$ 299 | Use o cupom PRIMEIRACOMPRA
        </div>

        {/* Header */}
        <header className="shadow-sm px-4 py-3" style={{ backgroundColor: colors.cor_fundo_cabecalho }}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: colors.cor_botoes_cabecalho }}>
              <span className="text-xs font-bold" style={{ color: colors.cor_botoes_cabecalho }}>LOGO</span>
            </div>
            <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: colors.cor_botoes_cabecalho }}>
              Carrinho ({cartCount})
            </button>
          </div>
        </header>

        {/* Banners */}
        {banners.length > 0 && (
          <div className="mb-6">
            {banners.map(banner => (
              <img key={banner.id} src={banner.image_desktop} alt={banner.title || 'Banner'} className="w-full h-auto object-cover" />
            ))}
          </div>
        )}

        {/* Produtos */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.cor_detalhes_gerais }}>Nossos Produtos</h2>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">Nenhum produto cadastrado ainda.</p>
              <Link href={`/admin/themes/${theme.id}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Cadastrar Produtos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{product.name}</h3>
                    {product.original_price && <p className="text-xs text-gray-400 line-through">R$ {product.original_price.toFixed(2)}</p>}
                    <p className="text-lg font-bold" style={{ color: colors.cor_detalhes_gerais }}>R$ {product.price.toFixed(2)}</p>
                    <button onClick={() => setCartCount(c => c + 1)} className="w-full mt-2 py-2 text-white text-sm font-medium rounded" style={{ backgroundColor: colors.cor_botao_enviar_pedido }}>
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodape */}
        <footer className="mt-8 py-6 text-center text-white text-sm" style={{ backgroundColor: colors.cor_fundo_rodape }}>
          2025 Loja Demo - Tema: {theme.name}
        </footer>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.slug as string
  const theme = await getThemeBySlug(slug)
  
  if (!theme) return { notFound: true }

  const products = await getProducts(theme.id)
  const banners = await getDemoBanners(theme.id)
  const colors = theme.color_config ? { ...defaultColors, ...theme.color_config } : defaultColors
  const injectedCss = generateBaseCss(colors)

  return {
    props: {
      theme: { id: theme.id, name: theme.name, slug: theme.slug },
      products,
      banners,
      colors,
      injectedCss,
    },
  }
}
