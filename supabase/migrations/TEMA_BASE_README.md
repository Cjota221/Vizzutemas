# Tema Base - Vizzutemas

## 📋 Descrição

O **Tema Base** é o tema padrão da plataforma Vizzutemas. Ele fornece um design moderno, limpo e profissional que serve como ponto de partida para personalizações.

## 🎨 Características do Design

### Paleta de Cores
- **Primary**: `#667eea` (Roxo vibrante)
- **Secondary**: `#764ba2` (Roxo escuro)
- **Gradiente**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Texto**: `#1f2937` (Cinza escuro)
- **Fundo**: `#f9fafb` (Cinza claro)

### Estilo Visual
- Design clean e profissional
- Gradientes suaves no header e banner
- Cards com sombras e efeitos hover
- Transições suaves (0.3s ease)
- Bordas arredondadas (8px - 12px)
- Espaçamento generoso e respirável

## 📄 Páginas Estilizadas

### 1. Home Page
- **Header**: Gradiente roxo com logo branca
- **Menu**: Links brancos com efeito hover
- **Banner**: Grande destaque com gradiente e texto branco
- **Categorias**: Barra horizontal com hover suave
- **Produtos**: Grid responsivo com cards hover
- **Avaliações**: Cards com estrelas e depoimentos
- **Info da Loja**: Seção destaque com features
- **Footer**: Fundo escuro com links roxos

### 2. Product Page (Detalhes)
- Layout em 2 colunas (galeria + info)
- Galeria de imagens sticky
- Preço em destaque grande
- Avaliações com estrelas
- Descrição em card destacado
- Opções de seleção (tamanho, cor, quantidade)
- Botões de ação (Adicionar ao carrinho, Favoritar)
- Lista de características com checkmarks
- Responsivo para mobile

### 3. Cart Page (Carrinho)
- Layout em 2 colunas (itens + resumo)
- Cards de produtos com imagem, info e quantidade
- Controles de quantidade (+/-)
- Botão de remover item
- Resumo lateral sticky com totais
- Campo de cupom de desconto
- Botão de finalizar compra destacado
- Estado de carrinho vazio
- Responsivo para mobile

## 🚀 Como Usar

### 1. Executar a Migration

Vá ao **SQL Editor** do Supabase e execute o arquivo:
```
supabase/migrations/002_base_theme.sql
```

Isso irá:
- Criar o tema "Tema Base" no banco
- Inserir todo o CSS para as 3 páginas
- Deixar o tema publicado automaticamente

### 2. Visualizar o Tema

Acesse:
- **Galeria**: `http://localhost:3000/themes`
- **Preview**: `http://localhost:3000/preview/tema-base`

### 3. Personalizar

No admin, você pode:
1. Ir em `/admin/themes`
2. Clicar em "Editar" no Tema Base
3. Modificar o CSS de cada página
4. Salvar e visualizar as mudanças

## 🎯 Elementos Estilizáveis

### IDs Principais
```css
#store-header      /* Cabeçalho */
#store-logo        /* Logo */
#store-menu        /* Menu de navegação */
#store-banner      /* Banner principal */
#store-categories  /* Barra de categorias */
#store-products    /* Seção de produtos */
#store-reviews     /* Seção de avaliações */
#store-info        /* Informações da loja */
#store-footer      /* Rodapé */
```

### Classes Principais
```css
.product-card      /* Card de produto */
.product-detail    /* Página de detalhes */
.product-gallery   /* Galeria de imagens */
.product-info      /* Informações do produto */
.cart-container    /* Container do carrinho */
.cart-items        /* Lista de itens */
.cart-summary      /* Resumo do pedido */
```

## 💡 Dicas de Personalização

### Mudar as Cores
Substitua todas as ocorrências de:
- `#667eea` → Sua cor primária
- `#764ba2` → Sua cor secundária
- Ajuste o gradiente conforme desejado

### Mudar a Tipografia
```css
/* Adicione no topo do CSS */
@import url('https://fonts.googleapis.com/css2?family=Sua+Fonte&display=swap');

body, #store-header, .product-card {
  font-family: 'Sua Fonte', sans-serif;
}
```

### Adicionar Animações
```css
.product-card {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Mudar o Layout
```css
/* Grid de 4 colunas em vez de 3 */
#store-products .grid {
  grid-template-columns: repeat(4, 1fr);
}
```

## 📱 Responsividade

O tema é totalmente responsivo com breakpoints em:
- **Mobile**: < 640px
- **Tablet**: < 768px  
- **Desktop**: > 968px

Todos os elementos se adaptam automaticamente.

## 🔧 Troubleshooting

### Tema não aparece na galeria
- Verifique se o status está como 'published'
- Rode a query: `SELECT * FROM themes WHERE slug = 'tema-base'`

### CSS não está sendo aplicado
- Verifique se os 3 registros foram criados em theme_css
- Rode: `SELECT * FROM theme_css WHERE theme_id = (SELECT id FROM themes WHERE slug = 'tema-base')`

### Erro ao executar a migration
- Certifique-se que a migration 001_initial.sql foi executada antes
- Verifique se não há conflito de slug

## 📝 Licença

Este tema é parte do projeto Vizzutemas e está disponível gratuitamente.
