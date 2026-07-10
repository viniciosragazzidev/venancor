# Diretrizes de Código: Split do Projeto Venancor

Este documento orienta o processo de divisão segura do repositório em duas aplicações Next.js independentes.

---

## 🛠️ Passo Inicial: Duplicação do Repositório

Antes de apagar qualquer arquivo, duplique a pasta atual do projeto para um novo diretório (ex: `/Projects/venancor-crm`).
* O diretório original (`/Projects/venancor`) será a **Aplicação 1: Landing Page**.
* O novo diretório (`/Projects/venancor-crm`) será a **Aplicação 2: CRM SaaS**.

---

## 🚀 Aplicação 1: Landing Page (Venancor)

No diretório original (`/Projects/venancor`):

### 1. Limpeza do CRM
Delete completamente a pasta `/app/crm` para remover todas as rotas administrativas e painéis.

### 2. Configurações de Ambiente (`.env.local`)
Adicione as seguintes chaves no seu arquivo de variáveis de ambiente:
```env
NEXT_PUBLIC_CRM_API_URL="https://api.meucrm.com.br" # Em produção ou http://localhost:3001 em desenvolvimento
NEXT_PUBLIC_CRM_TOKEN="afed418c-1e4b-4172-b472-5b69e9171f98" # Token secreto cadastrado no CRM
```

---

## 🚀 Aplicação 2: CRM SaaS Independente

No diretório duplicado (`/Projects/venancor-crm`):

### 1. Limpeza do Frontend Institucional
Delete a rota raiz da Landing Page (`app/page.tsx`) e a rota do simulador Amep (`app/amep/`).

### 2. Promover Rotas do CRM para a Raiz
Mova todos os arquivos de `app/crm/*` diretamente para `app/`.
* Exemplo: `app/crm/resume/page.tsx` passará a ser `app/resume/page.tsx`.
* Exemplo: `app/crm/login/page.tsx` passará a ser `app/login/page.tsx`.
* Ajuste as importações relativas (`@/...`) e redirecionamentos no Next.js middleware ou proxy.

### 3. Nova Home (`/`) do CRM
Crie um arquivo `app/page.tsx` para ser a Landing Page de vendas do próprio CRM. Você pode construir uma página moderna apresentando as funcionalidades do sistema para outros corretores.

### 4. Configurações de Ambiente (`.env`)
Garanta que a conexão com o banco de dados Neon continue ativa:
```env
DATABASE_URL="postgresql://neondb_owner:npg_IkK4XACPgQa7@ep-soft-wave-aidiaykq.c-4.us-east-1.aws.neon.tech/neondb?sslmode=verify-full"
BETTER_AUTH_SECRET="fbcbe4031ea0a62372d8a07ccca2695c02934dfc01bc954fa0fbfba3a2db8bc5"
BETTER_AUTH_URL="https://api.meucrm.com.br" # URL do novo CRM
WEBHOOK_SECRET_TOKEN="afed418c-1e4b-4172-b472-5b69e9171f98"
```
