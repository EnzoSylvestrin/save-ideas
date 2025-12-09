# Setup do Save Ideas App

## Pré-requisitos

1. Node.js e Bun instalados
2. Conta no Convex (https://convex.dev)
3. API Key da OpenAI

## Configuração

### 1. Instalar dependências

```bash
bun install
```

### 2. Configurar Convex

```bash
npx convex dev
```

Isso irá:
- Fazer login no Convex (se necessário)
- Criar um novo projeto ou conectar a um existente
- Gerar os arquivos `_generated` necessários
- Iniciar o servidor de desenvolvimento do Convex

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_CONVEX_URL=sua_url_do_convex_aqui
OPENAI_API_KEY=sua_chave_openai_aqui
```

A URL do Convex será fornecida quando você rodar `npx convex dev`.

### 4. Configurar secrets no Convex

No terminal, após rodar `npx convex dev`, configure o secret da OpenAI:

```bash
npx convex env set OPENAI_API_KEY sua_chave_openai_aqui
```

### 5. Iniciar o app

```bash
bun run start
```

## Estrutura do Projeto

- `convex/` - Backend Convex (queries, mutations, actions)
- `app/` - Telas do app (Expo Router)
- `components/` - Componentes reutilizáveis

## Funcionalidades

- Criar projetos
- Gravar ideias usando áudio
- Transcrição automática com Whisper
- Processamento e estruturação de ideias com GPT-4o-mini
- Visualização de projetos e ideias

