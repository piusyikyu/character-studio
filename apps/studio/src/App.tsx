import { createAssetRegistry } from '@female-character-studio/asset-registry';
import { DIRECTIONS, directionSchema, LAYER_SLOTS, rendererIdSchema } from '@female-character-studio/character-engine';
import { Preview } from './Preview';
import { useStudioStore } from './store';

const registry = createAssetRegistry();

export function App() {
  const character = useStudioStore((state) => state.character);
  const rendererId = useStudioStore((state) => state.rendererId);
  const setDirection = useStudioStore((state) => state.setDirection);
  const setRenderer = useStudioStore((state) => state.setRenderer);
  const reset = useStudioStore((state) => state.reset);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-300">Workspace · 0.1</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Female Character Studio</h1>
        <p className="mt-3 max-w-2xl text-slate-400">A workspace for layered characters. Choose a view and preview renderer to begin. Character assets and composition are coming next.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5" aria-labelledby="settings-title">
            <h2 id="settings-title" className="mb-5 text-lg font-semibold">View settings</h2>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="direction">Direction</label>
            <select id="direction" value={character.direction} onChange={(event) => setDirection(directionSchema.parse(event.target.value))} className="mb-5 w-full rounded-lg border border-slate-600 bg-slate-800 p-2.5">
              {DIRECTIONS.map((direction) => <option key={direction} value={direction}>{direction}</option>)}
            </select>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="renderer">Renderer</label>
            <select id="renderer" value={rendererId} onChange={(event) => setRenderer(rendererIdSchema.parse(event.target.value))} className="w-full rounded-lg border border-slate-600 bg-slate-800 p-2.5">
              <option value="pixi">PixiJS</option>
              <option value="canvas">Canvas 2D</option>
            </select>
            <button type="button" onClick={reset} className="mt-5 w-full rounded-lg border border-slate-600 px-4 py-2.5 text-sm hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-teal-300">Reset view</button>
          </section>
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5" aria-labelledby="assets-title">
            <h2 id="assets-title" className="mb-4 text-lg font-semibold">Asset library</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              {LAYER_SLOTS.map((slot) => <li key={slot} className="flex justify-between"><span className="capitalize">{slot}</span><span className="text-slate-500">{registry.list({ slot }).length} assets</span></li>)}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-slate-400">The library is empty. Add validated transparent artwork before composing a character.</p>
          </section>
        </aside>
        <Preview />
      </div>
      <footer className="mt-8 text-sm text-slate-500">PNG export is planned with a #00FF00 background and yellow direction labels.</footer>
    </main>
  );
}
