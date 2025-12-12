import Link from 'next/link'

/**
 * Landing Page - Página inicial da plataforma Vizzutemas
 * Apresenta a plataforma e direciona para a galeria de temas
 */
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Vizzutemas</h1>
        <p className="text-xl text-gray-600 mb-8">
          Plataforma de temas profissionais para sua loja virtual
        </p>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Transforme o visual da sua loja com nossos temas exclusivos. 
          Fácil de aplicar, sem precisar alterar o código.
        </p>
        <div className="space-x-4">
          <Link 
            href="/themes" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Ver Temas
          </Link>
          <Link 
            href="/admin/themes" 
            className="inline-block px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Área Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
