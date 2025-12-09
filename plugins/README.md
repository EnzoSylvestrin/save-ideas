# Expo Config Plugins

Este diretório contém plugins de configuração personalizados do Expo.

## withAndroidShortcuts

Este plugin configura automaticamente os App Shortcuts do Android durante o processo de build do Expo.

### O que ele faz:

1. **Cria `shortcuts.xml`**: Define o atalho "Gravar Ideia Rápida" que abre diretamente a tela de gravação
2. **Atualiza `strings.xml`**: Adiciona as strings necessárias para os labels do atalho
3. **Atualiza `AndroidManifest.xml`**: Adiciona a referência aos shortcuts no manifest

### Como funciona:

O plugin é executado automaticamente durante o processo de build do Expo (`expo prebuild` ou `expo run:android`). Ele cria os arquivos necessários na pasta `android` gerada, sem necessidade de manter essa pasta no controle de versão.

### Configuração:

O plugin está configurado no `app.json`:

```json
{
  "expo": {
    "plugins": [
      "./plugins/withAndroidShortcuts.js"
    ]
  }
}
```

### Vantagens:

- ✅ Não precisa commitar a pasta `android`
- ✅ Configuração centralizada no `app.json`
- ✅ Evita conflitos de merge
- ✅ Funciona com EAS Build

