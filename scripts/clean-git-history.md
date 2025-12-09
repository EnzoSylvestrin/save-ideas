# 🧹 Limpar Histórico do Git - Remover app.json

Como o repositório ainda está **privado**, podemos remover o `app.json` do histórico do Git de forma segura.

## ⚠️ Importante

- ✅ O repositório está privado (seguro para fazer isso)
- ✅ Ninguém mais está usando este repositório
- ⚠️ Isso reescreverá o histórico do Git

## Método 1: Remover apenas do último commit (mais simples)

Se você acabou de commitar o `app.json` e ainda não fez push:

```bash
# Remove do último commit (mas mantém o arquivo local)
git reset HEAD~1 app.json
git commit --amend --no-edit

# Ou se já fez push, apenas remova do controle de versão
git rm --cached app.json
git commit -m "chore: remove app.json from git"
```

## Método 2: Remover de todo o histórico (recomendado)

Para remover completamente do histórico:

### Opção A: Usando git filter-branch (nativo)

```bash
# Remove app.json de todo o histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app.json" \
  --prune-empty --tag-name-filter cat -- --all

# Limpar referências antigas
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Opção B: Usando BFG Repo-Cleaner (mais rápido)

```bash
# Instalar BFG (se não tiver)
# brew install bfg  # macOS
# ou baixar de: https://rtyley.github.io/bfg-repo-cleaner/

# Remover app.json
bfg --delete-files app.json

# Limpar
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## Verificar se funcionou

```bash
# Verificar se app.json ainda aparece no histórico
git log --all --full-history -- app.json

# Se não retornar nada, está limpo! ✅
```

## Fazer push das mudanças

⚠️ **CUIDADO**: Isso reescreve o histórico remoto!

```bash
# Force push para o remoto
git push origin --force --all
git push origin --force --tags
```

## Após limpar

1. ✅ Certifique-se de que `app.json` está no `.gitignore`
2. ✅ Use `app.config.js` (já configurado)
3. ✅ Configure o `.env` com suas credenciais
4. ✅ Nunca commite o `.env` ou `app.json` novamente

## Script Automatizado

Você pode usar o script `clean-git-history.sh`:

```bash
chmod +x scripts/clean-git-history.sh
./scripts/clean-git-history.sh
```

