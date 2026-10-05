// Textura animada dos skeletons: cada quadradinho de 12px da grade troca de
// tom num ritmo próprio e aleatório. É gerada uma única vez por carregamento
// como um SVG animado (SMIL) e exposta em --skeleton-noise no :root, então
// todos os skeletons compartilham a mesma imagem, sem JS por elemento.

const CELL = 12;
// Ladrilho de 20×20 quadradinhos (240px): grande o bastante para a repetição
// não ser percebida
const CELLS = 20;
// Só parte dos quadradinhos pisca; os demais ficam num tom fixo aleatório
const ANIMATED_RATIO = 0.55;
// Tom dos quadradinhos: ardósia, a mesma família de --skeleton-base
const CELL_COLOR = '#64748b';
const MAX_OPACITY = 0.16;

let applied = false;

export function applySkeletonNoise(): void {
  if (applied || typeof document === 'undefined') {
    return;
  }
  applied = true;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const size = CELL * CELLS;
  const rects: string[] = [];

  for (let row = 0; row < CELLS; row++) {
    for (let col = 0; col < CELLS; col++) {
      // Recuo de 1px: a linha da grade (topo/esquerda de cada célula) continua visível
      const x = col * CELL + 1;
      const y = row * CELL + 1;
      const base = randomLevel();

      if (reducedMotion || Math.random() > ANIMATED_RATIO) {
        rects.push(`<rect x="${x}" y="${y}" width="11" height="11" fill-opacity="${base}"/>`);
        continue;
      }

      // Sequência aleatória de tons que volta ao primeiro, com duração e
      // ponto de partida próprios para nenhum quadradinho sincronizar
      const levels = [base, randomLevel(), randomLevel(), randomLevel(), base].join(';');
      const duration = (1.6 + Math.random() * 2.4).toFixed(2);
      const begin = (-Math.random() * 4).toFixed(2);
      rects.push(
        `<rect x="${x}" y="${y}" width="11" height="11" fill-opacity="${base}">` +
        `<animate attributeName="fill-opacity" values="${levels}" dur="${duration}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines="${SPLINES}"/>` +
        `</rect>`
      );
    }
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="${CELL_COLOR}">` +
    rects.join('') +
    `</svg>`;

  const root = document.documentElement.style;
  root.setProperty('--skeleton-noise', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  root.setProperty('--skeleton-noise-size', `${size}px ${size}px`);
}

// Transições suaves entre os tons (4 intervalos para 5 valores)
const SPLINES = Array(4).fill('0.4 0 0.6 1').join(';');

function randomLevel(): string {
  return (Math.random() * MAX_OPACITY).toFixed(3);
}
