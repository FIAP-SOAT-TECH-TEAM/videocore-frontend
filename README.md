# 🎬 VideoCore Frontend

<div align="center">

Interface web para upload de vídeos e extração de screenshots do ecossistema VideoCore. Desenvolvida como parte do curso de Arquitetura de Software da FIAP (Tech Challenge).

</div>

<div align="center">
  <a href="#visao-geral">Visão Geral</a> •
  <a href="#arquitetura">Arquitetura</a> •
  <a href="#repositorios">Repositórios</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#instalacao">Instalação</a> •
  <a href="#deploy">Fluxo de Deploy</a> •
  <a href="#contribuicao">Contribuição</a>
</div><br>

---

<h2 id="visao-geral">📋 Visão Geral</h2>

O **VideoCore Frontend** é uma aplicação **Next.js** (Static Export) que permite aos usuários fazer upload de vídeos, acompanhar o processamento em tempo real via WebSocket e baixar os screenshots extraídos.

### Funcionalidades Principais

- **Autenticação**: Cadastro e login via AWS Cognito (e-mail + OTP)
- **Upload de Vídeos**: Interface de upload com geração de SAS URL
- **Dashboard**: Visualização de relatórios com estatísticas em tempo real
- **WebSocket**: Atualizações de status em tempo real via STOMP
- **Download**: Download de screenshots processados via SAS URL
- **Tema**: Suporte a modo claro/escuro

### Fluxo do Usuário

1. **Cadastro/Login** via AWS Cognito
2. **Upload** do vídeo para Azure Blob Storage (SAS URL)
3. **Acompanhamento** do processamento via WebSocket (STOMP)
4. **Visualização** dos screenshots extraídos no dashboard
5. **Download** dos arquivos processados

---

<h2 id="arquitetura">🧱 Arquitetura</h2>

<details>
<summary>Expandir para mais detalhes</summary>

### 🎯 Padrões e Decisões Arquiteturais

- **Static Export**: Build estático para deploy em Azure Static Website
- **Trailing Slash**: Compatibilidade com Azure Static Website routing
- **Client-Side Rendering**: Toda renderização ocorre no navegador
- **State Management**: Zustand com persistência para dados de autenticação

### 🔐 Autenticação

```
Usuário → Cognito (Sign Up / Sign In)
              ↓
         AWS Amplify (Session)
              ↓
         Bearer Token → API (APIM)
              ↓
         Auth-Subject Header (Dev mode)
```

- **AWS Cognito**: User Pool para gerenciamento de identidade
- **AWS Amplify**: SDK para integração com Cognito
- **Zustand**: Persistência de sessão no client-side

### 🔄 Comunicação em Tempo Real

```
Frontend ←→ STOMP (WebSocket) ←→ Reports Service
              ↓
         /topic (subscribe)
              ↓
         ReportPayload (status updates)
```

### 🌐 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/latest` | Relatórios mais recentes do usuário |
| `GET` | `/{reportId}` | Relatório específico por ID |
| `GET` | `/video/download/url` | SAS URL para download de imagens |
| `GET` | `/video/upload/url` | SAS URL para upload de vídeo |

### 📦 Estrutura do Projeto

```
videocore-frontend/
├── frontend/
│   ├── package.json          # Dependências (Next.js 16, React 19)
│   ├── next.config.ts        # Static export, trailing slash
│   ├── biome.json            # Linting e formatação
│   ├── tsconfig.json         # Configuração TypeScript
│   └── src/
│       ├── env.ts            # Validação de variáveis (T3 Env)
│       ├── app/
│       │   ├── layout.tsx    # Root layout com providers
│       │   ├── page.tsx      # Redirect para /dashboard
│       │   ├── auth/         # Páginas de login e registro
│       │   └── dashboard/    # Dashboard, upload, vídeos
│       ├── components/
│       │   ├── app-initializer.tsx   # Inicialização de auth
│       │   ├── auth-guard.tsx        # Proteção de rotas autenticadas
│       │   ├── guest-guard.tsx       # Proteção de rotas públicas
│       │   ├── upload-modal.tsx      # Modal de upload de vídeo
│       │   └── ui/                   # Componentes shadcn/ui
│       ├── hooks/
│       │   └── use-report-websocket.ts  # Hook WebSocket STOMP
│       ├── stores/
│       │   ├── auth.store.ts     # Estado de autenticação (Zustand)
│       │   └── reports.store.ts  # Estado de relatórios
│       ├── lib/
│       │   ├── api.ts        # Chamadas REST + SAS URL
│       │   ├── cognito.ts    # Integração AWS Amplify
│       │   └── websocket.ts  # Cliente WebSocket
│       └── types/
│           └── index.ts      # Tipos (Report, User, ProcessStatus)
├── terraform/
│   ├── backend.tf            # Estado remoto
│   ├── datasource.tf         # Data sources
│   ├── variables.tf          # Variáveis
│   └── outputs.tf            # Outputs (CDN URL)
└── .github/workflows/
    ├── ci.yaml               # Lint, typecheck, Terraform plan
    └── cd.yaml               # Build + deploy CloudFront
```

