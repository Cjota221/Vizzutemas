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
        <title>{title ? `${title} | Vizzutemas Admin` : 'Vizzutemas Admin'}</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-200 hidden lg:block">
          {/* Logo */}
          <div className="h-14 flex items-center px-5 border-b border-gray-100">
            <Link href="/admin/themes" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-gray-900">Vizzutemas</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = router.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Vizzutemas</span>
          </div>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-56 bg-white shadow-xl">
              <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100">
                <span className="font-semibold text-gray-900">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {menuItems.map((item) => {
                  const isActive = router.pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
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
        <main className="lg:pl-56 pt-14 lg:pt-6 min-h-screen">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}

// Simple Page Header
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// Simple Card
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
    <div className={`bg-white rounded-lg border border-gray-200 ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}
