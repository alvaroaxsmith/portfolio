# Portfolio — Alvaro Ferreira

Portfólio pessoal bilíngue (PT-BR/EN) em Angular: apresentação, trajetória profissional, cursos, projetos do GitHub e contato.

Este README descreve as especificações técnicas do projeto e as regras que toda mudança deve respeitar.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Angular 22 (NgModules, `standalone: false`) |
| Linguagem | TypeScript 6 em modo `strict`, com `strictTemplates` |
| UI | Angular Material 22, SCSS e Font Awesome |
| Internacionalização | `@ngx-translate/core` com `http-loader` |
| Diagramas | Mermaid 11 (jornada da timeline profissional) |
| Build | `@angular/build:application` |
| Testes | Karma + Jasmine |
| CI | GitHub Actions: CodeQL em `main` |
| Analytics | Google Tag Manager + GA4, com Consent Mode v2 |
| SEO | Google Search Console, `robots.txt`, `sitemap.xml` e `canonical` por rota |
| Deploy | Vercel, com preview por PR e produção a cada push em `main` |

**Node.js:** `^22.22.3 || ^24.15.0 || >=26.0.0` (faixa exigida pelo Angular 22).

## Comandos

```bash
npm install
npm start       # servidor de desenvolvimento em http://localhost:4200
npm run build   # build de produção em dist/portfolio_resume
npm test        # testes unitários (Karma + Jasmine, Chrome headless: ng test --watch=false --browsers=ChromeHeadless)
```

## Estrutura

```
src/
├── app/
│   ├── components/   # navbar, footer, splash-screen, skeleton, consent-banner
│   ├── material/     # MaterialModule compartilhado
│   ├── pages/        # home, about-me, courses, portfolio, contact
│   └── services/     # SeoService, AnalyticsService, language-storage
├── assets/
│   ├── i18n/         # PT-BR.json e EN.json
│   └── cv/           # currículo baixado pelo botão da home
└── styles.scss       # tokens globais de design
```

## Arquitetura

- **Rotas:** cada página é um módulo com lazy loading (`loadChildren`) e `NoPreloading`. A exceção é `contact`, carregada junto com a aplicação.
- **SEO:** cada rota declara `data.seo` com `titleKey` e `descriptionKey`. O `AppComponent` traduz essas chaves e o `SeoService` atualiza `title`, `description`, Open Graph e Twitter Card a cada navegação e troca de idioma.
- **Idioma:** o padrão é `PT-BR`. A escolha do visitante fica em `localStorage` (`portfolio:lang`) e é lida no `APP_INITIALIZER`, então vale já no próximo carregamento, inclusive na splash. O idioma muda em tempo de execução, sem recarregar a página.
- **Splash:** um canvas no `index.html` desenha a grade de 24px do fundo do site antes de o JavaScript carregar. Os quadrados cintilam em tons de cinza que clareiam com o tempo. O `SplashScreenComponent` adota essa grade, mostra o "Carregando" traduzido e, após no mínimo 3s, dispara a saída (os quadrados se dissolvem e revelam o fundo do site). Se o app não chamar a saída, ela acontece sozinha em 8s. A página não tem barra de rolagem enquanto a splash está visível.
- **Skeletons:** todo carregamento usa o `SkeletonModule` (`app-skeleton`, `app-project-card-skeleton`, `app-courses-skeleton`). Os quadradinhos dos skeletons mudam de tom de forma aleatória, por uma textura SVG animada gerada uma vez por carregamento.
- **Carregamento infinito:** na página de projetos (grid e lista) e na lista de cursos no celular, os itens chegam em lotes ao rolar, com skeletons do próximo lote no fim da lista.
- **Recuperação após deploy:** as páginas com lazy loading ficam em arquivos com hash no nome, e cada deploy remove os arquivos da versão anterior. Uma aba aberta antes do deploy não consegue mais carregá-los (a Vercel responde com o HTML do site). O `ChunkLoadRecoveryService` detecta essa falha no `NavigationError` e recarrega a página de destino, que já vem com a versão nova. Recarrega no máximo uma vez a cada 10s (`sessionStorage`) para não entrar em loop.
- **Estado entre rotas:** o `CoursesStateService` guarda filtro, ordenação, página, itens já carregados no celular e se a dica de cursos já foi exibida. Fica só em memória: recarregar a página reinicia esse estado.

## Fontes de dados

| Página | Origem | Observação |
| --- | --- | --- |
| Projetos | API pública do GitHub (`/users/alvaroaxsmith/repos`) | Só aparecem repositórios com o topic `portfolio-project`, ordenados por `pushed_at`. A resposta fica em `localStorage` por 1 hora. |
| Cursos | JSON Server hospedado na Vercel | Lista servida por API externa. |
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
- O `SeoService` atualiza `canonical` e `og:url` a cada rota.
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

### Conteúdo e i18n
1. Nenhum texto visível fica escrito direto no template ou no TypeScript. Tudo passa pelo pipe `translate` ou por `TranslateService`.
2. `PT-BR.json` e `EN.json` precisam ter exatamente as mesmas chaves. Uma chave que falta aparece crua na tela ou cai no outro idioma.
3. Chaves novas são agrupadas por página (`home.*`, `timeline.*`, `courses.*`, `portfolio.*`, `seo.*`).
4. Rótulos usados como chave literal, como cargos, períodos e empresas da timeline, precisam existir nos dois arquivos, mesmo quando o valor é igual.
5. Editar os JSONs com gravação atômica, ou com o servidor parado: um arquivo lido pela metade derruba todas as traduções daquele idioma.

