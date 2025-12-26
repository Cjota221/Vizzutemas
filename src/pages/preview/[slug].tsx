/**
 * 🖼️ PREVIEW PAGE V2 - Com Iframe Real
 * 
 * Esta página usa um iframe REAL para renderizar o preview,
 * garantindo que as media queries funcionem corretamente
 * baseadas no viewport do iframe (não do navegador).
 * 
 * Quando o usuário alterna para Mobile, o iframe é redimensionado
 * para 375px de largura, fazendo com que todos os @media queries
 * dos widgets sejam acionados corretamente.
 */

import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import { getThemeBySlug } from '@/lib/supabase/themes'

interface PreviewPageProps {
  theme: {
    id: string
    name: string
    slug: string
  }
}

export default function PreviewPage({ theme }: PreviewPageProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [iframeHeight, setIframeHeight] = useState(800)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isMobile = viewMode === 'mobile'
  
  // Dimensões do preview
  const previewWidth = isMobile ? 375 : '100%'
  const previewMaxWidth = isMobile ? 375 : 1400

  // Escutar mensagens do iframe para ajustar altura
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'EMBED_HEIGHT' && typeof event.data.height === 'number') {
        setIframeHeight(Math.max(event.data.height, 600))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Recarregar iframe quando mudar modo
  useEffect(() => {
    if (iframeRef.current) {
      // Forçar reload para recalcular media queries
      const currentSrc = iframeRef.current.src
      iframeRef.current.src = ''
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc
        }
      }, 50)
    }
  }, [viewMode])

  return (
    <>
      <Head>
        <title>{`Preview - ${theme.name}`}</title>
        <style>{`
          html, body {
            background: #1a1a2e;
            overflow-x: hidden;
          }
        `}</style>
      </Head>

      {/* 🔧 Barra de Controle Admin */}
      <div className="bg-gray-900 text-white py-3 px-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <Link href="/admin/themes" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <div className="h-4 w-px bg-gray-700" />
          <span className="text-sm">
            Preview: <strong className="text-blue-400">{theme.name}</strong>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Toggle Desktop/Mobile */}
          <div className="flex bg-gray-800 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'desktop' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🖥️ Desktop
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'mobile' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📱 Mobile
            </button>
          </div>

          {/* Indicador de tamanho */}
          <span className="text-xs text-gray-500 hidden sm:inline">
            {isMobile ? '375 × ' + iframeHeight : '100%'}
          </span>

          {/* Link para editar */}
          <Link 
            href={`/admin/themes/${theme.id}`} 
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition shadow"
          >
            Editar Tema
          </Link>
        </div>
      </div>

      {/* 📱 Container do Preview */}
      <div 
        className="flex justify-center py-6 px-4 min-h-screen"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <div 
          className={`transition-all duration-500 ease-out ${
            isMobile 
              ? 'rounded-[40px] shadow-2xl border-[12px] border-gray-800 bg-gray-800' 
              : 'w-full'
          }`}
          style={{
            width: previewWidth,
            maxWidth: previewMaxWidth,
            // Simular "notch" no mobile
            ...(isMobile && {
              position: 'relative',
            })
          }}
        >
          {/* Notch do celular (visual) */}
          {isMobile && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
          )}

          {/* 🖼️ IFRAME - Viewport Isolado Real */}
          <iframe
            ref={iframeRef}
            src={`/preview/embed/${theme.slug}`}
            className={`bg-white ${isMobile ? 'rounded-[28px]' : ''}`}
            style={{
              width: '100%',
              height: iframeHeight,
              border: 'none',
              display: 'block',
              overflow: 'hidden',
            }}
            title={`Preview de ${theme.name}`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />

          {/* Barra inferior do celular (visual) */}
          {isMobile && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gray-600 rounded-full" />
          )}
        </div>
      </div>

      {/* Informações do viewport */}
      <div className="fixed bottom-4 right-4 bg-gray-900/90 text-white px-4 py-2 rounded-lg text-xs shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isMobile ? 'bg-green-500' : 'bg-blue-500'}`} />
          <span>
            {isMobile ? 'Mobile View (375px)' : 'Desktop View'}
          </span>
        </div>
        <div className="text-gray-400 mt-1">
          Media queries ativas: {isMobile ? '@media (max-width: 768px)' : '@media (min-width: 769px)'}
        </div>
      </div>
    </>
  )
}

// ========================================
// 📡 SERVER SIDE PROPS
// ========================================
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string
  
  try {
    const theme = await getThemeBySlug(slug)
    
    if (!theme) {
      return { notFound: true }
    }

    return {
      props: {
        theme: {
          id: theme.id,
          name: theme.name,
          slug: theme.slug
        }
      }
    }
  } catch (error) {
    console.error('Erro ao carregar preview:', error)
    return { notFound: true }
  }
}
