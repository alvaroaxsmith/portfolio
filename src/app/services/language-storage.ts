// Idioma escolhido pelo visitante, guardado no navegador para valer já no
// próximo carregamento (inclusive no "Carregando" da splash)

export const SUPPORTED_LANGS = ['EN', 'PT-BR'];
export const DEFAULT_LANG = 'PT-BR';
const STORAGE_KEY = 'portfolio:lang';

/** Idioma salvo, se for um dos suportados; senão o padrão. */
export function getInitialLang(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return stored;
    }
  } catch {
    // Armazenamento indisponível (modo privado, bloqueado): segue com o padrão
  }
  return DEFAULT_LANG;
}

export function storeLang(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Sem armazenamento a troca vale só até recarregar a página
  }
}
