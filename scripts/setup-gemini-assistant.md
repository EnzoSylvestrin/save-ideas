# Configurar Gemini/Google Assistant para Gravar Ideias

Este guia mostra como configurar o Gemini (assistente do Google) no Android para gravar ideias rapidamente usando comandos de voz.

## Deep Link do App

O app aceita os seguintes deep links:

### URL Scheme Principal:
```
saveideas://quick-record
```

### Com parâmetro opcional (projectId):
```
saveideas://quick-record?projectId=SEU_PROJECT_ID
```

### URL HTTPS (também funciona):
```
https://saveideas.app/quick-record
https://saveideas.app/quick-record?projectId=SEU_PROJECT_ID
```

**Nota**: O Gemini/Google Assistant pode usar qualquer um desses formatos. O mais simples é `saveideas://quick-record`.

## App Shortcuts (Ações Rápidas) - JÁ CONFIGURADO! ✅

O app já está configurado com **App Shortcuts**! Quando você **segurar o ícone do app** na tela inicial do Android, aparecerá a opção **"Gravar Ideia"** que abre diretamente a tela de gravação rápida.

**Como usar:**
1. Segure o ícone do app "Save Ideas" na tela inicial
2. Aparecerá o atalho **"Gravar Ideia"**
3. Toque nele para abrir diretamente a gravação

**Nota:** Após reinstalar o app, os shortcuts aparecerão automaticamente.

## Configuração no Gemini/Google Assistant

### Método 1: Usando Rotinas do Google Assistant

1. **Abra o app Google** no seu Android
2. Toque no seu **perfil** (canto superior direito)
3. Vá em **Configurações** → **Rotinas** (ou **Routines**)
4. Toque em **Adicionar rotina** (ou **Add routine**)
5. Configure:
   - **Quando digo**: "Gravar ideia" (ou qualquer comando que você preferir)
   - **Adicionar ação** → **Abrir app** → Selecione "Save Ideas"
   - Ou use: **Executar atalho** → **Abrir URL** → `saveideas://quick-record`

### Método 2: Usando Atalhos do Google Assistant

1. Abra o **Google Assistant** (diga "Ok Google" ou segure o botão home)
2. Diga: **"Configurar atalho"** ou **"Abrir configurações de atalhos"**
3. Toque em **Adicionar atalho**
4. Configure:
   - **Frase de ativação**: "Gravar ideia" (ou "Nova ideia", "Salvar ideia", etc.)
   - **Ação**: 
     - Escolha **"Abrir app"** → "Save Ideas"
     - Ou **"Abrir URL"** → `saveideas://quick-record`

### Método 3: Usando o App "Atalhos" do Google

1. Instale o app **"Atalhos"** (Google Shortcuts) se não tiver
2. Abra o app **Atalhos**
3. Toque em **Criar atalho**
4. Configure:
   - **Nome**: "Gravar Ideia"
   - **Ação**: **Abrir URL**
   - **URL**: `saveideas://quick-record`
5. Toque em **Salvar**
6. Agora você pode:
   - Adicionar à tela inicial
   - Associar a um comando de voz no Google Assistant

## Comandos de Voz Sugeridos

Você pode criar múltiplos comandos para diferentes situações:

- "Gravar ideia"
- "Nova ideia"
- "Salvar ideia"
- "Ideia rápida"
- "Gravar para [nome do projeto]" (se configurar com projectId específico)

## Testando o Deep Link

### Via ADB (Android Debug Bridge):

```bash
adb shell am start -W -a android.intent.action.VIEW -d "saveideas://quick-record" com.evalla.saveideas
```

### Via Terminal do Android:

```bash
am start -a android.intent.action.VIEW -d "saveideas://quick-record" com.evalla.saveideas
```

## Parâmetros Opcionais

Se você quiser gravar diretamente em um projeto específico, use:

```
saveideas://quick-record?projectId=SEU_PROJECT_ID_AQUI
```

Para descobrir o ID do projeto:
1. Abra o app
2. Entre no projeto desejado
3. O ID aparece na URL ou você pode inspecionar o código

## Troubleshooting

### O comando não funciona:
- Verifique se o app está instalado
- Certifique-se de que o comando está configurado corretamente no Google Assistant
- Teste o deep link manualmente primeiro usando ADB

### O app não abre:
- Verifique se o intent filter está configurado no `app.json`
- Reinstale o app após mudanças no `app.json`
- Verifique se o package name está correto: `com.evalla.saveideas`

### O Gemini não reconhece o comando:
- Fale claramente e pausadamente
- Use comandos simples e diretos
- Treine o comando algumas vezes
- Verifique se o Google Assistant está atualizado

## Dicas Avançadas

1. **Múltiplos Projetos**: Crie rotinas diferentes para diferentes projetos usando o parâmetro `projectId`
2. **Atalho na Tela Inicial**: Adicione um widget ou atalho direto na tela inicial
3. **Comando Rápido**: Use comandos curtos como "Ideia" para acesso ainda mais rápido

## Exemplo de Rotina Completa

**Nome da Rotina**: "Gravar Ideia Rápida"

**Quando digo**: "Gravar ideia" ou "Nova ideia"

**Ações**:
1. Abrir app: Save Ideas
2. (Opcional) Aguardar 1 segundo
3. Executar: Deep link `saveideas://quick-record`

Agora você pode dizer "Ok Google, gravar ideia" e o app abrirá diretamente na tela de gravação!

