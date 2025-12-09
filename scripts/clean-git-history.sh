#!/bin/bash

# Script para remover app.json do histórico do Git
# Use apenas se o repositório ainda estiver privado!

echo "⚠️  ATENÇÃO: Este script irá reescrever o histórico do Git!"
echo "Certifique-se de que:"
echo "  1. O repositório está privado"
echo "  2. Você tem backup do repositório"
echo "  3. Ninguém mais está trabalhando neste repositório"
echo ""
read -p "Continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]
then
    echo "Cancelado."
    exit 1
fi

echo "Removendo app.json do histórico do Git..."

# Método usando git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app.json" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "✅ Histórico limpo!"
echo ""
echo "Próximos passos:"
echo "  1. Verifique o histórico: git log --all -- app.json"
echo "  2. Se estiver tudo certo, force push:"
echo "     git push origin --force --all"
echo "     git push origin --force --tags"
echo ""
echo "⚠️  LEMBRE-SE: Force push reescreve o histórico remoto!"
echo "   Só faça isso se tiver certeza!"

