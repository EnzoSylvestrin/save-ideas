# Configuração de App Shortcuts via Plugin Expo

## ✅ O que foi feito

Criamos um plugin do Expo (`plugins/withAndroidShortcuts.js`) que configura automaticamente os App Shortcuts do Android durante o processo de build, **sem necessidade de commitar a pasta `android`**.

## 📁 Arquivos criados

- `plugins/withAndroidShortcuts.js` - Plugin que configura os shortcuts
- `plugins/README.md` - Documentação do plugin

## 🔧 Como funciona

O plugin é executado automaticamente quando você roda:
- `expo prebuild` - Gera as pastas nativas
- `expo run:android` - Build e executa no Android
- `eas build` - Build na nuvem

### O que o plugin faz:

1. **Cria `android/app/src/main/res/xml/shortcuts.xml`**
   - Define o atalho "Gravar Ideia Rápida"
   - Configura o deep link `saveideas://quick-record`

2. **Atualiza `android/app/src/main/res/values/strings.xml`**
   - Adiciona as strings `shortcut_quick_record_short` e `shortcut_quick_record_long`

3. **Atualiza `android/app/src/main/AndroidManifest.xml`**
   - Adiciona a meta-data que referencia o arquivo de shortcuts

## 🚀 Como usar

### 1. Remover a pasta android do controle de versão (se já estiver commitada)

```bash
git rm -r --cached android
git commit -m "Remove pasta android - agora gerenciada pelo plugin"
```

### 2. O plugin já está configurado no `app.json`

```json
{
  "expo": {
    "plugins": [
      "./plugins/withAndroidShortcuts.js"
    ]
  }
}
```

### 3. Ao fazer build, o plugin será executado automaticamente

```bash
# Desenvolvimento local
expo prebuild
expo run:android

# Build na nuvem (EAS)
eas build --platform android
```

## ✨ Vantagens

- ✅ **Não precisa commitar `android/`** - A pasta é gerada automaticamente
- ✅ **Configuração centralizada** - Tudo no `app.json` e no plugin
- ✅ **Evita conflitos** - Não há mais conflitos de merge na pasta android
- ✅ **Funciona com EAS Build** - Builds na nuvem funcionam perfeitamente
- ✅ **Manutenção fácil** - Mudanças nos shortcuts são feitas no plugin

## 📝 Personalização

Para modificar os shortcuts, edite o arquivo `plugins/withAndroidShortcuts.js`:

- **Labels**: Modifique as strings `'Gravar Ideia'` e `'Gravar Ideia Rápida'`
- **Deep link**: Modifique `'saveideas://quick-record'`
- **ID do shortcut**: Modifique `'quick_record'`

## 🔍 Verificação

Após rodar `expo prebuild`, você pode verificar se os arquivos foram criados:

```bash
# Verificar shortcuts.xml
cat android/app/src/main/res/xml/shortcuts.xml

# Verificar strings.xml
cat android/app/src/main/res/values/strings.xml

# Verificar AndroidManifest.xml
grep -A 2 "android.app.shortcuts" android/app/src/main/AndroidManifest.xml
```

## ⚠️ Importante

- A pasta `android/` já está no `.gitignore`
- **Não commite** a pasta `android/` - ela é gerada automaticamente
- Se precisar fazer mudanças, edite o plugin, não os arquivos gerados

