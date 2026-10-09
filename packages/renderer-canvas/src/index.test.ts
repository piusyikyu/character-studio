import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCharacter, NATIVE_SIZE } from '@female-character-studio/character-engine';
import { CanvasCharacterRenderer } from './index';

afterEach(() => vi.unstubAllGlobals());

describe('Canvas renderer scaffold', () => {
  it('requires mounting before rendering', () => {
    expect(() => new CanvasCharacterRenderer().render({ character: createCharacter(), size: NATIVE_SIZE })).toThrow('Mount');
  });

  it('uses native dimensions, disables smoothing and clears transparent previews', async () => {
    const context = { imageSmoothingEnabled: true, clearRect: vi.fn() };
    const canvas = { width: 0, height: 0, getContext: vi.fn(() => context), setAttribute: vi.fn(), remove: vi.fn() };
    vi.stubGlobal('document', { createElement: vi.fn(() => canvas) });
    const host = { append: vi.fn() } as unknown as HTMLElement;
    const renderer = new CanvasCharacterRenderer();
    await renderer.mount(host, NATIVE_SIZE);
    expect(host.append).toHaveBeenCalledWith(canvas);
    expect(canvas.width).toBe(64);
    expect(canvas.height).toBe(96);
    expect(context.imageSmoothingEnabled).toBe(false);
    expect(renderer.render({ character: createCharacter(), size: NATIVE_SIZE })).toEqual({ status: 'scaffold', composedLayers: 0 });
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 64, 96);
    await expect(renderer.mount(host, NATIVE_SIZE)).rejects.toThrow('already mounted');
    renderer.destroy();
    renderer.destroy();
    expect(canvas.remove).toHaveBeenCalledTimes(1);
    expect(() => renderer.render({ character: createCharacter(), size: NATIVE_SIZE })).toThrow('Mount');
  });
});
