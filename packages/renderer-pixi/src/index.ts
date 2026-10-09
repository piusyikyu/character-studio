import { pixelSizeSchema, validateRenderRequest } from '@female-character-studio/character-engine';
import type { CharacterRenderer, PixelSize, RenderRequest, RenderResult } from '@female-character-studio/character-engine';
import { Application } from 'pixi.js';

export class PixiCharacterRenderer implements CharacterRenderer {
  readonly id = 'pixi';
  private application: Application | undefined;
  private mounting = false;
  private generation = 0;

  async mount(host: HTMLElement, size: PixelSize): Promise<void> {
    if (this.application || this.mounting) throw new Error('Pixi renderer is already mounted.');
    const dimensions = pixelSizeSchema.parse(size);
    const generation = ++this.generation;
    this.mounting = true;
    const app = new Application();
    try {
      await app.init({
        ...dimensions,
        backgroundAlpha: 0,
        antialias: false,
        resolution: 1,
        roundPixels: true,
        autoStart: false,
        preference: 'webgl',
      });
      if (generation !== this.generation) {
        app.destroy(true, { children: true });
        return;
      }
      app.canvas.setAttribute('aria-label', 'Empty character preview');
      host.append(app.canvas);
      this.application = app;
    } catch (error) {
      // Failed initialization may leave an Application without a renderer.
      if (app.renderer) app.destroy(true, { children: true });
      throw error;
    } finally {
      if (generation === this.generation) this.mounting = false;
    }
  }

  render(request: RenderRequest): RenderResult {
    if (!this.application) throw new Error('Mount the Pixi renderer before rendering.');
    const { size } = validateRenderRequest(request);
    this.application.renderer.resize(size.width, size.height);
    this.application.render();
    return { status: 'scaffold', composedLayers: 0 };
  }

  destroy(): void {
    ++this.generation;
    this.mounting = false;
    this.application?.destroy(true, { children: true });
    this.application = undefined;
  }
}
