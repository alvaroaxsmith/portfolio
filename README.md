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

**Node.js:** `^22.22.3 || ^24.15.0 || >=26.0.0` (faixa exigida pelo Angular 22).

## Comandos

```bash
npm install
npm start       # servidor de desenvolvimento em http://localhost:4200
npm run build   # build de produção em dist/portfolio_resume
npm test        # testes unitários
```

## Estrutura

```
src/
├── app/
│   ├── components/   # navbar, footer, splash-screen, skeleton
│   ├── material/     # MaterialModule compartilhado
│   ├── pages/        # home, about-me, courses, portfolio, contact
│   └── services/     # SeoService, language-storage
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
- **Estado entre rotas:** o `CoursesStateService` guarda filtro, ordenação, página, itens já carregados no celular e se a dica de cursos já foi exibida. Fica só em memória: recarregar a página reinicia esse estado.

## Fontes de dados

| Página | Origem | Observação |
| --- | --- | --- |
| Projetos | API pública do GitHub (`/users/alvaroaxsmith/repos`) | Só aparecem repositórios com o topic `portfolio-project`, ordenados por `pushed_at`. A resposta fica em `localStorage` por 1 hora. |
| Cursos | JSON Server hospedado na Vercel | Lista servida por API externa. |
| Demais textos | `src/assets/i18n/*.json` | Todo o conteúdo textual do site. |

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

### Valores acoplados
Estes valores aparecem em mais de um arquivo e precisam mudar juntos:

| Valor | Onde |
| --- | --- |
| Largura mínima do card de projeto (300px) | `GRID_MIN_CARD_WIDTH` em `portfolio.component.ts` e `minmax` do grid em `portfolio.component.scss` |
| Duração da dica de cursos (5s) | `COURSE_HINT_DURATION_MS` em `snackbar.component.ts` e `--hint-duration` em `snack-bar.scss` |
| Passo da grade (24px) | `background-size` do `body` em `styles.scss` e `CELL` da splash no `index.html` |
| Cor do texto da splash | `--color-text` (`#0f172a`) e `MIN_TONE` da splash no `index.html`, que impede os quadrados de ficarem tão escuros quanto o texto |

## Histórico de versões

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
