import { useEffect, useRef, useState } from 'react';
import { DIRECTIONS, RENDER_TARGET_SPECS } from '@character-studio/core';
import type { RgbaImage } from '@character-studio/render-utils';
import { describeError, useStudioStore } from './store';
import type { PreviewFrame, StudioRuntime } from './runtime';

export interface PreviewState { frames: readonly PreviewFrame[]; ready: boolean; error: string | null }
const EMPTY: PreviewState = { frames: [], ready: false, error: null };
function NativeCanvas({ image, direction, target, zoom }: { image: RgbaImage; direction: string; target: string; zoom: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (!context) return;
    context.imageSmoothingEnabled = false;
    context.putImageData(new ImageData(new Uint8ClampedArray(image.data), image.width, image.height), 0, 0);
  }, [image]);
  const displayWidth = 128 * zoom;
  return <canvas ref={canvas} width={image.width} height={image.height} style={{ width: displayWidth, height: displayWidth * 1.5 }} className={target === 'pixel' ? 'pixel-canvas' : ''} aria-label={`${target} ${direction} character preview`} />;
}
export function Preview({ runtime, onUpdate, initializationError }: { runtime: StudioRuntime | null; onUpdate(state: PreviewState): void; initializationError: string | null }) {
  const { recipe, target, direction, compare, zoom, background, setView } = useStudioStore((state) => state);
  const [result, setResult] = useState<PreviewState>(EMPTY);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setResult(EMPTY); onUpdate(EMPTY);
    if (!runtime) return;
    const facings = compare ? ['S', 'N'] as const : [direction];
    void Promise.all(facings.map((facing) => runtime.render(recipe, target, facing))).then((frames) => {
      if (cancelled) return;
      const next = { frames, ready: true, error: null }; setResult(next); onUpdate(next);
    }).catch((error: unknown) => {
      if (cancelled) return;
      const next = { frames: [], ready: false, error: describeError(error) }; setResult(next); onUpdate(next);
    });
    return () => { cancelled = true; };
  }, [runtime, recipe, target, direction, compare, retry, onUpdate]);
  const native = RENDER_TARGET_SPECS[target];
  const error = initializationError ?? result.error;
  return <section className="panel preview-panel" aria-labelledby="preview-title">
    <div className="panel-heading preview-heading"><div><p className="eyebrow">02 / PREVIEW</p><h2 id="preview-title">Character canvas</h2></div><span className="native-size">{native.width} × {native.height}<br />{native.pose}</span></div>
    <div className="preview-toolbar">
      <label className="field"><span>Renderer</span><select aria-label="Renderer" value={target} onChange={(event) => setView({ target: event.target.value as 'detailed' | 'pixel' })}><option value="detailed">Detailed</option><option value="pixel">Pixel</option></select></label>
      <label className="field"><span>Zoom</span><select aria-label="Zoom" value={zoom} onChange={(event) => setView({ zoom: Number(event.target.value) })}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{target === 'pixel' ? `${value}×` : `${value * 12.5}%`}</option>)}</select></label>
      <label className="field"><span>Preview background</span><select aria-label="Preview background" value={background} onChange={(event) => setView({ background: event.target.value as typeof background })}><option value="checker">Transparency grid</option><option value="dark">Dark</option><option value="green">Green</option></select></label>
    </div>
    <div className="direction-row" role="group" aria-label="Facing directions">{DIRECTIONS.map((facing) => <button key={facing} aria-label={`Face ${facing}`} aria-pressed={!compare && direction === facing} onClick={() => setView({ direction: facing, compare: false })}>{facing}</button>)}</div>
    <label className="check-field compare-toggle"><input type="checkbox" checked={compare} onChange={(event) => setView({ compare: event.target.checked })} />Compare S / N</label>
    <div className={`preview-stage background-${background}`} aria-busy={!result.ready && !error}>
      {result.ready ? <div className="preview-frames">{result.frames.map(({ plan, image }) => <figure key={plan.direction}><figcaption>{plan.direction} <span>{['N', 'NE', 'NW'].includes(plan.direction) ? 'Back view' : ['S', 'SE', 'SW'].includes(plan.direction) ? 'Front view' : 'Profile'}</span></figcaption><NativeCanvas image={image} direction={plan.direction} target={target} zoom={zoom} /></figure>)}</div> : <div className="preview-message"><p>{error ? 'Preview unavailable' : 'Composing character…'}</p></div>}
    </div>
    <p className="preview-status" role="status">{error ? 'Preview unavailable · see compatibility warnings' : result.ready ? `Preview ready · ${target} · ${compare ? 'S / N' : direction}` : runtime ? 'Updating preview…' : 'Loading character assets…'}</p>
    {result.error && <button className="secondary-button retry-button" onClick={() => setRetry((value) => value + 1)}>Retry preview</button>}
    <p className="hint preview-note">Temporary modular artwork · transparent native composition · exports keep native resolution</p>
  </section>;
}
