# Vizzutemas

SaaS para venda de temas CSS para e-commerce.

## 🚀 Funcionalidades

### Área Pública
- **Vitrine de Temas**: Galeria de temas publicados com nome, descrição, thumbnail e preço
- **Página de Detalhes**: Informações completas do tema com botões para demo e compra
- **Preview/Demo**: Visualização do tema aplicado em um "site teste" que simula a estrutura de um e-commerce
- **Checkout**: Formulário simples para solicitar a compra do tema

### Área Administrativa
- **Listar Temas**: Tabela com todos os temas cadastrados
- **Criar/Editar Temas**: Formulário com nome, slug, descrição, preço, thumbnail e status
- **Editar CSS**: Abas para editar CSS separado por tipo de página (Home, Produto, Carrinho)
- **Gerenciar Pedidos**: Lista de pedidos com atualização de status

## 🛠️ Tecnologias

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + API + Storage)
- **Deploy**: Netlify

## 📦 Instalação

### 1. Clone o projeto

```bash
git clone <repo-url>
cd Vizzutemas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o script `supabase/migrations/001_initial.sql`
4. Vá em **Settings > API** e copie a URL e a Anon Key

### 4. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
Vizzutemas/
├── src/
│   ├── components/
│   │   ├── ThemeCard.tsx        # Card de tema na vitrine
│   │   └── PlatformMockLayout.tsx # Carcaça do "site teste"
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Cliente Supabase
│   │   │   ├── themes.ts        # Funções de temas
│   │   │   └── orders.ts        # Funções de pedidos
│   │   └── types.ts             # Tipos TypeScript
│   ├── pages/
│   │   ├── index.tsx            # Landing page
│   │   ├── themes/
│   │   │   ├── index.tsx        # Vitrine de temas
│   │   │   └── [slug].tsx       # Detalhes do tema
│   │   ├── preview/
│   │   │   └── [slug].tsx       # Demo/Preview do tema
│   │   ├── checkout/
│   │   │   ├── [slug].tsx       # Formulário de checkout
│   │   │   └── success.tsx      # Confirmação de pedido
│   │   ├── admin/
│   │   │   ├── themes/
│   │   │   │   ├── index.tsx    # Lista de temas (admin)
│   │   │   │   ├── new.tsx      # Novo tema
│   │   │   │   └── [id].tsx     # Editar tema
│   │   │   └── orders/
│   │   │       └── index.tsx    # Lista de pedidos
│   │   └── api/
│   │       └── orders.ts        # API de pedidos
│   └── styles/
│       └── globals.css          # Estilos globais + Tailwind
├── supabase/
│   └── migrations/
│       └── 001_initial.sql      # Schema do banco
├── .env.example                 # Exemplo de variáveis
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
├── netlify.toml                 # Config Netlify
└── package.json
```

## 🗄️ Modelo de Dados

### themes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| name | VARCHAR(255) | Nome do tema |
| slug | VARCHAR(255) | URL amigável (único) |
| description | TEXT | Descrição do tema |
| price | DECIMAL(10,2) | Preço em reais |
| thumbnail_url | TEXT | URL da imagem de preview |
| status | VARCHAR(20) | draft, published, archived |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

### theme_css
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| theme_id | UUID | FK para themes |
| page_type | VARCHAR(50) | home, product, cart |
| css_code | TEXT | Código CSS |

### orders
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| theme_id | UUID | FK para themes |
| customer_name | VARCHAR(255) | Nome do cliente |
| customer_email | VARCHAR(255) | E-mail do cliente |
| notes | TEXT | Observações |
| status | VARCHAR(20) | pending, paid, cancelled, delivered |

## 🌐 Deploy no Netlify

1. Faça push do projeto para o GitHub
2. Acesse [netlify.com](https://netlify.com) e conecte o repositório
3. Configure as variáveis de ambiente (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Deploy! O arquivo `netlify.toml` já contém as configurações necessárias

## 🎨 Personalizando o "Site Teste"

O componente `PlatformMockLayout.tsx` define a estrutura do e-commerce fictício usado para preview. Ele possui IDs específicos que podem ser estilizados via CSS:

- `#store-header` - Cabeçalho
- `#store-logo` - Logo
- `#store-menu` - Menu de navegação
- `#store-banner` - Banner principal
- `#store-products` - Grid de produtos
- `.product-card` - Card de produto individual
- `#store-footer` - Rodapé

## 📝 Licença

MIT
