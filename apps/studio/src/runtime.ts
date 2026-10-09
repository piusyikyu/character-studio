import { assetSourceSchema, DIRECTIONS, RENDER_TARGETS } from '@character-studio/core';
import type { CharacterRecipe, Direction, RenderPlan, RenderTarget } from '@character-studio/core';
import { createManifestRegistry } from '@character-studio/asset-registry';
import type { ManifestRegistry } from '@character-studio/asset-registry';
import { DetailedRenderer } from '@character-studio/renderer-detailed';
import { exportPixelSheet, renderPixel } from '@character-studio/renderer-pixel';
import { decodePng, decorateExport, encodePng } from '@character-studio/render-utils';
import type { ExportOptions, RgbaImage } from '@character-studio/render-utils';

export interface PreviewFrame { plan: RenderPlan; image: RgbaImage }

/** Owns one WebGL renderer and an immutable source cache, independent of React. */
export class StudioRuntime {
  private images = new Map<string, Promise<RgbaImage>>();
  private detailed: Promise<DetailedRenderer> | undefined;
  private disposed = false;
  private constructor(readonly registry: ManifestRegistry) {}
  static async create(): Promise<StudioRuntime> {
    const response = await fetch('/placeholder-assets/catalog.json');
    if (!response.ok) throw new Error('Character assets are unavailable. Run pnpm demo:assets in WSL, then reload the studio.');
    return new StudioRuntime(createManifestRegistry(await response.json()));
  }
  validate = (recipe: CharacterRecipe): void => {
    for (const target of RENDER_TARGETS) for (const direction of DIRECTIONS) this.registry.resolve(recipe, target, direction);
  };
  load = (source: string): Promise<RgbaImage> => {
    assetSourceSchema.parse(source);
    let pending = this.images.get(source);
    if (!pending) {
      pending = (async () => {
        const response = await fetch(`/placeholder-assets/${source}`);
        if (!response.ok) throw new Error(`Missing character layer: ${source}. Restore the asset package with pnpm demo:assets and retry.`);
        return decodePng(new Uint8Array(await response.arrayBuffer()));
      })();
      this.images.set(source, pending);
      void pending.catch(() => this.images.delete(source));
    }
    return pending;
  };
  private renderer(): Promise<DetailedRenderer> {
    if (!this.detailed) this.detailed = DetailedRenderer.create().then(async (renderer) => {
      if (this.disposed) { await renderer.destroy(); throw new Error('The studio preview was closed.'); }
      return renderer;
    }).catch((error: unknown) => { this.detailed = undefined; throw error; });
    return this.detailed;
  }
  async render(recipe: CharacterRecipe, target: RenderTarget, direction: Direction): Promise<PreviewFrame> {
    if (this.disposed) throw new Error('The studio preview was closed.');
    const plan = this.registry.resolve(recipe, target, direction);
    const image = target === 'pixel' ? await renderPixel(plan, this.load) : await (await this.renderer()).render(plan, this.load);
    return { plan, image };
  }
  async exportPng(recipe: CharacterRecipe, target: RenderTarget, direction: Direction, options: ExportOptions): Promise<Uint8Array> {
    const { image } = await this.render(recipe, target, direction);
    return encodePng(decorateExport(image, direction, options));
  }
  exportSheet(recipe: CharacterRecipe, options: ExportOptions): Promise<Uint8Array> {
    return exportPixelSheet(DIRECTIONS.map((direction) => this.registry.resolve(recipe, 'pixel', direction)), this.load, options);
  }
  async destroy(): Promise<void> {
    this.disposed = true;
    const renderer = await this.detailed?.catch(() => undefined);
    await renderer?.destroy();
    this.images.clear();
  }
}

export function downloadFile(name: string, data: string | Uint8Array, type: string): void {
  const blob = new Blob([typeof data === 'string' ? data : data.slice().buffer], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = name;
  document.body.append(link); link.click(); link.remove();
  // Give the browser time to begin reading the download before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
