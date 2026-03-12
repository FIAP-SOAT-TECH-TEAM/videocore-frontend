# 🎬 VideoCore Frontend

<div align="center">

Interface web para upload de vídeos e extração de screenshots do ecossistema VideoCore. Desenvolvida como parte do curso de Arquitetura de Software da FIAP (Tech Challenge).

</div>

<div align="center">
  <a href="#visao-geral">Visão Geral</a> •
  <a href="#repositorios">Repositórios</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#estrutura">Estrutura</a> •
  <a href="#terraform">Terraform</a> •
  <a href="#arquitetura">Arquitetura</a> •
  <a href="#dbtecnicos">Débitos Técnicos</a> •
  <a href="#deploy">Fluxo de Deploy</a> •
  <a href="#instalacao">Instalação</a> •
  <a href="#contribuicao">Contribuição</a>
</div><br>

> 📽️ Vídeo de demonstração da arquitetura: [https://youtu.be/k3XbPRxmjCw](https://youtu.be/k3XbPRxmjCw)<br>

---

<h2 id="visao-geral">📋 Visão Geral</h2>

<details>
<summary>Expandir para mais detalhes</summary>

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

</details>

---

<h2 id="repositorios">📁 Repositórios do Ecossistema</h2>

<details>
<summary>Expandir para mais detalhes</summary>

| Repositório | Responsabilidade | Tecnologias |
|-------------|------------------|-------------|
| **videocore-infra** | Infraestrutura base | Terraform, Azure, AWS |
| **videocore-db** | Banco de dados | Terraform, Azure Cosmos DB |
| **videocore-auth** | Microsserviço de autenticação | C#, .NET 9, ASP.NET |
| **videocore-reports** | Microsserviço de relatórios | Java 25, GraalVM, Spring Boot 4, Cosmos DB |
| **videocore-worker** | Microsserviço de processamento de vídeo | Java 25, GraalVM, Spring Boot 4, FFmpeg |
| **videocore-notification** | Microsserviço de notificações | Java 25, GraalVM, Spring Boot 4, SMTP |
| **videocore-frontend** | Interface web do usuário | Next.js 16, React 19, TypeScript |

</details>

---

<h2 id="tecnologias">🔧 Tecnologias</h2>

<details>
<summary>Expandir para mais detalhes</summary>

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

</details>

---

<h2 id="estrutura">📦 Estrutura do Projeto</h2>

<details>
<summary>Expandir para mais detalhes</summary>

```text
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
├── docs/                     # Assets de documentação
└── .github/workflows/
    ├── ci.yaml               # Lint, typecheck, Terraform plan
    └── cd.yaml               # Build + deploy CloudFront
```

</details>

---

<h2 id="terraform">🗄️ Módulos Terraform</h2>

<details>
<summary>Expandir para mais detalhes</summary>

O código `HCL` desenvolvido segue uma estrutura modular:

| Módulo | Descrição |
|--------|-----------|
| **main** | Módulo principal para criação de outputs |

> ⚠️ Os outpus criados são consumidos posteriormente em pipelines via `$GITHUB_OUTPUT` ou `Terraform Remote State`, para compartilhamento de informações. Tornando, desta forma, dinãmico o provisionamento da infraestrutura.

</details>

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

```text
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

```text
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

<h2 id="dbtecnicos">⚠️ Débitos Técnicos</h2>

<details>
<summary>Expandir para mais detalhes</summary>

| Débito | Descrição | Impacto |
|--------|-----------|---------|
| **JWT Cognito** | Implementar a persistência do `Token JWT` retornado pelo `Cognito` em um Cookie `HTTP Only`, ao invés do `Local Storage` | Segurança crítica |
| **Token ANTI-CSRF** | Uma vez que o Cookie `HTTP Only` que armazenará o `Token JWT` do `Cognito` deverá poder ser compartilhado com um domínio diferente da aplicação, implementar o uso de Tokens `ANTI-CSRF` para impedir ataques `CSRF` | Segurança crítica |
| **Observabilidade** | Instrumentar a aplicação para que gere `TraceIds` que possam ser propagados ao backend nas requisições, para que o `New Relic` consiga correlacionar `Frontend` e `Backend` | Clareza no monitoramento |
| **Auth AWS (OIDC)** | Autenticar pipelines utilizando Tokens OIDC ao invés de credenciais estáticas | Segurança e gestão de credenciais |

</details>

---

<h2 id="deploy">⚙️ Fluxo de Deploy</h2>

<details>
<summary>Expandir para mais detalhes</summary>

### Pipeline

1. **Pull Request** → CI: Lint (Biome), Typecheck, Terraform Plan
2. **Revisão e Aprovação** → Mínimo 1 aprovação de CODEOWNER
3. **Merge para Main** → CD: Build estático + Deploy CloudFront

### Autenticação das Pipelines

- **Azure:**
  - **OIDC**: Token emitido pelo GitHub
  - **Azure AD Federation**: Confia no emissor GitHub
  - **Service Principal**: Autentica sem secret
- **AWS**: diretamente via `Access Key` e `Secret Key` (Chaves de acesso)

### Ordem de Provisionamento

```text
1. videocore-infra          (AKS, VNET, APIM, etc)
2. videocore-db             (Cosmos DB)
3. videocore-auth           (Microsserviço de autenticação)
4. videocore-reports        (Microsserviço de relatórios)
5. videocore-worker         (Microsserviço de processamento)
6. videocore-notification   (Microsserviço de notificações)
7. videocore-frontend       (Aplicação SPA Web)
```

### Proteções

- Branch `main` protegida
- Nenhum push direto permitido
- Todos os checks devem passar

</details>

---

<h2 id="instalacao">🚀 Instalação e Uso</h2>

<details>
<summary>Expandir para mais detalhes</summary>

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
```

> ⚠️ Ajuste os arquivos `.env` conforme necessário.

</details>

---

<h2 id="contribuicao">🤝 Contribuição</h2>

<details>
<summary>Expandir para mais detalhes</summary>

### Fluxo de Contribuição

1. Crie uma branch a partir de `main`
2. Implemente suas alterações
3. Execute o lint: `npx biome check`
4. Execute o typecheck: `npx tsc --noEmit`
5. Abra um Pull Request
6. Aguarde aprovação de um CODEOWNER

### Licença

Este projeto está licenciado sob a MIT License.

</details>

---

<div align="center">
  <strong>FIAP - Pós-graduação em Arquitetura de Software</strong><br>
  Hackaton (Tech Challenge 5)
</div>