# Portfolio — regras para agentes

Portfólio pessoal em produção na Vercel (a `main` é publicada a cada merge). O processo completo, com diagramas, está na [wiki](https://github.com/alvaroaxsmith/portfolio/wiki); este arquivo guarda só as regras que o repositório não mostra sozinho.

## Ao implementar uma issue

1. Trabalhe numa branch própria a partir da `main` (ou da branch da fase anterior, se a issue disser que depende dela). Uma issue vira um PR.
2. TDD: escreva o teste que reproduz o problema, veja-o **vermelho**, corrija, veja-o verde.
3. Rode `npm run verify` (lint, unit com piso de cobertura, build com budgets, E2E). O hook `.githooks/pre-push` roda o mesmo gate; o push só sai verde.
4. Abra o PR com `Closes #N`, a lista do que mudou e as evidências (testes novos, métricas antes/depois, screenshots quando houver exceção visual aprovada).
5. Pronto é: todos os itens do checklist e todos os critérios de aceite da issue cumpridos, gate verde. O merge é feito por uma pessoa depois de validar o preview da Vercel; o agente entrega o PR e para.

## Regras

- **Visual intocado.** O visual em repouso fica idêntico ao da `main`. Mudança visual só entra quando a issue a descreve como exceção aprovada, e o PR mostra antes e depois.
- **Produção intocada.** Comportamento em produção muda só quando a issue pede; nesse caso, descreva no PR como validar no preview.
- **Commits e PRs empilhados:** o merge é sempre merge commit (squash quebra o PR seguinte do stack).
- **i18n:** o projeto usa o próprio texto em inglês como chave (`'Main Activities' | translate`) e chaves com ponto para textos novos (`'courses.title'`). Toda chave nova entra em `src/assets/i18n/EN.json` **e** `PT-BR.json` na mesma mudança, inclusive rótulos de leitor de tela.
- **Acessibilidade:** alvo WCAG 2.2 AA. Todo controle tem nome acessível traduzido; elemento escondido sai da ordem de foco (`inert`).
- **Angular:** standalone, `OnPush`, signals (`input()`, `computed`, `viewChild()`), `inject()`, `afterRenderEffect` para DOM, control flow (`@if`/`@for` com `track` por id).

## Armadilhas conhecidas

- **Cobertura instável:** callbacks assíncronos do `IntersectionObserver` fazem a cobertura variar entre execuções e derrubam o piso. Em specs, use `fakeIntersectionObserver()` de `src/app/testing/` e dispare a interseção explicitamente.
- **Pastas locais:** `specs/` e `.agents/` são do ambiente local do dono; ficam fora de commits.
- **Node 24** (campo `engines`). O E2E precisa do Chromium do Playwright (`npx playwright install chromium`).
