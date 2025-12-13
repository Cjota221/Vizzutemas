import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'

type Props = {
  children: React.ReactNode
  title?: string
}

const menuItems = [
  { href: '/admin/themes', label: 'Temas', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { href: '/admin/orders', label: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
]

export default function AdminLayout({ children, title }: Props) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <Head>
        <title>{title ? `${title} | Vizzutemas` : 'Vizzutemas'}</title>
      </Head>
      
      <div className="min-h-screen bg-slate-50">
        {/* Sidebar - Desktop */}
        <aside className="fixed inset-y-0 left-0 w-52 bg-white border-r border-slate-200 hidden lg:flex lg:flex-col">
          {/* Logo */}
          <div className="h-14 flex items-center px-4 border-b border-slate-100">
            <Link href="/admin/themes" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-900">Vizzutemas</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5">
            {menuItems.map((item) => {
              const isActive = router.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <svg className={`w-4 h-4 ${isActive ? 'text-slate-700' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Voltar ao site
            </Link>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-900">Vizzutemas</span>
          </div>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5'} />
            </svg>
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-56 bg-white shadow-xl flex flex-col">
              <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Menu</span>
                <button 
                  onClick={() => setMobileOpen(false)} 
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-0.5">
                {menuItems.map((item) => {
                  const isActive = router.pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <svg className={`w-4 h-4 ${isActive ? 'text-slate-700' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="lg:pl-52 pt-14 lg:pt-0 min-h-screen">
          <div className="p-4 lg:p-6 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}

// Page Header - Clean & Professional
export function PageHeader({ 
  title, 
  description, 
  action 
}: { 
  title: string
  description?: string
  action?: React.ReactNode 
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// Card - Subtle border, no heavy shadow
export function Card({ 
  children, 
  className = '', 
  padding = true 
}: { 
  children: React.ReactNode
  className?: string
  padding?: boolean
}) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}
