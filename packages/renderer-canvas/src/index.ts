import { pixelSizeSchema, validateRenderRequest } from '@character-studio/character-engine';
import type { CharacterRenderer, PixelSize, RenderRequest, RenderResult } from '@character-studio/character-engine';

export class CanvasCharacterRenderer implements CharacterRenderer {
  readonly id = 'canvas';
  private canvas: HTMLCanvasElement | undefined;
  private context: CanvasRenderingContext2D | undefined;

  async mount(host: HTMLElement, size: PixelSize): Promise<void> {
    if (this.canvas) throw new Error('Canvas renderer is already mounted.');
    const dimensions = pixelSizeSchema.parse(size);
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable.');
    context.imageSmoothingEnabled = false;
    canvas.setAttribute('aria-label', 'Empty character preview');
    host.append(canvas);
    this.canvas = canvas;
    this.context = context;
  }

  render(request: RenderRequest): RenderResult {
    if (!this.canvas || !this.context) throw new Error('Mount the Canvas renderer before rendering.');
    const { size } = validateRenderRequest(request);
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    this.context.imageSmoothingEnabled = false;
    this.context.clearRect(0, 0, size.width, size.height);
    return { status: 'scaffold', composedLayers: 0 };
  }

  destroy(): void {
    this.canvas?.remove();
    this.canvas = undefined;
    this.context = undefined;
  }
}
