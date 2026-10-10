import { blankImage } from '@character-studio/render-utils';

interface Point { readonly x: number; readonly y: number }

/** Faceless, synthetic native guide. No inferred or approved character anatomy. */
export function headNeckFixture(layout: { readonly scalp: readonly Point[]; readonly neck: readonly Point[] }) {
  const image = blankImage(1024, 1536);
  for (const polygon of [layout.neck, layout.scalp]) {
    const left = Math.min(...polygon.map((p) => p.x)), right = Math.max(...polygon.map((p) => p.x));
    const top = Math.min(...polygon.map((p) => p.y)), bottom = Math.max(...polygon.map((p) => p.y));
    for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
      // Pixel-centre even/odd polygon fill; no scaling, interpolation or reflection.
      const px = x + 0.5, py = y + 0.5;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i]!, b = polygon[j]!;
        if ((a.y > py) !== (b.y > py) && px < (b.x - a.x) * (py - a.y) / (b.y - a.y) + a.x) inside = !inside;
      }
      if (inside) image.data.set([244, 221, 205, 255], (y * 1024 + x) * 4);
    }
  }
  return image;
}
