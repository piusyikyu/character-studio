import { createCharacterRecipe, DIRECTIONS, assetSourceSchema } from '@character-studio/core';
import type { CharacterRecipe, Direction, RenderTarget, RenderPlan } from '@character-studio/core';
import { createManifestRegistry } from '@character-studio/asset-registry';
import { DetailedRenderer } from '@character-studio/renderer-detailed';
import { renderPixel } from '@character-studio/renderer-pixel';
import { decodePng, encodePng, decorateExport, createPixelSheet } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

export interface DemoApi {
  readonly recipe: CharacterRecipe;
  plan(target: RenderTarget, direction: Direction, recipe?: CharacterRecipe): RenderPlan;
  load(source: string): Promise<RgbaImage>;
  render(target: RenderTarget, direction: Direction, recipe?: CharacterRecipe): Promise<{ plan: RenderPlan; image: RgbaImage }>;
  exports(): Promise<readonly { name: string; bytes: Uint8Array }[]>;
  readonly ready: boolean;
}
declare global { interface Window { renderDemo: DemoApi } }
const urls: string[] = [];
function pngUrl(bytes: Uint8Array): string {
  const url = URL.createObjectURL(new Blob([bytes.slice().buffer], { type: 'image/png' }));
  urls.push(url); return url;
}

async function start() {
  const response = await fetch('/placeholder-assets/catalog.json');
  if (!response.ok) throw new Error('Generate the placeholder assets first with pnpm demo:assets.');
  const registry = createManifestRegistry(await response.json());
  const detailed = await DetailedRenderer.create();
  const cache = new Map<string, Promise<RgbaImage>>();
  async function load(source: string): Promise<RgbaImage> {
    assetSourceSchema.parse(source);
    let image = cache.get(source);
    if (!image) {
      image = (async () => {
        const result = await fetch(`/placeholder-assets/${source}`);
        if (!result.ok) throw new Error(`Missing PNG: ${source} (${result.status}).`);
        return decodePng(new Uint8Array(await result.arrayBuffer()));
      })();
      cache.set(source, image);
    }
    return image;
  }
  const recipe = createCharacterRecipe({ ancestry: { primary: 'elf', secondary: 'vampire' }, hair: { style: 'long-waves', colour: 'hair.silver' }, eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.crimson' }, outfit: { colour: 'outfit.ink' } });
  const frames = new Map<string, RgbaImage>();
  let ready = false;
  const api: DemoApi = {
    recipe,
    plan: (target, direction, selected = recipe) => registry.resolve(selected, target, direction), load,
    async render(target, direction, selected = recipe) {
      const plan = registry.resolve(selected, target, direction);
      const image = target === 'pixel' ? await renderPixel(plan, load) : await detailed.render(plan, load);
      return { plan, image };
    },
    async exports() {
      const output: { name: string; bytes: Uint8Array }[] = [];
      for (const target of ['pixel', 'detailed'] as const) for (const direction of DIRECTIONS) {
        const image = frames.get(`${target}/${direction}`) ?? (await api.render(target, direction)).image;
        output.push({ name: `${target}/${direction}.png`, bytes: encodePng(decorateExport(image, direction)) });
      }
      output.push({ name: 'pixel/sheet.png', bytes: encodePng(createPixelSheet(DIRECTIONS.map((direction) => ({ direction, image: frames.get(`pixel/${direction}`)! })))) });
      return output;
    },
    get ready() { return ready; },
  };
  window.renderDemo = api;
  for (const target of ['pixel', 'detailed'] as const) for (const direction of DIRECTIONS) {
    const { image } = await api.render(target, direction);
    frames.set(`${target}/${direction}`, image);
    const figure = document.createElement('figure'), caption = document.createElement('figcaption'), preview = document.createElement('img'), link = document.createElement('a');
    preview.src = pngUrl(encodePng(image)); preview.alt = `${target} ${direction} transparent render`;
    preview.width = image.width; preview.height = image.height;
    link.href = pngUrl(encodePng(decorateExport(image, direction))); link.download = `${target}-${direction}.png`; link.textContent = `${direction} · Download PNG`;
    caption.append(link); figure.append(preview, caption); document.getElementById(target)!.append(figure);
  }
  const sheet = encodePng(createPixelSheet(DIRECTIONS.map((direction) => ({ direction, image: frames.get(`pixel/${direction}`)! }))));
  (document.getElementById('sheet') as HTMLImageElement).src = pngUrl(sheet);
  const download = document.getElementById('sheet-download') as HTMLAnchorElement;
  download.href = pngUrl(sheet); download.download = 'pixel-sheet.png';
  ready = true;
  document.getElementById('status')!.textContent = 'Ready: 16 native renders and the pixel sheet.';
  window.addEventListener('pagehide', () => { for (const url of urls) URL.revokeObjectURL(url); void detailed.destroy(); }, { once: true });
}
void start().catch((error: unknown) => {
  document.getElementById('status')!.textContent = error instanceof Error ? error.message : String(error);
  console.error(error);
});
