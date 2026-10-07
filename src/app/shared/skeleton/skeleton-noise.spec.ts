import { applySkeletonNoise } from './skeleton-noise';

describe('skeleton noise texture', () => {
  const read = (name: string) => document.documentElement.style.getPropertyValue(name);

  it('exposes an SVG grid texture of 12px squares as CSS variables', () => {
    applySkeletonNoise();

    const noise = decodeURIComponent(read('--skeleton-noise'));
    expect(noise).toContain('data:image/svg+xml');
    expect((noise.match(/<rect /g) ?? []).length).toBe(400);
    expect(read('--skeleton-noise-size')).toBe('240px 240px');
  });

  it('animates part of the squares, each with its own rhythm', () => {
    applySkeletonNoise();

    const noise = decodeURIComponent(read('--skeleton-noise'));
    const durations = new Set(noise.match(/dur="[\d.]+s"/g));
    expect(durations.size).toBeGreaterThan(20);
  });

  it('is generated only once per page load, shared by every skeleton', () => {
    applySkeletonNoise();
    const first = read('--skeleton-noise');

    applySkeletonNoise();

    expect(read('--skeleton-noise')).toBe(first);
  });
});
