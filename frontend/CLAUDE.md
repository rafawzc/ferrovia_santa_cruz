# frontend/ — React + Vite

Detalhe completo de responsividade e do sistema de tema em `docs/frontend/`: [`responsividade.md`](../docs/frontend/responsividade.md), [`tema-escuro.md`](../docs/frontend/tema-escuro.md). **Leia `tema-escuro.md` antes de mexer em qualquer cor, `index.css` ou `tailwind.config.js`** — tem uma regra semântica não-óbvia (`componente1` sempre pareia com `texto2`, todo o resto com `texto1`) e um gotcha real de Tailwind + CSS variables + opacidade que já quebrou o app inteiro silenciosamente uma vez.

## Gotchas que já morderam

- **Sem Docker ainda.** O `.claude/CLAUDE.md` raiz descreve um `docker-compose.yml` de 3 serviços, mas ele não existe neste repo ainda — é o alvo, não o estado atual. Pra rodar/testar o frontend hoje: `npm install && npm run dev` direto na pasta `frontend/`. Não assuma `docker compose exec frontend ...` vai funcionar sem checar primeiro se o compose já foi criado.
- **Sem Vitest configurado.** `package.json` não tem script `test` apesar do `.claude/CLAUDE.md` mandar rodar `npm run test`. Se for adicionar testes, configurar Vitest é pré-requisito, não assuma que já existe.
- **Mudança em `tailwind.config.js` exige restart do dev server**, não só HMR — o Vite cacheia a config do PostCSS/Tailwind em `node_modules/.vite`. Se uma cor não estiver refletindo depois de editar o config, mate o processo do `vite` e suba de novo (ou apague `node_modules/.vite`).
- **PRs que tocam cor/tema: teste rodando a página de verdade**, não só lendo o diff. Bugs de contraste (texto invisível, botão que some) não aparecem em `npm run lint` nem em `npm run build` — só aparecem olhando o browser nos dois temas.
