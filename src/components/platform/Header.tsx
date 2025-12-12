import Link from 'next/link'

/**
 * Header
 * 
 * Barra superior da loja com:
 * - Mensagem promocional
 * - Links sociais (WhatsApp, Instagram)
 * - Links informativos
 * - Carrinho e conta
 * 
 * CLASSES IMPORTANTES (manter para CSS dos temas):
 * - .navbar-top: Barra superior principal
 * - .desktop-top: Seção de logo e busca
 * - .menu-section: Menu de navegação
 * 
 * INTEGRAÇÃO FUTURA:
 * - Links virão do banco de dados
 * - Logo será dinâmica por loja
 * - Quantidade do carrinho será real
 */
export default function Header() {
  return (
    <>
      {/* ========== NAVBAR TOP - Barra Superior ========== */}
      <nav className="navbar-top">
        <div className="container">
          <div className="row align-items-center">
            {/* Mensagem promocional */}
            <div className="col-12 col-md-6 text-center text-md-left">
              <span className="promo-message">
                {/* SUBSTITUIR: Mensagem promocional dinâmica */}
                🎉 FRETE GRÁTIS acima de R$ 299 | Parcele em até 12x
              </span>
            </div>
            
            {/* Links e redes sociais */}
            <div className="col-12 col-md-6 text-center text-md-right">
              <div className="social-links d-inline-flex align-items-center">
                <a href="#" className="social-link" aria-label="WhatsApp">
                  <i className="fa fa-whatsapp"></i>
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <i className="fa fa-instagram"></i>
                </a>
                <span className="divider mx-2">|</span>
                <a href="#" className="info-link">Informações</a>
                <a href="#" className="info-link">Pagamento</a>
                <a href="#" className="info-link">Entrega</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== DESKTOP TOP - Logo e Busca ========== */}
      <section className="desktop-top py-3">
        <div className="container">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-4 col-md-3">
              <Link href="/" className="logo-link">
                {/* SUBSTITUIR: Logo dinâmica da loja */}
                <div id="platform-logo" className="logo-placeholder">
                  <img 
                    src="/assets/logo-placeholder.png" 
                    alt="Logo da Loja" 
                    className="img-fluid"
                    style={{ maxHeight: '60px' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('d-none')
                    }}
                  />
                  <span className="logo-text d-none font-weight-bold">Nome da Loja</span>
                </div>
              </Link>
            </div>

            {/* Campo de busca */}
            <div className="col-4 col-md-6">
              <form className="search-form">
                <div className="input-group">
                  <input 
                    type="text" 
                    id="busca_input_topo"
                    className="form-control" 
                    placeholder="O que você procura?"
                    aria-label="Buscar produtos"
                  />
                  <div className="input-group-append">
                    <button className="btn btn-search" type="submit">
                      <i className="fa fa-search"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Carrinho e conta */}
            <div className="col-4 col-md-3 text-right">
              <div className="header-actions d-flex align-items-center justify-content-end">
                {/* Minha conta */}
                <a href="#" id="link_minha_conta" className="action-link mr-3">
                  <i className="fa fa-user"></i>
                  <span className="d-none d-md-inline ml-1">Conta</span>
                </a>
                
                {/* Carrinho */}
                <a href="#" className="action-link cart-link">
                  <i className="fa fa-shopping-cart"></i>
                  <span id="carrinho_quantidade_a" className="cart-badge">0</span>
                  <span className="d-none d-md-inline ml-1">
                    R$ <span id="carrinho_total_a">0,00</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MENU SECTION - Navegação Principal ========== */}
      <nav className="menu-section">
        <div className="container">
          <ul className="nav-menu d-flex flex-wrap justify-content-center list-unstyled mb-0">
            {/* SUBSTITUIR: Menu dinâmico do banco de dados */}
            <li className="nav-item"><a href="#" className="nav-link">INÍCIO</a></li>
            <li className="nav-item"><a href="#" className="nav-link">LANÇAMENTOS</a></li>
            <li className="nav-item"><a href="#" className="nav-link">MASCULINO</a></li>
            <li className="nav-item"><a href="#" className="nav-link">FEMININO</a></li>
            <li className="nav-item"><a href="#" className="nav-link">INFANTIL</a></li>
            <li className="nav-item"><a href="#" className="nav-link">PROMOÇÕES</a></li>
            <li className="nav-item"><a href="#" className="nav-link">CONTATO</a></li>
          </ul>
        </div>
      </nav>
    </>
  )
}
