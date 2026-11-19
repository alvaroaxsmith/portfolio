# Portfolio — Alvaro Ferreira

Portfólio pessoal bilíngue (PT-BR/EN) em Angular: apresentação, trajetória profissional, cursos, projetos do GitHub e contato. Em produção em [alvaromachadoferreira.vercel.app](https://alvaromachadoferreira.vercel.app).

> **Como o projeto é desenvolvido:** o fluxo com agentes (issue → agente → PR → gates no CI → preview → aprovação humana → merge → release), os gates de qualidade e as regras estão na **[wiki](https://github.com/alvaroaxsmith/portfolio/wiki)**. As regras para agentes ficam no [`CLAUDE.md`](CLAUDE.md).

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Angular 22: componentes standalone, `OnPush`, signals, rotas com `loadComponent` |
| Linguagem | TypeScript em modo `strict`, com `strictTemplates` |
| UI | Angular Material 22, SCSS e Font Awesome 7 |
| Internacionalização | `@ngx-translate/core` 18 (`provideTranslateService`, `TranslatePipe`) |
| Diagramas | Mermaid 12 (jornada da trajetória profissional), em modo `strict` |
| Testes | Karma + Jasmine (unitários, com piso de cobertura) e Playwright (E2E, axe, teclado e regressão visual) |
| CI | GitHub Actions: Quality gate, CodeQL, revisão do Claude e release-please |
| Hospedagem | Vercel, com `vercel.json` (cache, cabeçalhos de segurança, CSP em modo de relatório) e preview por PR. O build é entregue como Build Output API (`npm run build:vercel`), então arquivo inexistente responde 404 |

**Node.js 24** (`engines` e `.nvmrc`). Com o nvm: `nvm use`.

## Comandos

```bash
npm ci
npm start                  # servidor de desenvolvimento em http://localhost:4200
npm run build              # build de produção em dist/portfolio_resume/browser
npm test                   # testes unitários em modo watch
npm run lint               # ESLint (TypeScript e templates)
npm run e2e                # E2E com Playwright contra o build (rode o build antes)
npm run test:visual        # regressão visual na imagem Docker do Playwright
npm run test:visual:update # regenera as referências visuais (só com exceção visual aprovada)
npm run verify             # o gate completo: lint, unit com cobertura, build, E2E e visual
```

O `npm install` liga o hook `.githooks/pre-push`, que roda o `npm run verify` antes de cada push. Para o E2E, instale o Chromium do Playwright uma vez: `npx playwright install chromium`.

## Estrutura

```
src/
├── app/
│   ├── core/        # analytics, chunk-load, i18n, layout (navbar, footer, splash, consent), seo, version, window-events
│   ├── features/    # home, about-me, courses, portfolio, contact, not-found
│   ├── shared/      # skeletons
│   └── testing/     # utilitários de specs (fakeIntersectionObserver)
├── assets/
│   ├── i18n/        # PT-BR.json e EN.json
│   └── cv/          # currículo baixado pelo botão da home
└── styles.scss      # tokens globais de design
e2e/                 # specs do Playwright, servidor que serve o build como a Vercel e referências visuais
scripts/             # vercel-output.mjs: build no formato Build Output API, com as rotas do vercel.json
                     # vercel-ignore.sh: pula previews sem mudança para quem visita (testes, CI, docs, branch de release)
```

## Arquitetura

- **Rotas:** cada página é carregada sob demanda (`loadComponent`). Endereços desconhecidos abrem a página "não encontrada", com `noindex`.
- **SEO:** cada rota declara `data.seo` com `titleKey` e `descriptionKey`. O `AppComponent` traduz essas chaves e o `SeoService` atualiza `title`, `description`, Open Graph e Twitter Card a cada navegação e troca de idioma.
- **Idioma:** o padrão é `PT-BR`. A escolha do visitante fica em `localStorage` (`portfolio:lang`) e é aplicada por um app initializer antes da primeira renderização. O idioma muda em tempo de execução, sem recarregar a página.
- **Acessibilidade:** alvo WCAG 2.2 AA. Link para pular ao conteúdo, foco no título da página a cada navegação, elementos fora da vista com `inert`, nomes traduzidos para leitores de tela e pausa da palavra que alterna na home.
- **Splash:** um canvas no `index.html` desenha a grade de 24px do fundo do site antes de o JavaScript carregar. O `SplashScreenComponent` adota essa grade, mostra o "Carregando" traduzido e, após no mínimo 3s, dispara a saída. Se o app não chamar a saída, ela acontece sozinha em 8s.
- **Skeletons e carregamento infinito:** todo carregamento mostra skeletons. Na página de projetos e na lista de cursos no celular, os itens chegam em lotes ao rolar.
- **Recuperação após deploy:** cada deploy remove os arquivos da versão anterior, e uma aba aberta antes não consegue mais carregá-los. O `ChunkLoadRecoveryService` detecta a falha no `NavigationError` e recarrega a página de destino, no máximo uma vez a cada 10s (`sessionStorage`).
- **Estado entre rotas:** o `CoursesStateService` guarda filtro, ordenação, página, itens já carregados no celular e se a dica de cursos já foi exibida. Fica só em memória.
- **Versão:** a versão em produção aparece em `<meta name="version">` e no console do navegador.

## Fontes de dados

| Página | Origem | Observação |
| --- | --- | --- |
| Projetos | API pública do GitHub (`/users/alvaroaxsmith/repos`) | Só aparecem repositórios com o topic `portfolio-project`, ordenados por `pushed_at`. A resposta fica em `localStorage` por 1 hora. |
| Cursos | `src/assets/data/courses.json` | Arquivo estático servido com o site; um curso novo é uma edição nesse arquivo e um deploy. |
| Demais textos | `src/assets/i18n/*.json` | Todo o conteúdo textual do site. |

## Analytics e SEO técnico

O site usa **Google Tag Manager** para carregar o **GA4**, com **Consent Mode v2** e banner de consentimento (LGPD), além de `robots.txt` e `sitemap.xml` para o **Google Search Console**.

### Como funciona
- O `<head>` do `index.html` define o consentimento padrão com tudo negado antes de carregar o GTM. Se o visitante já aceitou (`portfolio:consent` no `localStorage`), o consentimento é restaurado antes do GTM.
- O GTM só carrega quando `GTM_ID` está preenchido e o site roda em `alvaromachadoferreira.vercel.app`. Em desenvolvimento e nos previews da Vercel nada é enviado.
- O banner (`app-consent-banner`) aparece depois da splash, só para quem ainda não escolheu. "Aceitar" libera apenas `analytics_storage`; os sinais de anúncio continuam negados. O link "Preferências de cookies" no rodapé reabre o banner.
- O `AnalyticsService` envia os eventos ao `dataLayer` e zera os parâmetros do evento anterior a cada envio. O `page_view` é enviado a cada navegação do Router, depois de o título da página ser atualizado.
- O `page_location` do `page_view` é a URL completa, com a query string: é dela que o GA4 lê os UTMs para atribuir a origem da sessão. O `page_path` vai sem a query.
- O GA4 (`G-3FW1JM39H9`) é configurado só dentro do contêiner do GTM (`GTM-PCV39BS2`): Tag Google com `send_page_view` desligado e uma tag de evento do GA4 que recebe os eventos do plano de medição.
- Com Consent Mode no modo avançado, as tags do Google enviam pings sem cookies e sem identificadores enquanto o consentimento está negado.
- O `index.html` já traz `canonical`, `og:url` e `og:image` padrão, e o `SeoService` os atualiza a cada rota.
- Para não contar suas próprias visitas, abra o site uma vez com `?analytics=off` (desliga neste navegador). `?analytics=on` religa.

### Plano de medição

| Evento | Quando | Parâmetros |
| --- | --- | --- |
| `page_view` | Cada navegação | `page_path`, `page_location`, `page_title`, `language` |
| `consent_update` | Escolha no banner | `analytics_storage` |
| `language_switch` | Troca de idioma | `from`, `to` |
| `cv_download` | Botão "Baixar CV" | `language` |
| `linkedin_click` | CTA do LinkedIn na home | `location` |
| `contact_click` | Cards da página de contato | `channel` (`phone`, `email`, `github`, `linkedin`) |
| `repo_click` | Botão "Repositório" de um projeto | `repo`, `tech`, `view` |
| `projects_filter` | Filtro de tecnologia | `tech` |
| `projects_sort` | Ordenação por data | `sort` |
| `projects_view_toggle` | Troca entre grid e lista | `view` |
| `certificate_open` | Abrir um certificado | `course`, `school` |
| `certificate_open_new_tab` | Abrir certificado em nova aba | `course` |

Nomes de eventos e parâmetros são fixos e em inglês, independentes do idioma da página. Nunca enviar dados pessoais.

### Links com UTM
Links do site divulgados fora dele levam UTMs para que a origem apareça no GA4 (Aquisição de tráfego):

| Onde | `utm_source` | `utm_medium` | `utm_campaign` |
| --- | --- | --- | --- |
| Perfil do LinkedIn | `linkedin` | `profile` | — |
| Destaques do LinkedIn | `linkedin` | `featured` | — |
| Posts do LinkedIn | `linkedin` | `post` | tema do post |
| CV em PDF | `cv` | `pdf` | — |
| Perfil do GitHub | `github` | `profile` | — |
| README de projeto | `github` | `readme` | nome do repositório |
| Candidatura a vaga | nome da empresa | `application` | vaga |
| Assinatura de e-mail | `email` | `signature` | — |

Exemplo: `https://alvaromachadoferreira.vercel.app/?utm_source=linkedin&utm_medium=profile`

Regras: valores sempre em minúsculas e com hífen, nomes estáveis ao longo do tempo e nenhum UTM em links internos do site.

## Regras do projeto

As regras gerais (zero colateral visual, humano no merge, TDD, gates, i18n e acessibilidade) estão no [`CLAUDE.md`](CLAUDE.md) e na [wiki](https://github.com/alvaroaxsmith/portfolio/wiki/Regras-do-projeto). As específicas do conteúdo:

### Conteúdo e i18n
1. Nenhum texto visível fica escrito direto no template ou no TypeScript. Tudo passa pelo pipe `translate` ou por `TranslateService`.
2. `PT-BR.json` e `EN.json` precisam ter exatamente as mesmas chaves.
3. Chaves novas são agrupadas por página (`home.*`, `timeline.*`, `courses.*`, `portfolio.*`, `seo.*`, `a11y.*`).
4. Rótulos usados como chave literal, como cargos, períodos e empresas da timeline, precisam existir nos dois arquivos, mesmo quando o valor é igual.

### Projetos (GitHub)
5. A curadoria é feita no GitHub, não no código: adicionar ou remover o topic `portfolio-project` no repositório.
6. A descrição exibida é a do GitHub. Para traduzir, adicionar `repo.<nome-do-repositório>` nos dois JSONs.
7. A API do GitHub é chamada sem autenticação (60 requisições por hora por IP). O cache de 1 hora é obrigatório.

### Rotas e SEO
8. Toda rota nova declara `data.seo` e as chaves `seo.<página>.title` e `seo.<página>.description` nos dois idiomas, e entra no `sitemap.xml` e no `app.routes.spec.ts`.

### Estilo e limites
9. Cores, fontes, espaçamentos e largura de página vêm dos tokens CSS de `src/styles.scss` (`--color-*`, `--font-*`, `--space-*`, `--page-width*`).
10. Layouts funcionam a partir de 360px de largura, sem rolagem horizontal.
11. Budgets do build de produção: bundle inicial com aviso em 800 KB e erro em 1 MB; estilo por componente com aviso em 6 KB e erro em 8 KB.

### Valores acoplados
Estes valores aparecem em mais de um arquivo e precisam mudar juntos:

| Valor | Onde |
| --- | --- |
| Largura mínima do card de projeto (300px) | `GRID_MIN_CARD_WIDTH` em `portfolio.component.ts` e `minmax` do grid em `portfolio.component.scss` |
| Duração da dica de cursos | `course-hint.component.ts` e `course-hint.component.scss` |
| Passo da grade (24px) | `background-size` do `body` em `styles.scss` e `CELL` da splash no `index.html` |
| Domínio de produção | `PRODUCTION_HOST`, `canonical` e `og:url` no `index.html`, `SITE_URL` no `seo.service.ts`, `robots.txt` e `sitemap.xml` |
| Scripts inline do `index.html` | Seus hashes `sha256` na CSP do `vercel.json` (o E2E falha se divergirem) |
| Hosts externos (APIs, fontes, GTM, avatar) | CSP do `vercel.json` |
| Chave do consentimento (`portfolio:consent`) | Script do `<head>` no `index.html` e `analytics.service.ts` |

## Versões e licença

O histórico está nas [GitHub Releases](https://github.com/alvaroaxsmith/portfolio/releases), com notas para quem visita o site, e no [`CHANGELOG.md`](CHANGELOG.md), técnico.

O código é distribuído sob a licença MIT. Os textos, a foto e o currículo são CC BY-NC 4.0. Detalhes no [`LICENSE`](LICENSE).
