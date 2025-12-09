# 💡 Save Ideas

<div align="center">

![Save Ideas](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Expo](https://img.shields.io/badge/Expo-54.0-black?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?logo=react)

**Um aplicativo mobile para capturar e organizar ideias de projetos usando gravação de áudio e processamento com IA**

[Features](#-features) • [Instalação](#-instalação) • [Uso](#-como-usar) • [Tecnologias](#-tecnologias) • [Contribuindo](#-contribuindo)

</div>

---

## 📖 Sobre o Projeto

**Save Ideas** é um aplicativo mobile desenvolvido com React Native e Expo que permite capturar ideias de projetos de forma rápida e intuitiva através de gravação de áudio. O app utiliza inteligência artificial (OpenAI) para transcrever o áudio e gerar ideias estruturadas automaticamente.

### 🎯 Problema que Resolve

Muitas vezes temos ideias brilhantes, mas não temos tempo ou facilidade para anotá-las. Com **Save Ideas**, você pode:

- 🎤 **Gravar ideias rapidamente** usando apenas sua voz
- 🤖 **Processar automaticamente** com IA para gerar ideias estruturadas
- 📁 **Organizar por projetos** para manter tudo organizado
- ⚡ **Acesso rápido** via atalhos do sistema e comandos de voz

---

## ✨ Features

### 🎙️ Gravação de Áudio
- Gravação de áudio de alta qualidade
- Interface intuitiva com feedback visual
- Processamento automático após gravação

### 🤖 Processamento com IA
- **Transcrição automática** usando OpenAI Whisper
- **Geração de ideias estruturadas** com GPT-4o-mini
- Formatação automática em markdown
- Títulos gerados automaticamente

### 📁 Organização
- Criação de múltiplos projetos
- Visualização de todas as ideias por projeto
- Cards visuais com preview das ideias
- Detalhes completos ao tocar em uma ideia

### ⚡ Acesso Rápido
- **Android App Shortcuts** - Atalho direto no ícone do app
- **Deep Linking** - Acesso via URLs customizadas
- **Quick Record** - Gravação rápida sem abrir o app completo
- **Seletor de Projeto** - Troca rápida de projeto na tela de gravação

### 🎨 Interface Moderna
- Design limpo e moderno
- Suporte a Dark Mode automático
- Animações suaves
- Skeleton loading para melhor UX

---

## 🚀 Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Bun](https://bun.sh/) (gerenciador de pacotes recomendado) ou npm/yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Conta no [Convex](https://www.convex.dev/) (backend)
- API Key da [OpenAI](https://platform.openai.com/) (para processamento de áudio)

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/save-ideas.git
cd save-ideas
```

2. **Instale as dependências**

```bash
bun install
# ou
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_CONVEX_URL=sua_url_do_convex
OPENAI_API_KEY=sua_chave_da_openai
EAS_PROJECT_ID=seu_eas_project_id
```

> ⚠️ **Importante**: O arquivo `.env` já está no `.gitignore` e não será commitado. Nunca commite suas chaves de API!

4. **Configure o Convex**

```bash
# Instale o Convex CLI globalmente (se ainda não tiver)
npm install -g convex

# Faça login no Convex
npx convex dev

# Isso irá:
# - Criar a configuração do Convex
# - Gerar os tipos TypeScript
# - Iniciar o servidor de desenvolvimento
```

5. **Configure as funções do Convex**

As funções do backend estão em `convex/`:
- `schema.ts` - Schema do banco de dados
- `projects.ts` - CRUD de projetos
- `ideas.ts` - CRUD de ideias e processamento de áudio

Certifique-se de configurar a variável de ambiente `OPENAI_API_KEY` no dashboard do Convex também.

> 💡 **Dica**: Você pode copiar o arquivo `.env.example` para `.env` e preencher com suas credenciais:
> ```bash
> cp .env.example .env
> ```

6. **Inicie o app**

```bash
# Desenvolvimento
bun start
# ou
npm start

# Para Android
bun run android
# ou
npm run android

# Para iOS
bun run ios
# ou
npm run ios
```

---

## 📱 Como Usar

### 1. Criar um Projeto

1. Abra o app
2. Na tela inicial, toque no botão **"+"** no canto superior direito
3. Digite o nome do projeto
4. Toque em **"Criar"**

### 2. Gravar uma Ideia

#### Método 1: Dentro do Projeto
1. Abra um projeto
2. Toque no botão **"+"** ou **"Adicionar Ideia"**
3. Toque no botão de gravação (ícone de microfone)
4. Fale sua ideia
5. Toque novamente para parar
6. Aguarde o processamento automático

#### Método 2: Quick Record (Gravação Rápida)
1. **Android**: Segure o ícone do app e toque em **"Gravar Ideia"**
2. Ou use o botão flutuante na tela inicial
3. A gravação será salva no último projeto usado

### 3. Visualizar Ideias

1. Abra um projeto
2. Veja a lista de todas as ideias
3. Toque em uma ideia para ver os detalhes completos:
   - Transcrição original
   - Ideias estruturadas geradas pela IA
   - Data de criação

### 4. Trocar de Projeto (Quick Record)

1. Na tela de gravação rápida
2. Toque no nome do projeto (se houver múltiplos projetos)
3. Selecione o projeto desejado
4. Grave sua ideia

---

## 🛠️ Tecnologias

### Frontend
- **[Expo](https://expo.dev/)** - Framework React Native
- **[React Native](https://reactnative.dev/)** - Framework mobile
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - Roteamento baseado em arquivos
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[React Navigation](https://reactnavigation.org/)** - Navegação

### Backend
- **[Convex](https://www.convex.dev/)** - Backend-as-a-Service
  - Banco de dados real-time
  - Funções serverless
  - Autenticação (futuro)

### IA e Processamento
- **[OpenAI API](https://platform.openai.com/)**
  - **Whisper** - Transcrição de áudio para texto
  - **GPT-4o-mini** - Geração de ideias estruturadas

### Áudio
- **[expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/)** - Gravação e reprodução de áudio

### Armazenamento Local
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Armazenamento local (último projeto usado)

### Outras
- **[expo-linking](https://docs.expo.dev/versions/latest/sdk/linking/)** - Deep linking
- **[React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)** - Safe areas
- **[Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)** - Configuração nativa customizada

---

## 📁 Estrutura do Projeto

```
save-ideas/
├── app/                    # Rotas do Expo Router
│   ├── (tabs)/            # Telas com tabs
│   │   ├── index.tsx      # Tela inicial (lista de projetos)
│   │   └── explore.tsx    # Detalhes do projeto (lista de ideias)
│   ├── quick-record.tsx   # Tela de gravação rápida
│   ├── idea-detail.tsx    # Detalhes de uma ideia
│   └── _layout.tsx        # Layout raiz
├── components/            # Componentes reutilizáveis
│   ├── AudioRecorder.tsx  # Componente de gravação
│   ├── ProjectCard.tsx    # Card de projeto
│   ├── IdeaCard.tsx       # Card de ideia
│   ├── QuickRecordModal.tsx
│   └── ui/                # Componentes UI base
├── convex/                # Backend (Convex)
│   ├── schema.ts          # Schema do banco
│   ├── projects.ts        # Funções de projetos
│   └── ideas.ts           # Funções de ideias + IA
├── constants/             # Constantes
│   └── theme.ts           # Cores e tema
├── hooks/                 # Custom hooks
├── plugins/               # Expo Config Plugins
│   └── withAndroidShortcuts.js
├── scripts/               # Scripts e documentação
├── utils/                 # Utilitários
│   ├── storage.ts         # AsyncStorage helpers
│   └── quick-access.ts    # Deep linking helpers
└── app.json               # Configuração do Expo
```

---

## 🔧 Configuração Avançada

### Android App Shortcuts

O app inclui um plugin customizado que configura automaticamente os App Shortcuts do Android. Veja mais em [`scripts/android-shortcuts-setup.md`](scripts/android-shortcuts-setup.md).

### Deep Linking

O app suporta deep linking para acesso rápido:

- `saveideas://quick-record` - Abre a tela de gravação rápida
- `saveideas://quick-record?projectId=xxx` - Abre gravação para projeto específico

### Integração com Assistente de Voz

Para configurar comandos de voz com Google Assistant/Gemini, veja [`scripts/setup-gemini-assistant.md`](scripts/setup-gemini-assistant.md).

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. 🍴 Fazer um Fork do projeto
2. 🌿 Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push para a branch (`git push origin feature/AmazingFeature`)
5. 🔀 Abrir um Pull Request

### Diretrizes de Contribuição

- Siga os padrões de código existentes
- Adicione testes quando apropriado
- Atualize a documentação se necessário
- Use commits descritivos

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- [Expo](https://expo.dev/) pela plataforma incrível
- [Convex](https://www.convex.dev/) pelo backend poderoso
- [OpenAI](https://openai.com/) pela API de IA
- Todos os contribuidores e usuários do projeto

---

## 📞 Suporte

- 🐛 **Reportar bugs**: [GitHub Issues](https://github.com/seu-usuario/save-ideas/issues)
- 💡 **Sugerir features**: [GitHub Discussions](https://github.com/seu-usuario/save-ideas/discussions)

---

<div align="center">

**Feito com ❤️ usando Expo e React Native**

⭐ Se este projeto foi útil para você, considere dar uma estrela!

</div>
