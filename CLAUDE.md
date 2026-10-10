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

## Commits e releases

O prefixo do commit decide a próxima versão (release-please, em `release-please-config.json`). Escolha pelo efeito para quem visita o site:

| Prefixo | Versão |
|---|---|
| `feat:` algo novo e visível (uma página, um controle) | minor |
| `fix:`, `perf:`, `refactor:` em código do site, `build(deps):` | patch |
| `test:`, `ci:`, `docs:`, `chore:` | nenhuma; entra na próxima release |
| `feat!:` ou `fix!:` (redesenho) | major, só com aprovação do dono |

A cada merge, o release-please atualiza um PR de release. Ao mergear esse PR, a tag e uma GitHub Release em **rascunho** são criadas; reescreva as notas em português, para visitantes, no estilo das releases anteriores, e o dono publica.

## Gates de acessibilidade e visual

- **axe** (`e2e/a11y.spec.ts`): violações ainda abertas ficam em `knownViolations`, cada uma com a issue que a corrige. Ao corrigir uma, remova a entrada; o teste falha se ela sobrar.
- **Teclado** (`e2e/keyboard.spec.ts`): casos ainda abertos são `test.fixme(... (#N))`. A issue #N os transforma em `test`.
- **Regressão visual** (`e2e/visual.spec.ts`, tolerância zero): as referências em `e2e/__screenshots__/` são geradas só na imagem Linux do Playwright, com `npm run test:visual` (comparar) e `npm run test:visual:update` (regenerar), ambos via Docker. O `npm run verify` roda a comparação quando o Docker está ligado e avisa quando não está; fora do container os testes são pulados e quem compara é o job `visual` do CI. Regenere só para uma exceção visual aprovada na issue, e mostre antes/depois no PR. Sem Docker (por exemplo no GitHub Actions), deixe a falha do job `visual` no PR e peça ao dono para regenerar; o artefato `visual-diff` traz as imagens esperada, atual e a diferença.

## Armadilhas conhecidas

- **Cobertura instável:** callbacks assíncronos do `IntersectionObserver` fazem a cobertura variar entre execuções e derrubam o piso. Em specs, use `fakeIntersectionObserver()` de `src/app/testing/` e dispare a interseção explicitamente.
- **Pastas locais:** `specs/` e `.agents/` são do ambiente local do dono; ficam fora de commits.
- **Versão do Playwright em três lugares**: `@playwright/test` (exata, sem `^`) no `package.json`, a tag da imagem no script `test:visual` e no job `visual` do `quality-gate.yml`. Mudam juntas; uma versão diferente procura outro Chromium e renderiza outros pixels.
- **Fontes do Google no gate visual:** o build embute o CSS do Google Fonts, e de vez em quando o Google responde com outro arquivo equivalente (`/l/font?kit=…` no lugar de `/s/<família>/…woff2`). A diferença aparece só na suavização do texto, sem mudança de layout. Se o gate visual reprovar só no texto sem mudança de código, confira `grep -c '/l/font' dist/portfolio_resume/browser/index.html` e refaça o build. Se persistir, o Google atualizou a fonte de vez: as referências são regeneradas com aprovação do dono. As fontes continuam vindo do Google, por decisão do dono.
- **Node 24** (campo `engines`). O E2E precisa do Chromium do Playwright (`npx playwright install chromium`).
