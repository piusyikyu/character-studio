import { useCallback, useEffect, useState } from 'react';
import { DIRECTIONS, EXAMPLE_CHARACTER_RECIPES } from '@character-studio/core';
import { Preview } from './Preview';
import type { PreviewState } from './Preview';
import { CharacterControls, PaletteControls, optionLabel } from './CharacterControls';
import { describeError, studioStore, useStudioStore } from './store';
import { downloadFile, StudioRuntime } from './runtime';

export function App() {
  const state = useStudioStore((current) => current);
  const [runtime, setRuntime] = useState<StudioRuntime | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [preview, setPreview] = useState<PreviewState>({ frames: [], ready: false, error: null });
  const [selectedLayer, setSelectedLayer] = useState('');
  const [presetName, setPresetName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [json, setJson] = useState('');
  const [transparent, setTransparent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const report = useCallback((error: unknown) => studioStore.getState().setWarning(describeError(error)), []);

  useEffect(() => {
    let cancelled = false;
    let instance: StudioRuntime | undefined;
    setInitializationError(null); setRuntime(null);
    void StudioRuntime.create().then(async (candidate) => {
      if (cancelled) { await candidate.destroy(); return; }
      instance = candidate;
      studioStore.getState().connectCatalog(candidate.registry.catalogVersion, candidate.validate);
      setRuntime(candidate);
    }).catch((error: unknown) => { if (!cancelled) setInitializationError(describeError(error)); });
    return () => { cancelled = true; studioStore.getState().disconnectCatalog(); void instance?.destroy(); };
  }, [attempt]);
  useEffect(() => {
    try { studioStore.getState().hydratePresets(localStorage); } catch (error) { report(error); }
    const keyboard = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || (event.target instanceof HTMLElement && (event.target.matches('input, textarea, select') || event.target.isContentEditable))) return;
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) studioStore.getState().redo(); else studioStore.getState().undo(); }
      else if (event.key.toLowerCase() === 'y') { event.preventDefault(); studioStore.getState().redo(); }
    };
    window.addEventListener('keydown', keyboard); return () => window.removeEventListener('keydown', keyboard);
  }, [report]);

  const disabled = !runtime || busy;
  const plan = preview.frames[0]?.plan;
  const layerKey = (layer: NonNullable<typeof plan>['layers'][number]) => `${layer.assetId}/${layer.frameId}`;
  const layer = plan?.layers.find((item) => layerKey(item) === selectedLayer) ?? plan?.layers.at(-1);
  const warning = initializationError ?? preview.error ?? state.warning;
  async function exportImage(sheet: boolean) {
    if (!runtime || !preview.ready || busy) return;
    const { recipe, target, direction } = studioStore.getState();
    setBusy(true); setNotice('Exporting native PNG…');
    try {
      const bytes = sheet ? await runtime.exportSheet(recipe, { transparent }) : await runtime.exportPng(recipe, target, direction, { transparent });
      downloadFile(sheet ? 'character-pixel-sheet.png' : `character-${target}-${direction}.png`, bytes, 'image/png');
      setNotice(sheet ? 'Pixel sheet exported · 512 × 384 · N NE E SE / S SW W NW' : `Exported ${target} ${direction} PNG`);
    } catch (error) { report(error); setNotice('Export failed. See compatibility warnings.'); }
    finally { setBusy(false); }
  }
  function exportJson() {
    try { const document = state.exportJson(); setJson(document); downloadFile('character.json', document, 'application/json'); setNotice('Character JSON exported with catalog version.'); }
    catch (error) { report(error); }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('Character JSON is too large. Select a file smaller than 1 MB.');
      const document = await file.text(); setJson(document);
      if (studioStore.getState().importJson(document)) setNotice('Imported character JSON.');
    } catch (error) { report(error); }
  }
  return <main className="studio-shell">
    <header className="studio-header"><div><p className="eyebrow">CHARACTER WORKSPACE / 0.1</p><h1>Female Character Studio</h1><p className="header-description">One character. Eight facings. Two native render targets.</p></div>
      <div className="history-tools"><button disabled={!state.past.length || disabled} onClick={state.undo} title="Ctrl / Cmd + Z">Undo</button><button disabled={!state.future.length || disabled} onClick={state.redo} title="Ctrl / Cmd + Shift + Z">Redo</button><button disabled={disabled} onClick={state.reset}>Reset character</button></div>
    </header>
    <div className="creation-bar"><fieldset disabled={disabled} className="random-tools"><label className="field"><span>Random seed</span><input value={state.seed} onChange={(event) => state.setSeed(event.target.value)} /></label><button className="primary-button" onClick={state.randomize}>Randomize</button></fieldset>
      <label className="field examples"><span>Example character</span><select aria-label="Example character" disabled={disabled} value="" onChange={(event) => { const example = EXAMPLE_CHARACTER_RECIPES.find((item) => item.id === event.target.value); if (example) state.applyRecipe(example.recipe); }}><option value="">Load an example…</option>{EXAMPLE_CHARACTER_RECIPES.map((example) => <option key={example.id} value={example.id}>{optionLabel(example.id)}</option>)}</select></label>
      <p className="catalog-status">{state.catalogVersion ? `Catalog ${state.catalogVersion} · placeholder artwork` : 'Loading catalog…'}</p>
    </div>
    <div className="studio-panels">
      <CharacterControls disabled={disabled} />
      <Preview runtime={runtime} onUpdate={setPreview} initializationError={initializationError} />
      <aside className="panel inspector-panel" aria-label="Palettes and export">
        <div className="panel-heading"><p className="eyebrow">03 / INSPECTOR</p><h2>Colour & output</h2></div>
        <PaletteControls disabled={disabled} />
        <section className="control-section layer-section"><h3>Selected layer{plan ? ` · ${plan.direction}` : ''}</h3>
          {plan && layer ? <><label className="field"><span>Visible layer</span><select aria-label="Visible layer" value={layerKey(layer)} onChange={(event) => setSelectedLayer(event.target.value)}>{plan.layers.map((item, index) => <option key={layerKey(item)} value={layerKey(item)}>{index + 1}. {item.plane} · {item.frameId}</option>)}</select></label>
            <dl className="layer-info"><dt>Asset</dt><dd>{layer.assetId} / v{layer.assetVersion}</dd><dt>Plane</dt><dd>{layer.plane}</dd><dt>Attach</dt><dd>{layer.attachTo}</dd><dt>Position</dt><dd>{layer.position.x}, {layer.position.y}</dd><dt>Size</dt><dd>{layer.size.width} × {layer.size.height}</dd><dt>Source</dt><dd>{layer.sprite}</dd></dl><p className="hint">{plan.layers.length} visible layers · draw order follows the facing.</p></> : <p className="hint">Layer details appear when the preview is ready.</p>}
        </section>
        <section className={`control-section compatibility ${warning ? 'has-warning' : ''}`} aria-labelledby="compatibility-title"><h3 id="compatibility-title">Compatibility</h3>
          {warning ? <><p role="alert" className="warning-text">{warning}</p>{initializationError ? <button onClick={() => setAttempt((value) => value + 1)}>Reload assets</button> : state.warning && !preview.error ? <button onClick={() => state.setWarning(null)}>Dismiss warning</button> : null}</> : <p className="hint">{preview.ready ? 'Current character is compatible with the loaded catalog.' : 'Checking character and asset coverage…'}</p>}
        </section>
        <fieldset disabled={disabled} className="control-section export-section"><legend>Export</legend>
          <label className="check-field"><input type="checkbox" checked={transparent} onChange={(event) => setTransparent(event.target.checked)} />Transparent export background</label>
          <p className="hint">Default: pure green background and yellow direction labels. Preview background and zoom do not affect exports.</p>
          <button className="primary-button full-width" disabled={!preview.ready} onClick={() => void exportImage(false)}>Export {state.target === 'pixel' ? 'pixel' : 'detailed'} PNG · {state.direction}</button>
          <button className="secondary-button full-width" disabled={!preview.ready} onClick={() => void exportImage(true)}>Export pixel sprite sheet</button>
          <button className="secondary-button full-width" onClick={exportJson}>Export character JSON</button>
        </fieldset>
        <fieldset disabled={disabled} className="control-section"><legend>Character presets</legend>
          <label className="field"><span>Preset name</span><input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="My character" maxLength={80} /></label>
          <button className="secondary-button full-width" disabled={!presetName.trim()} onClick={() => { try { if (state.savePreset(presetName, localStorage)) { setSavedName(presetName.trim()); setNotice('Preset saved in this browser.'); } } catch (error) { report(error); } }}>Save preset</button>
          <label className="field saved-presets"><span>Saved preset</span><select aria-label="Saved preset" value={savedName} onChange={(event) => setSavedName(event.target.value)}><option value="">Select a saved preset…</option>{state.presets.map((preset) => <option key={preset.name} value={preset.name}>{preset.name}</option>)}</select></label>
          <div className="button-pair"><button disabled={!savedName} onClick={() => { if (state.loadPreset(savedName)) setNotice('Preset loaded.'); }}>Load preset</button><button disabled={!savedName} onClick={() => { try { state.deletePreset(savedName, localStorage); setSavedName(''); } catch (error) { report(error); } }}>Delete preset</button></div>
        </fieldset>
        <fieldset disabled={disabled} className="control-section"><legend>Import JSON</legend>
          <label className="field"><span>Character JSON file</span><input type="file" accept=".json,application/json" onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ''; }} /></label>
          <label className="field"><span>JSON document</span><textarea aria-label="JSON document" value={json} onChange={(event) => setJson(event.target.value)} rows={5} placeholder="Paste a character recipe or exported preset document" /></label>
          <button className="secondary-button full-width" disabled={!json.trim()} onClick={() => { if (state.importJson(json)) setNotice('Imported character JSON.'); }}>Import JSON</button>
        </fieldset>
        <p className="operation-notice" aria-live="polite">{busy ? 'Exporting native PNG…' : notice}</p>
      </aside>
    </div>
    <footer className="studio-footer"><span>Native detailed 1024 × 1536 · pixel 128 × 192</span><span>{DIRECTIONS.length} independently authored facings · production artwork pending approval</span></footer>
  </main>;
}
