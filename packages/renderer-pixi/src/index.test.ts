import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCharacter, NATIVE_SIZE } from '@character-studio/character-engine';

const mock = vi.hoisted(() => ({
  init: vi.fn<() => Promise<void>>(), destroy: vi.fn(), render: vi.fn(), resize: vi.fn(),
  canvas: { setAttribute: vi.fn() },
}));

vi.mock('pixi.js', () => ({
  Application: class {
    init = mock.init;
    destroy = mock.destroy;
    render = mock.render;
    canvas = mock.canvas;
    renderer = { resize: mock.resize };
  },
}));

import { PixiCharacterRenderer } from './index';

beforeEach(() => mock.init.mockResolvedValue(undefined));

describe('Pixi renderer lifecycle', () => {
  it('initializes v8 asynchronously with transparent native pixels', async () => {
    const host = { append: vi.fn() } as unknown as HTMLElement;
    const renderer = new PixiCharacterRenderer();
    await renderer.mount(host, NATIVE_SIZE);
    expect(mock.init).toHaveBeenCalledWith(expect.objectContaining({ width: 64, height: 96, backgroundAlpha: 0, resolution: 1, antialias: false, roundPixels: true, autoStart: false }));
    expect(host.append).toHaveBeenCalledWith(mock.canvas);
    expect(renderer.render({ character: createCharacter(), size: NATIVE_SIZE })).toEqual({ status: 'scaffold', composedLayers: 0 });
    expect(mock.resize).toHaveBeenCalledWith(64, 96);
    renderer.destroy();
    renderer.destroy();
    expect(mock.destroy).toHaveBeenCalledTimes(1);
  });

  it('disposes an initialization that finishes after unmounting', async () => {
    let finish!: () => void;
    mock.init.mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
    const host = { append: vi.fn() } as unknown as HTMLElement;
    const renderer = new PixiCharacterRenderer();
    const mounting = renderer.mount(host, NATIVE_SIZE);
    renderer.destroy();
    finish();
    await mounting;
    expect(host.append).not.toHaveBeenCalled();
    expect(mock.destroy).toHaveBeenCalledTimes(1);
    expect(() => renderer.render({ character: createCharacter(), size: NATIVE_SIZE })).toThrow('Mount');
  });

  it('releases initialized resources and allows retry after a failure', async () => {
    mock.init.mockRejectedValueOnce(new Error('WebGL unavailable'));
    const host = { append: vi.fn() } as unknown as HTMLElement;
    const renderer = new PixiCharacterRenderer();
    await expect(renderer.mount(host, NATIVE_SIZE)).rejects.toThrow('WebGL unavailable');
    expect(mock.destroy).toHaveBeenCalledTimes(1);
    await renderer.mount(host, NATIVE_SIZE);
    expect(host.append).toHaveBeenCalledTimes(1);
    renderer.destroy();
  });
});
