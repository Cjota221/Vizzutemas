# 📋 ESTRUTURA DE WIDGETS E CSS - VIZZUTEMAS

## 🎨 1. CONFIGURAÇÃO DE CORES (ColorConfig)

As cores são definidas no admin e geram **variáveis CSS** automáticas:

```css
/* Variáveis geradas automaticamente */
:root {
  --cor-fundo-pagina: #FFFFFF;
  --cor-detalhes-fundo: #F5F5F5;
  --cor-fundo-barra-superior: #1a1a1a;
  --cor-botoes-cabecalho: #333333;
  --cor-fundo-cabecalho: #FFFFFF;
  --cor-botao-enviar-pedido: #22c55e;
  --cor-demais-botoes: #3b82f6;
  --cor-detalhes-gerais: #333333;
  --cor-fundo-banner-catalogo: #f0f0f0;
  --cor-fundo-menu-desktop: #FFFFFF;
  --cor-fundo-submenu-desktop: #F5F5F5;
  --cor-fundo-menu-mobile: #FFFFFF;
  --cor-fundo-rodape: #1a1a1a;
  
  /* Aliases para compatibilidade */
  --cor-primaria: #22c55e;
  --cor-secundaria: #3b82f6;
  --cor-destaque: #333333;
}
```

---

## 📝 2. CSS POR PÁGINA (ThemeCSS)

CSS customizado por página (home, produto, carrinho):

- **Home** - Estilos da página inicial
- **Produto** - Estilos da página de produto
- **Carrinho** - Estilos do carrinho/checkout

### Exemplo de uso:
```css
/* Na aba CSS > Home */
.produto-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.produto-card:hover {
  transform: translateY(-5px);
}
```

---

## 🧩 3. WIDGETS (ThemeWidget)

Widgets são **blocos HTML auto-contidos** que podem ter:
- HTML
- CSS interno (`<style>`)
- JavaScript (`<script>`)
- Bibliotecas externas (Swiper, Phosphor Icons, etc)

### ✅ ESTRUTURA CORRETA DE UM WIDGET:

```html
<!-- Bibliotecas externas (se necessário) -->
<link href="https://fonts.googleapis.com/css2?family=Lato&display=swap" rel="stylesheet">
<script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>

<!-- CSS do Widget -->
<style>
  /* USE VARIÁVEIS CSS PARA SER DINÂMICO! */
  .meu-widget {
    background: var(--cor-fundo-pagina);
    font-family: 'Lato', sans-serif;
  }
  
  .meu-widget-titulo {
    color: var(--cor-detalhes-gerais);
  }
  
  .meu-widget-botao {
    background: var(--cor-botao-enviar-pedido);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
  }
  
  .meu-widget-botao:hover {
    filter: brightness(1.1);
  }
  
  /* RESPONSIVIDADE */
  @media (max-width: 768px) {
    .meu-widget {
      padding: 10px;
    }
  }
</style>

<!-- HTML do Widget -->
<div class="meu-widget">
  <h2 class="meu-widget-titulo">Título do Widget</h2>
  <button class="meu-widget-botao">Comprar Agora</button>
</div>

<!-- JavaScript (se necessário) -->
<script>
  // Código JavaScript aqui
  document.querySelector('.meu-widget-botao').addEventListener('click', function() {
    alert('Botão clicado!');
  });
</script>
```

---

## 📐 4. LAYOUT (LayoutConfig)

Define a **ordem e visibilidade** das seções na página:

```
1. Banner Principal ✅
2. Banner de Categorias ✅
3. Widgets: CATEGORIAS, BARRA DE VANTAGENS ✅
4. Produtos ✅
5. Avaliações ❌ (desativado)
6. Carrossel Customizado ✅
```

---

## 🔑 VARIÁVEIS CSS DISPONÍVEIS PARA WIDGETS

Use estas variáveis para que os widgets se adaptem às cores do tema:

| Variável | Uso |
|----------|-----|
| `--cor-fundo-pagina` | Fundo principal |
| `--cor-detalhes-fundo` | Fundos secundários (cards) |
| `--cor-fundo-barra-superior` | Barra de promoções/info |
| `--cor-botoes-cabecalho` | Ícones do header |
| `--cor-fundo-cabecalho` | Fundo do header |
| `--cor-botao-enviar-pedido` | Botão principal (CTA) |
| `--cor-demais-botoes` | Botões secundários |
| `--cor-detalhes-gerais` | Textos de destaque |
| `--cor-fundo-rodape` | Fundo do footer |
| `--cor-primaria` | Alias para botão principal |
| `--cor-secundaria` | Alias para botões secundários |
| `--cor-destaque` | Alias para detalhes |

---

## ⚠️ CUIDADOS AO CRIAR WIDGETS

### ❌ EVITE:
- `position: fixed` (pode sair do widget)
- `height: 100vh` (pode cobrir outros widgets)
- `z-index` muito alto (pode sobrepor outros elementos)
- `body, html { ... }` (afeta toda a página)

### ✅ FAÇA:
- Use `position: relative` no container principal
- Use variáveis CSS para cores
- Inclua `@media` queries para responsividade
- Teste no preview mobile e desktop

---

## 📱 RESPONSIVIDADE

Widgets devem funcionar em:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px  
- **Mobile**: até 767px

```css
/* Exemplo de responsividade */
.meu-widget-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .meu-widget-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .meu-widget-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .meu-widget-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 🚀 FLUXO DE TRABALHO

1. **Criar Widget** na aba Widgets
2. **Usar variáveis CSS** para cores dinâmicas
3. **Adicionar ao Layout** na aba Layout
4. **Testar no Preview** (desktop e mobile)
5. **Ajustar CSS** na aba CSS se necessário

