/**
 * ProductsSection
 * 
 * Seção de produtos "Acabaram de Chegar" com carrossel.
 * Cada card de produto tem: imagem, nome, preço, parcelamento, botões.
 * 
 * CLASSES IMPORTANTES (manter para CSS dos temas):
 * - .fz-produto: Card de produto
 * - .produto-img: Imagem do produto
 * - .produto-nome: Nome/título
 * - .produto-preco: Preço principal
 * - .produto-parcelas: Informação de parcelamento
 * - .btn-comprar: Botão "QUERO" / Comprar
 * - .swiper-produtos: Container do carrossel
 * 
 * INTEGRAÇÃO FUTURA:
 * - Produtos virão do banco de dados
 * - Preços serão formatados
 * - Botões terão ações reais (adicionar ao carrinho)
 */
export default function ProductsSection() {
  // SUBSTITUIR: Produtos virão do banco de dados
  const products = [
    {
      id: 1,
      name: 'Título do Produto',
      image: '/assets/product-placeholder.jpg',
      price: 0,
      originalPrice: 0,
      installments: '12x de R$ 0,00',
      href: '#'
    },
    {
      id: 2,
      name: 'Título do Produto',
      image: '/assets/product-placeholder.jpg',
      price: 0,
      originalPrice: 0,
      installments: '12x de R$ 0,00',
      href: '#'
    },
    {
      id: 3,
      name: 'Título do Produto',
      image: '/assets/product-placeholder.jpg',
      price: 0,
      originalPrice: 0,
      installments: '12x de R$ 0,00',
      href: '#'
    },
    {
      id: 4,
      name: 'Título do Produto',
      image: '/assets/product-placeholder.jpg',
      price: 0,
      originalPrice: 0,
      installments: '12x de R$ 0,00',
      href: '#'
    },
  ]

  return (
    <section className="products-section py-5">
      <div className="container">
        {/* Título da seção */}
        <div className="section-header text-center mb-4">
          <h2 className="section-title">
            {/* SUBSTITUIR: Título configurável */}
            ACABARAM DE CHEGAR
          </h2>
          <p className="section-subtitle text-muted">
            Confira nossos últimos lançamentos
          </p>
        </div>

        {/* Carrossel de produtos */}
        <div className="swiper swiper-produtos">
          <div className="swiper-wrapper">
            {products.map((product) => (
              <div key={product.id} className="swiper-slide">
                <div className="fz-produto card h-100">
                  {/* Imagem do produto */}
                  <a href={product.href} className="produto-img-link">
                    <div 
                      className="produto-img"
                      style={{
                        height: '200px',
                        backgroundColor: '#f8f9fa',
                        backgroundImage: `url(${product.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                  </a>

                  {/* Informações do produto */}
                  <div className="card-body text-center">
                    <h3 className="produto-nome h6">
                      <a href={product.href} className="text-dark text-decoration-none">
                        {product.name}
                      </a>
                    </h3>
                    
                    {/* Preços */}
                    <div className="produto-precos">
                      {product.originalPrice > product.price && (
                        <span className="produto-preco-original text-muted small text-decoration-line-through mr-2">
                          R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className="produto-preco font-weight-bold text-success">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    <div className="produto-parcelas small text-muted">
                      {product.installments}
                    </div>

                    {/* Botão comprar */}
                    <button className="btn btn-comprar btn-primary btn-block mt-3">
                      QUERO
                    </button>

                    {/* Ações secundárias */}
                    <div className="produto-acoes mt-2 d-flex justify-content-center">
                      <button className="btn btn-sm btn-outline-secondary mr-2" aria-label="Curtir">
                        <i className="fa fa-heart-o"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" aria-label="Compartilhar">
                        <i className="fa fa-share-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navegação Swiper */}
          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
          <div className="swiper-pagination"></div>
        </div>
      </div>
    </section>
  )
}
