
# Contribuindo para o br-date-lit

Obrigado por contribuir! Nosso objetivo é manter **confiável**, **auditável** e **fácil de usar**.

## Como contribuir
1. Abra uma issue descrevendo o problema/melhoria.
2. Crie uma branch a partir de `main`.
3. Faça commits pequenos e objetivos.
4. Atualize/adicione testes (`vitest`).
5. Rode `npm run build` e `npm test` antes do PR.
6. Execute `npx changeset` para documentar a mudança de versão.
7. Abra o Pull Request.

## Padrões
- TypeScript estrito, sem dependências de runtime desnecessárias.
- Evite hardcode de feriados municipais. Use o **dataset**.
- Cite fontes dos dados (leis/decretos) no campo `source` do JSON quando possível.
- Mantenha o `README` atualizado com exemplos.

## Release
- Usamos **Changesets** + **GitHub Actions**. O publish ocorre na `main` com `NPM_TOKEN`.
