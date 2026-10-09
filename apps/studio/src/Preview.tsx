import { useEffect, useRef, useState } from 'react';
import { NATIVE_SIZE } from '@female-character-studio/character-engine';
import type { CharacterRenderer } from '@female-character-studio/character-engine';
import { useStudioStore } from './store';

export function Preview() {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Preparing preview…');
  const rendererId = useStudioStore((state) => state.rendererId);
  const character = useStudioStore((state) => state.character);
  const renderer = useRef<CharacterRenderer | undefined>(undefined);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let instance: CharacterRenderer | undefined;
    setStatus('Preparing preview…');

    async function initialize() {
      try {
        const candidate = rendererId === 'pixi'
          ? new (await import('@female-character-studio/renderer-pixi')).PixiCharacterRenderer()
          : new (await import('@female-character-studio/renderer-canvas')).CanvasCharacterRenderer();
        if (cancelled) return;
        instance = candidate;
        await candidate.mount(element!, NATIVE_SIZE);
        if (cancelled) return;
        renderer.current = candidate;
        candidate.render({ character: useStudioStore.getState().character, size: NATIVE_SIZE });
        setStatus('Preview ready · no character assets loaded');
      } catch (error) {
        if (cancelled) return;
        instance?.destroy();
        renderer.current = undefined;
        setStatus(error instanceof Error ? error.message : 'Preview unavailable');
      }
    }

    void initialize();
    return () => {
      cancelled = true;
      instance?.destroy();
      if (renderer.current === instance) renderer.current = undefined;
    };
  }, [rendererId]);

  useEffect(() => {
    renderer.current?.render({ character, size: NATIVE_SIZE });
  }, [character]);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6" aria-labelledby="preview-title">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="preview-title" className="text-lg font-semibold">Character preview</h2>
        <span className="text-sm text-slate-400">64 × 96 native pixels</span>
      </div>
      <div className="preview-grid flex min-h-96 items-center justify-center rounded-xl border border-slate-700">
        <div ref={host} className="native-preview" />
      </div>
      <p className="mt-4 text-center font-mono text-yellow-300">{character.direction.toUpperCase()}</p>
      <p className="mt-2 text-center text-sm text-slate-400" role="status">{status}</p>
    </section>
  );
}
