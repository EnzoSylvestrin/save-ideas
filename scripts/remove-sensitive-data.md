# 🔒 Removendo Dados Sensíveis do Git

Se você já commitou o `app.json` com a URL do Convex ou outras informações sensíveis, siga estes passos:

## ⚠️ Importante

Se o repositório já foi publicado publicamente, você deve considerar:
1. **Rotacionar as credenciais** (criar novas no Convex)
2. **Remover o histórico** do Git (se necessário)

## Passos para Remover do Git

### 1. Remover o arquivo do controle de versão

```bash
# Remove o app.json do git (mas mantém localmente)
git rm --cached app.json

# Commit a remoção
git commit -m "Remove app.json - agora usando app.config.js com variáveis de ambiente"
```

### 2. Se o app.json já foi commitado anteriormente

Se você quer remover completamente do histórico (cuidado!):

```bash
# Usando git filter-branch (método antigo)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app.json" \
  --prune-empty --tag-name-filter cat -- --all

# OU usando git-filter-repo (recomendado, mas precisa instalar)
# pip install git-filter-repo
git filter-repo --path app.json --invert-paths
```

### 3. Force push (apenas se necessário)

⚠️ **CUIDADO**: Isso reescreve o histórico. Só faça se:
- O repositório é privado OU
- Você tem certeza que ninguém mais está usando o repositório

```bash
git push origin --force --all
git push origin --force --tags
```

## Alternativa Mais Segura

Se o repositório já foi compartilhado, é melhor:

1. **Rotacionar as credenciais** no Convex
2. **Atualizar o `.env`** com as novas credenciais
3. **Deixar o histórico como está** (já foi exposto)
4. **Garantir que futuros commits** não incluam dados sensíveis

## Verificação

Após remover, verifique se não há mais dados sensíveis:

```bash
# Verificar se app.json ainda está no git
git ls-files | grep app.json

# Verificar histórico por strings sensíveis
git log -p --all -S "vibrant-perch-36" -- app.json
```

## Prevenção Futura

- ✅ Use `app.config.js` (já configurado)
- ✅ Use variáveis de ambiente no `.env`
- ✅ `.env` está no `.gitignore`
- ✅ `app.json` está no `.gitignore` agora
- ✅ Use `app.json.example` como template

