/**
 * StoreInfo
 * 
 * Seção de selos/informações da loja com estatísticas:
 * - Pedidos Recebidos
 * - Avaliações de Clientes
 * - Produtos Disponíveis
 * - Acessos Totais
 * 
 * CLASSES IMPORTANTES (manter para CSS dos temas):
 * - .selo-div: Cards de informações
 * - #selos_div_slider: Container do slider
 * 
 * INTEGRAÇÃO FUTURA:
 * - Estatísticas virão do banco de dados
 * - Ícones e textos configuráveis por loja
 */
export default function StoreInfo() {
  // SUBSTITUIR: Dados virão do banco de dados
  const stats = [
    { icon: 'fa-headphones', value: '0', label: 'Áudio de Boas-Vindas' },
    { icon: 'fa-shopping-bag', value: '0K', label: 'Pedidos Recebidos' },
    { icon: 'fa-star', value: '0K', label: 'Avaliações de Clientes' },
    { icon: 'fa-tags', value: '0', label: 'Produtos Disponíveis' },
    { icon: 'fa-eye', value: '0K', label: 'Acessos Totais' },
  ]

  return (
    <section className="store-info-section py-4">
      <div className="container">
        <div id="selos_div_slider" className="selos-container">
          <div className="row justify-content-center">
            {stats.map((stat, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-2 mb-3">
                <div className="selo-div text-center p-3">
                  <div className="selo-icon mb-2">
                    <i className={`fa ${stat.icon} fa-2x`}></i>
                  </div>
                  <div className="selo-value font-weight-bold">{stat.value}</div>
                  <div className="selo-label small">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