### 📊 Stores (Zustand)

| Store | Responsabilidade |
|-------|------------------|
| **useAuthStore** | Login/logout, sessão Cognito, refresh, hydration |
| **useReportsStore** | Fetch relatórios, WebSocket updates, estatísticas |

### 🔄 Status de Processamento

| Status | Descrição |
|--------|-----------|
| `STARTED` | Upload recebido, processamento iniciado |
| `PROCESSING` | Extração de frames em andamento |
| `COMPLETED` | Screenshots prontos para download |
| `FAILED` | Erro no processamento |

</details>

---

<h2 id="repositorios">📁 Repositórios do Ecossistema</h2>

| Repositório | Responsabilidade | Tecnologias |
|-------------|------------------|-------------|
| **videocore-infra** | Infraestrutura base (AKS, VNET, APIM, Key Vault) | Terraform, Azure, AWS |
| **videocore-db** | Banco de dados | Terraform, Azure Cosmos DB |
| **videocore-frontend** | Interface web (este repositório) | Next.js 16, React 19, TypeScript |
| **videocore-reports** | Microsserviço de relatórios | Java 25, Spring Boot 4, Cosmos DB |
| **videocore-worker** | Microsserviço de processamento de vídeo | Java 25, Spring Boot 4, FFmpeg |
| **videocore-observability** | Stack de observabilidade | OpenTelemetry, Jaeger, Prometheus, Grafana |

---

<h2 id="tecnologias">🔧 Tecnologias</h2>

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 16.1.1 |
| **UI** | React 19.2.3 |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS v4, shadcn/ui |
| **Autenticação** | AWS Amplify, AWS Cognito |
| **Estado** | Zustand |
| **WebSocket** | @stomp/stompjs |
| **Formulários** | React Hook Form, Zod |
| **Tabelas** | TanStack React Table |
| **Linting** | Biome |
| **Deploy** | Azure Static Website, CloudFront CDN |
| **IaC** | Terraform |
| **CI/CD** | GitHub Actions |

---

<h2 id="instalacao">🚀 Instalação e Uso</h2>

### Variáveis de Ambiente

```bash
NEXT_PUBLIC_BASE_API_URL=         # URL base da API (HTTP/HTTPS)
NEXT_PUBLIC_BASE_WS_URL=          # URL base do WebSocket (WS/WSS)
NEXT_PUBLIC_COGNITO_USER_POOL_ID= # AWS Cognito User Pool ID
NEXT_PUBLIC_COGNITO_CLIENT_ID=    # Cognito App Client ID
NEXT_PUBLIC_COGNITO_REGION=       # Região AWS (default: us-east-1)
NEXT_PUBLIC_COGNITO_ENDPOINT=     # Endpoint local do Cognito (opcional)
NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY= # Chave de assinatura do APIM (opcional)
```

### Desenvolvimento Local

```bash
# Clonar repositório
git clone https://github.com/FIAP-SOAT-TECH-TEAM/videocore-frontend.git
cd videocore-frontend/frontend

# Configurar variáveis de ambiente
cp env-example .env

# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build estático
npm run build

# Lint
npm run lint
```

---

<h2 id="deploy">⚙️ Fluxo de Deploy</h2>

<details>
<summary>Expandir para mais detalhes</summary>

### Pipeline CI

1. **Terraform**: Format, validate e plan
2. **Lint**: Verificação com Biome
3. **TypeScript**: Type checking

### Pipeline CD

1. **Build**: `npm run build` (static export)
2. **Upload**: Artefatos para Azure Storage Account
3. **CDN**: Distribuição via CloudFront

### Proteções

- Branch `main` protegida
- Nenhum push direto permitido
- Todos os checks devem passar

### Ordem de Provisionamento

```
1. videocore-infra          (AKS, VNET, APIM, Key Vault)
2. videocore-db             (Cosmos DB)
3. videocore-observability  (Jaeger, Prometheus, Grafana)
4. videocore-reports        (Microsserviço de relatórios)
5. videocore-worker         (Microsserviço de processamento)
6. videocore-frontend       (Interface web - este repositório)
```

</details>

---

<h2 id="contribuicao">🤝 Contribuição</h2>

### Fluxo de Contribuição

1. Crie uma branch a partir de `main`
2. Implemente suas alterações
3. Execute o lint: `npm run lint`
4. Abra um Pull Request
5. Aguarde aprovação de um CODEOWNER

### Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

<div align="center">
  <strong>FIAP - Pós-graduação em Arquitetura de Software</strong><br>
  Tech Challenge
</div>
