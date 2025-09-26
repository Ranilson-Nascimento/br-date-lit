
# Guia de Release

1. Garanta que a branch `main` está verde no CI.
2. Crie um changeset descrevendo as mudanças:
   ```bash
   npx changeset
   ```
3. Commit e push:
   ```bash
   git add .
   git commit -m "chore: release prep"
   git push origin main
   ```
4. O workflow **Release** (GitHub Actions) irá:
   - Rodar build
   - Versionar com Changesets
   - Publicar no npm (exige `NPM_TOKEN` nos Secrets)

## FAQ
- **Erro: permissão npm** → verifique se `NPM_TOKEN` tem permissões de publish.
- **Falha no CI** → rode `npm run build && npm test` localmente antes.
