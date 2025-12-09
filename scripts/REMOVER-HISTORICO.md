# 🗑️ Remover app.json do Histórico do Git

## ✅ Passo 1: Já feito!
O `app.json` já foi removido do controle de versão atual.

## 🔧 Passo 2: Remover do histórico completo

Execute estes comandos **na ordem**:

### 1. Remover do histórico usando git filter-branch

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app.json" \
  --prune-empty --tag-name-filter cat -- --all
```

### 2. Limpar referências antigas

```bash
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 3. Verificar se funcionou

```bash
# Se não retornar nada, está limpo! ✅
git log --all --full-history -- app.json
```

### 4. Fazer push (reescreve o histórico remoto)

⚠️ **ATENÇÃO**: Isso reescreve o histórico no GitHub!

```bash
git push origin --force --all
git push origin --force --tags
```

## ✅ Passo 3: Verificar

Depois do push, verifique no GitHub que o `app.json` não aparece mais no histórico.

## 📝 Notas

- O arquivo `app.json` ainda existe localmente (está no `.gitignore` agora)
- Use `app.config.js` que lê as variáveis do `.env`
- Configure o `.env` com suas credenciais (não commite!)

