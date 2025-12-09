# Como Gerar o Ícone do App (Lâmpada)

Para atualizar o ícone do app com uma lâmpada, você precisa gerar os arquivos PNG necessários.

## Opções:

### Opção 1: Usar um Gerador Online (Recomendado)

1. Acesse: https://www.appicon.co/ ou https://icon.kitchen/
2. Faça upload de uma imagem de lâmpada (1024x1024px)
3. Baixe os ícones gerados
4. Substitua os arquivos em `assets/images/`:
   - `icon.png` (1024x1024)
   - `android-icon-foreground.png` (1024x1024)
   - `android-icon-background.png` (1024x1024) - pode ser uma cor sólida
   - `android-icon-monochrome.png` (1024x1024)
   - `favicon.png` (48x48 ou 64x64)
   - `splash-icon.png` (200x200 ou maior)

### Opção 2: Usar Expo CLI

1. Crie uma imagem de lâmpada (1024x1024px) e salve como `icon-source.png`
2. Execute: `npx expo-optimize` ou use o Expo Image Tools
3. Ou use: `npx @expo/image-utils` para gerar os tamanhos necessários

### Opção 3: Criar Manualmente

Use um editor de imagens (Figma, Photoshop, etc.) para criar:
- Ícone principal: 1024x1024px com fundo transparente ou colorido
- Ícone Android: Foreground (lâmpada) e Background (cor sólida)
- Favicon: 48x48px ou 64x64px

## Sugestão de Design:

- Lâmpada amarela/dourada em fundo escuro ou claro
- Estilo moderno e minimalista
- Cores que combinem com o tema do app (indigo/violet)