### Projetos (GitHub)
6. A curadoria é feita no GitHub, não no código: adicionar ou remover o topic `portfolio-project` no repositório.
7. A descrição exibida é a do GitHub. Para traduzir, adicionar `repo.<nome-do-repositório>` nos dois JSONs.
8. A API do GitHub é chamada sem autenticação (limite de 60 requisições por hora por IP). O cache de 1 hora é obrigatório. Sem cache e com a API indisponível, a página mostra uma mensagem com link para o perfil.

### Rotas e SEO
9. Toda rota nova declara `data.seo` e as chaves `seo.<página>.title` e `seo.<página>.description` nos dois idiomas.
10. Páginas novas entram como módulos com lazy loading.

### Estilo
11. Cores, fontes, espaçamentos e largura de página vêm dos tokens CSS de `src/styles.scss` (`--color-*`, `--font-*`, `--space-*`, `--page-width*`).
12. Layouts funcionam a partir de 360px de largura, sem rolagem horizontal. Os breakpoints usados são 768px e 480px.
13. Os limites de orçamento do build de produção precisam ser respeitados:
    - bundle inicial: aviso em 1 MB, erro em 2 MB
    - estilo por componente: aviso em 4 KB, erro em 8 KB

### Código
14. TypeScript `strict` e `strictTemplates` ficam ligados. O build não pode ter erros de tipo.
15. Acesso a `localStorage` sempre dentro de `try/catch`, e a página precisa funcionar sem ele.
16. O código em `src/` não tem comentários. Explicações de decisões ficam neste README e nas mensagens de commit.
17. Animações respeitam `prefers-reduced-motion`: sem movimento contínuo, só transições curtas.
18. A suíte de testes precisa passar inteira antes de cada release. O `app-routing.spec.ts` garante que todas as rotas abrem a página certa; toda rota nova entra nele.

### Valores acoplados
Estes valores aparecem em mais de um arquivo e precisam mudar juntos:

| Valor | Onde |
| --- | --- |
| Largura mínima do card de projeto (300px) | `GRID_MIN_CARD_WIDTH` em `portfolio.component.ts` e `minmax` do grid em `portfolio.component.scss` |
| Duração da dica de cursos (5s) | `COURSE_HINT_DURATION_MS` em `snackbar.component.ts` e `--hint-duration` em `snack-bar.scss` |
| Passo da grade (24px) | `background-size` do `body` em `styles.scss` e `CELL` da splash no `index.html` |
| Domínio de produção | `PRODUCTION_HOST` no `index.html`, `SITE_URL` no `seo.service.ts`, `robots.txt` e `sitemap.xml` |
| Rotas do site | `app-routing.module.ts` e `sitemap.xml` |
| Chave do consentimento (`portfolio:consent`) | Script do `<head>` no `index.html` e `analytics.service.ts` |
| Cor do texto da splash | `--color-text` (`#0f172a`) e `MIN_TONE` da splash no `index.html`, que impede os quadrados de ficarem tão escuros quanto o texto |

## Histórico de versões

### v2.2.2 (hotfix)
- **Navegação depois de um deploy:** Sobre mim, Cursos e Projetos deixavam de abrir em abas carregadas antes de um deploy. O app agora recarrega a página de destino quando o arquivo da página não existe mais.
- **Certificados:** o skeleton sumia antes de o certificado carregar, porque o primeiro evento `load` do iframe (ainda sem `src`) era tratado como carregamento.
- **Testes:** `ng test` voltou a rodar; testes de navegação de todas as rotas e da recuperação; testes antigos corrigidos (30 passando).

### v2.2.1
- **Menu mobile:** corrigido o bloco branco que aparecia ao fechar o menu (bottom sheet) depois de escolher uma página. O visual do menu estava no painel fixo do overlay, e não no container que desliza.

### v2.2.0
- **Analytics:** GA4 carregado pelo Google Tag Manager, só no domínio de produção, com Consent Mode v2 começando com tudo negado.
- **Banner de consentimento (LGPD)** depois da splash e link "Preferências de cookies" no rodapé.
- **Plano de medição:** `page_view` a cada navegação e eventos de CV, LinkedIn, contato, repositórios, filtros e visualização de projetos, certificados e troca de idioma.
- **Atribuição por UTM:** o `page_view` envia a URL completa, com a query string.
- **Exclusão do próprio tráfego** com `?analytics=off` (e `?analytics=on` para religar).
- **SEO técnico:** `canonical` e `og:url` por rota, `robots.txt`, `sitemap.xml` e verificação no Google Search Console.

### v2.1.0
- **Splash refeita:** grade em canvas desde o primeiro quadro, tons de cinza que clareiam, saída por dissolução e "Carregando" traduzido e animado.
- **Skeletons:** em todas as páginas que carregam dados, com quadradinhos que mudam de tom aleatoriamente.
- **Projetos:** carregamento infinito responsivo no grid e na lista, com skeletons e aviso de fim da lista.
- **Cursos:** certificado em bottom sheet responsivo, carregamento infinito no celular e dica em notificação no canto superior direito, com relógio de 5s.
- **Sobre mim:** linha do tempo de destaques revelada com parallax ao rolar; cards de experiência sem ação de clique no celular.
- **Idioma salvo no navegador** e barra de rolagem nativa em telas de toque.
- **Texto da home revisado** e remoção dos comentários do código.

### v2.0.0
- Projetos direto do GitHub, textos revisados em PT-BR e EN, SEO por rota e README técnico.
