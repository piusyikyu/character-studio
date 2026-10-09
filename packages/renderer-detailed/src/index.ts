import { Application, BufferImageSource, RenderTexture, Sprite, Texture } from 'pixi.js';
import { prepareLayer, validateRenderRequest, DEFAULT_PALETTES, decorateExport, encodePng } from '@character-studio/render-utils';
import type { ImageLoader, PaletteBank, RgbaImage, ExportOptions } from '@character-studio/render-utils';
import type { RenderPlan } from '@character-studio/core';

/** Browser/WebGL compositor. Palette lookup happens before Pixi texture upload. */
export class DetailedRenderer {
  private queue: Promise<unknown> = Promise.resolve();
  private disposed = false;
  private constructor(private readonly app: Application) {}

  static async create(): Promise<DetailedRenderer> {
    const app = new Application();
    try {
      await app.init({ width: 1024, height: 1536, resolution: 1, backgroundAlpha: 0, antialias: false, autoStart: false, sharedTicker: false, preference: 'webgl' });
      return new DetailedRenderer(app);
    } catch (error) {
      if (app.renderer) app.destroy(true, { children: true });
      throw error;
    }
  }
  get canvas(): HTMLCanvasElement { return this.app.canvas as HTMLCanvasElement; }

  render(input: RenderPlan, load: ImageLoader, bank: PaletteBank = DEFAULT_PALETTES): Promise<RgbaImage> {
    const job = this.queue.then(async () => {
      if (this.disposed) throw new Error('Detailed renderer has been destroyed.');
      const plan = validateRenderRequest(input, 'detailed');
      const prepared = await Promise.all(plan.layers.map((layer) => prepareLayer(layer, load, bank)));
      for (const child of this.app.stage.removeChildren()) child.destroy({ children: true, texture: true, textureSource: true });
      prepared.forEach((image, index) => {
        const layer = plan.layers[index]!;
        // Typed-array uploads are explicitly premultiplied; WebGL pixel-store
        // premultiplication does not modify typed buffers.
        const data = image.data.slice();
        for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c]! * data[i + 3]! / 255);
        const source = new BufferImageSource({ resource: data, width: image.width, height: image.height, format: 'rgba8unorm', alphaMode: 'premultiplied-alpha', scaleMode: 'nearest', resolution: 1 });
        const sprite = new Sprite(new Texture({ source }));
        sprite.position.set(layer.position.x, layer.position.y);
        this.app.stage.addChild(sprite); // RenderPlan order is the only depth authority.
      });
      const target = RenderTexture.create({ width: 1024, height: 1536, resolution: 1 });
      try {
        this.app.renderer.render({ container: this.app.stage, target, clear: true });
        const pixels = this.app.renderer.extract.pixels({ target });
        const data = new Uint8Array(pixels.pixels);
        // Pixi v8 WebGL extraction returns premultiplied channels. Public images
        // and PNGs use straight RGBA; transparent pixels are normalized to zero.
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3]!;
          if (alpha === 0) data.fill(0, i, i + 4);
          else if (alpha !== 255) for (let c = 0; c < 3; c++) data[i + c] = Math.min(255, Math.round(data[i + c]! * 255 / alpha));
        }
        this.app.render();
        return { width: pixels.width, height: pixels.height, data };
      } finally { target.destroy(true); }
    });
    this.queue = job.catch(() => undefined);
    return job;
  }

  async exportPng(plan: RenderPlan, load: ImageLoader, options: ExportOptions = {}): Promise<Uint8Array> {
    return encodePng(decorateExport(await this.render(plan, load), plan.direction, options));
  }
  async destroy(): Promise<void> {
    await this.queue;
    if (this.disposed) return;
    this.disposed = true;
    this.app.destroy(true, { children: true, texture: true, textureSource: true });
  }
}
