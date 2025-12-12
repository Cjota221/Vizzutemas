/**
 * ReviewsSection
 * 
 * Seção de avaliações de clientes com carrossel.
 * Fundo colorido (success/verde) destacando avaliações.
 * 
 * CLASSES IMPORTANTES (manter para CSS dos temas):
 * - #section-avaliacoes-clientes: Container principal
 * - .swiper-avaliacoes: Carrossel de avaliações
 * - .avaliacao-card: Card individual
 * - .avaliacao-estrelas: Estrelas de rating
 * - .avaliacao-texto: Texto da avaliação
 * - .avaliacao-cliente: Nome do cliente
 * 
 * INTEGRAÇÃO FUTURA:
 * - Avaliações virão do banco de dados
 * - Rating será calculado
 * - Fotos de clientes opcionais
 */
export default function ReviewsSection() {
  // SUBSTITUIR: Avaliações virão do banco de dados
  const reviews = [
    {
      id: 1,
      name: 'Cliente Exemplo',
      phone: '(00) 9****-0000',
      rating: 5,
      text: 'Produto de excelente qualidade! Recomendo muito. Entrega rápida e embalagem perfeita.',
      date: '10/12/2025'
    },
    {
      id: 2,
      name: 'Cliente Exemplo',
      phone: '(00) 9****-0000',
      rating: 5,
      text: 'Amei! Superou minhas expectativas. Com certeza voltarei a comprar.',
      date: '09/12/2025'
    },
    {
      id: 3,
      name: 'Cliente Exemplo',
      phone: '(00) 9****-0000',
      rating: 4,
      text: 'Muito bom! Entrega dentro do prazo e produto conforme anunciado.',
      date: '08/12/2025'
    },
  ]

  // Renderiza estrelas de rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i 
        key={i} 
        className={`fa fa-star${i < rating ? '' : '-o'} text-warning`}
      ></i>
    ))
  }

  return (
    <section id="section-avaliacoes-clientes" className="reviews-section py-5 bg-success">
      <div className="container">
        {/* Título */}
        <div className="section-header text-center mb-4">
          <h2 className="section-title text-white">
            <i className="fa fa-comments mr-2"></i>
            O QUE NOSSOS CLIENTES DIZEM
          </h2>
        </div>

        {/* Carrossel de avaliações */}
        <div className="swiper swiper-avaliacoes">
          <div className="swiper-wrapper">
            {reviews.map((review) => (
              <div key={review.id} className="swiper-slide">
                <div className="avaliacao-card bg-white rounded p-4 h-100">
                  {/* Estrelas */}
                  <div className="avaliacao-estrelas mb-2">
                    {renderStars(review.rating)}
                  </div>
                  
                  {/* Texto */}
                  <p className="avaliacao-texto text-muted mb-3">
                    "{review.text}"
                  </p>
                  
                  {/* Cliente */}
                  <div className="avaliacao-cliente">
                    <strong className="d-block">{review.name}</strong>
                    <small className="text-muted">{review.phone}</small>
                    <small className="text-muted d-block">{review.date}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navegação */}
          <div className="swiper-pagination"></div>
        </div>
      </div>
    </section>
  )
}
