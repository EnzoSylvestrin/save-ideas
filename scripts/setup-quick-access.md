# Configuração de Acesso Rápido - Gravar Ideias

Este guia mostra como configurar atalhos e comandos de voz para gravar ideias rapidamente, mesmo com o app fechado.

## 1. Deep Link - Acesso Direto

O app já está configurado para aceitar deep links. Use:

**URL Scheme:**
```
saveideas://quick-record
```

### Como usar:

#### Android:
1. Crie um atalho na tela inicial usando um app como "Shortcut Maker" ou "Activity Launcher"
2. Configure a atividade: `com.evalla.saveideas/.MainActivity`
3. Adicione o intent: `saveideas://quick-record`
4. Adicione o atalho à tela inicial

#### iOS:
1. Abra o app "Atalhos" (Shortcuts)
2. Crie um novo atalho
3. Adicione ação "Abrir URLs"
4. Digite: `saveideas://quick-record`
5. Adicione à tela inicial ou configure com Siri

## 2. Comandos de Voz

### iOS - Siri Shortcuts:

1. Abra o app "Atalhos"
2. Crie um novo atalho
3. Adicione ação "Abrir URLs"
4. URL: `saveideas://quick-record`
5. Toque em "Adicionar à Siri"
6. Grave o comando de voz (ex: "Gravar ideia", "Nova ideia", "Salvar ideia")
7. Agora você pode dizer: "Ei Siri, [seu comando]"

### Android - Google Assistant:

1. Abra o Google Assistant
2. Diga "Configurar rotina" ou abra o app Google Assistant
3. Crie uma nova rotina
4. Configure o comando de voz (ex: "Gravar ideia")
5. Adicione ação "Abrir app" → Selecione "Save Ideas"
6. Ou use "Executar atalho" com o deep link: `saveideas://quick-record`

**Alternativa mais simples:**
- Use um app como "Tasker" ou "Automate" para criar um atalho que abre o deep link
- Configure o Google Assistant para executar essa tarefa

## 3. Widgets e Atalhos na Tela Inicial

### Android - App Shortcuts:

1. Segure o ícone do app na tela inicial
2. Se aparecer "Gravar Ideia Rápida", toque nele
3. Se não aparecer, você pode criar manualmente usando apps como:
   - "Shortcut Maker"
   - "Activity Launcher"
   - "Nova Launcher" (com suporte a atalhos)

### iOS - Widgets:

1. Toque e segure na tela inicial
2. Toque no "+" no canto superior
3. Procure por "Atalhos"
4. Adicione o widget do atalho que você criou
5. Configure para abrir `saveideas://quick-record`

## 4. Notificação Persistente (Futuro)

Uma notificação persistente com botão de ação rápida pode ser implementada no futuro para acesso ainda mais rápido.

## 5. Testando o Deep Link

### Android:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "saveideas://quick-record" com.evalla.saveideas
```

### iOS (Simulador):
```bash
xcrun simctl openurl booted "saveideas://quick-record"
```

## Dicas:

- **Configure múltiplos atalhos**: Crie atalhos diferentes para diferentes projetos
- **Use comandos de voz simples**: "Ideia", "Gravar", "Nova ideia"
- **Adicione à tela de bloqueio**: Alguns launchers permitem atalhos na tela de bloqueio
- **Use widgets**: Widgets são mais visíveis e acessíveis que atalhos

## Troubleshooting:

- Se o deep link não funcionar, verifique se o app está instalado
- No iOS, pode ser necessário permitir o app nos "Atalhos"
- No Android, verifique se o intent filter está configurado corretamente

