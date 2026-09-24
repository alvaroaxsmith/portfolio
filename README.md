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
│   ├── components/   # navbar, footer, splash-screen
│   ├── material/     # MaterialModule compartilhado
│   ├── pages/        # home, about-me, courses, portfolio, contact
│   └── services/     # SeoService
├── assets/
│   ├── i18n/         # PT-BR.json e EN.json
│   └── cv/           # currículo baixado pelo botão da home
└── styles.scss       # tokens globais de design
```

## Arquitetura

- **Rotas:** cada página é um módulo com lazy loading (`loadChildren`) e `NoPreloading`. A exceção é `contact`, carregada junto com a aplicação.
- **SEO:** cada rota declara `data.seo` com `titleKey` e `descriptionKey`. O `AppComponent` traduz essas chaves e o `SeoService` atualiza `title`, `description`, Open Graph e Twitter Card a cada navegação e troca de idioma.
- **Idioma:** o padrão é `PT-BR`, definido no `APP_INITIALIZER`. O idioma muda em tempo de execução, sem recarregar a página.

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
