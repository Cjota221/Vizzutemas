/**
 * CategoriesBar
 * 
 * Carrossel horizontal de categorias com círculos de imagem.
 * Usa Swiper.js para navegação.
 * 
 * CLASSES IMPORTANTES (manter para CSS dos temas):
 * - #carrossel-categorias: Container principal
 * - .categoria-item: Item de categoria
 * - .categoria-circulo: Círculo com imagem
 * - .swiper, .swiper-wrapper, .swiper-slide: Classes do Swiper
 * 
 * INTEGRAÇÃO FUTURA:
 * - Categorias virão do banco de dados
 * - Imagens serão URLs reais
 * - Links direcionarão para páginas de categoria
 */
export default function CategoriesBar() {
  // SUBSTITUIR: Categorias virão do banco de dados
  const categories = [
    { name: 'Lançamentos', image: '/assets/cat-placeholder.jpg', href: '#' },
    { name: 'Masculino', image: '/assets/cat-placeholder.jpg', href: '#' },
    { name: 'Feminino', image: '/assets/cat-placeholder.jpg', href: '#' },
    { name: 'Infantil', image: '/assets/cat-placeholder.jpg', href: '#' },
    { name: 'Promoções', image: '/assets/cat-placeholder.jpg', href: '#' },
    { name: 'Acessórios', image: '/assets/cat-placeholder.jpg', href: '#' },
  ]

  return (
    <section id="carrossel-categorias" className="categories-section py-4">
      <div className="container">
        {/* Swiper Container - será inicializado via JS */}
        <div className="swiper swiper-categorias">
          <div className="swiper-wrapper">
            {categories.map((cat, index) => (
              <div key={index} className="swiper-slide">
                <a href={cat.href} className="categoria-item text-center d-block text-decoration-none">
                  <div className="categoria-circulo mx-auto mb-2">
                    {/* Placeholder para imagem */}
                    <div 
                      className="categoria-img"
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#f0f0f0',
                        backgroundImage: `url(${cat.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        margin: '0 auto'
                      }}
                    ></div>
                  </div>
                  <span className="categoria-nome small">{cat.name}</span>
                </a>
              </div>
            ))}
          </div>
          {/* Navegação Swiper */}
          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
        </div>
      </div>
    </section>
  )
}
