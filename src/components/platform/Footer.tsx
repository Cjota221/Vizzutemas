/**
 * Footer
 * 
 * Rodapé da loja com:
 * - Formulário de newsletter
 * - Links institucionais
 * - Formas de pagamento
 * - Selos de segurança
 * - Informações da empresa
 * 
 * CLASSES IMPORTANTES (manter para CSS dos temas):
 * - .footer-section: Container principal
 * - .footer-newsletter: Formulário de newsletter
 * - .footer-links: Links institucionais
 * - .footer-payments: Formas de pagamento
 * - .footer-security: Selos de segurança
 * - .footer-info: Informações da empresa
 * 
 * INTEGRAÇÃO FUTURA:
 * - Dados da empresa virão do banco
 * - Links serão configuráveis
 * - Newsletter terá integração real
 */
export default function Footer() {
  return (
    <footer className="footer-section bg-dark text-white pt-5 pb-3">
      <div className="container">
        {/* Newsletter */}
        <section className="footer-newsletter mb-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 text-center">
              <h4 className="mb-3">RECEBA NOSSAS NOVIDADES</h4>
              <p className="text-muted mb-4">
                Cadastre-se e receba promoções exclusivas!
              </p>
              <form className="newsletter-form">
                <div className="row">
                  <div className="col-12 col-md-4 mb-2">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="col-12 col-md-4 mb-2">
                    <input 
                      type="tel" 
                      className="form-control" 
                      placeholder="WhatsApp"
                    />
                  </div>
                  <div className="col-12 col-md-4 mb-2">
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="E-mail"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-2">
                  CADASTRAR
                </button>
              </form>
            </div>
          </div>
        </section>

        <hr className="border-secondary" />

        {/* Links e informações */}
        <div className="row py-4">
          {/* Coluna 1 - Institucional */}
          <div className="col-6 col-md-3 mb-4">
            <h5 className="footer-title mb-3">INSTITUCIONAL</h5>
            <ul className="footer-links list-unstyled">
              {/* SUBSTITUIR: Links configuráveis */}
              <li><a href="#" className="text-muted">Quem Somos</a></li>
              <li><a href="#" className="text-muted">Política de Privacidade</a></li>
              <li><a href="#" className="text-muted">Termos de Uso</a></li>
              <li><a href="#" className="text-muted">Trocas e Devoluções</a></li>
            </ul>
          </div>

          {/* Coluna 2 - Ajuda */}
          <div className="col-6 col-md-3 mb-4">
            <h5 className="footer-title mb-3">AJUDA</h5>
            <ul className="footer-links list-unstyled">
              <li><a href="#" className="text-muted">Central de Ajuda</a></li>
              <li><a href="#" className="text-muted">Como Comprar</a></li>
              <li><a href="#" className="text-muted">Formas de Pagamento</a></li>
              <li><a href="#" className="text-muted">Prazo de Entrega</a></li>
            </ul>
          </div>

          {/* Coluna 3 - Contato */}
          <div className="col-6 col-md-3 mb-4">
            <h5 className="footer-title mb-3">CONTATO</h5>
            <ul className="footer-links list-unstyled">
              {/* SUBSTITUIR: Dados da empresa */}
              <li className="text-muted">
                <i className="fa fa-whatsapp mr-2"></i>
                (00) 00000-0000
              </li>
              <li className="text-muted">
                <i className="fa fa-envelope mr-2"></i>
                contato@loja.com.br
              </li>
              <li className="text-muted">
                <i className="fa fa-clock-o mr-2"></i>
                Seg-Sex: 9h às 18h
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Pagamento */}
          <div className="col-6 col-md-3 mb-4">
            <h5 className="footer-title mb-3">PAGAMENTO</h5>
            <div className="footer-payments d-flex flex-wrap">
              {/* SUBSTITUIR: Ícones reais de pagamento */}
              <span className="payment-icon bg-white text-dark rounded p-2 mr-2 mb-2">PIX</span>
              <span className="payment-icon bg-white text-dark rounded p-2 mr-2 mb-2">
                <i className="fa fa-credit-card"></i>
              </span>
              <span className="payment-icon bg-white text-dark rounded p-2 mr-2 mb-2">
                <i className="fa fa-barcode"></i>
              </span>
            </div>

            <h5 className="footer-title mb-3 mt-4">SEGURANÇA</h5>
            <div className="footer-security d-flex flex-wrap">
              <span className="security-icon bg-white text-dark rounded p-2 mr-2 mb-2 small">
                <i className="fa fa-lock mr-1"></i>SSL
              </span>
              <span className="security-icon bg-white text-dark rounded p-2 mr-2 mb-2 small">
                <i className="fa fa-shield mr-1"></i>Safe
              </span>
            </div>
          </div>
        </div>

        <hr className="border-secondary" />

        {/* Copyright */}
        <div className="footer-info text-center py-3">
          <p className="mb-1 small text-muted">
            {/* SUBSTITUIR: Dados reais da empresa */}
            Nome da Empresa LTDA | CNPJ: 00.000.000/0001-00
          </p>
          <p className="mb-0 small text-muted">
            Endereço da Empresa, 000 - Cidade/UF - CEP: 00000-000
          </p>
          <p className="mt-2 small text-muted">
            © {new Date().getFullYear()} Nome da Loja. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Botão fixo "Finalizar Pedido" */}
      <div className="btn-finalizar-pedido-fixo d-md-none">
        <a href="#" className="btn btn-success btn-block py-3">
          <i className="fa fa-shopping-cart mr-2"></i>
          FINALIZAR PEDIDO
        </a>
      </div>
    </footer>
  )
}
