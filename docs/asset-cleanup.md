# Asset workspace cleanup — 2026-10-13

Current E body candidate: cleanup protects metadata-declared PNGs/metadata under
`body/profiles-v1/`. Retain the selected native E study, exact accepted head guide,
manual masks/settings, bounded pose-neck layer and scratch replay script.
Historical generated-image paths are provenance only. Unselected drafts and
obsolete generated views are removable; rebuild current E outputs through
`pnpm body:review:profiles`. All accepted S/N studies/parts remain protected.

Current N part candidate: cleanup protects metadata-declared previews and metadata
under `body/parts-v1/north/`, in addition to both accepted body reviews and S
parts. The nested N source pack retains only five selected layers, pinned
settings/config/provenance and scratch authoring replay; S sources stay intact.
Rebuild current N part outputs with `pnpm body:review:parts:north`.

Current N body candidate: cleanup protects metadata-declared outputs and metadata
under `body/north-v1/`, alongside both accepted S body/part reviews. Retain the
selected native study, manual silhouettes/settings, accepted head guide, bounded
neck derivative/mask and scratch replay script. Historical external generated
paths in prompt records are not dependencies. Rebuild the current four PNGs
through `pnpm body:review:north`; obsolete generated previews remain removable.

Current S part study (2026-10-14): cleanup protects metadata-declared outputs
and metadata under `body/parts-v1/`, alongside the approved revision-6 body
review. Five source layers, pinned configuration/settings/provenance and the
scratch-only authoring script remain required inputs. Obsolete part previews
are regenerable with `pnpm body:review:parts`; no approved source is removed.

Current S body study: cleanup also protects the metadata-declared previews
and metadata under `body/reference-v1/`. The local study/head guide, selected
body/masks, revision-2 torso study, revision-3 local joint study/guide, pose-specific
head derivative, revision-4 local neck shading study/mask/guide and scratch
replay scripts, revision-4 qualified approval and revision-5 curl masks/settings
and revision-6 local spill mask/settings are necessary source dependencies.
Revisions 1–5 remain pinned repair baselines. Their historical previews are
regenerable; current revision-6 metadata-declared outputs stay protected. Coarse
unselected silhouette drafts remain outside the source pack.


Current approved complete-brow review: cleanup protects `face/reference-v1/brows/` metadata-
declared outputs alongside the consolidated head sheets and existing nine reviews.
Selected source studies and native guides remain required derivation inputs.
Unselected W hair output remains outside the source pack; its failed whole-layer
changes are recorded in prompt history and are not dependencies.

Current SE review: facial revision 6 supersedes the revision-5 previews in the
current staging folder. Cleanup retains the metadata-declared brow comparisons,
native fit/layer/mask outputs and consolidated sheets; obsolete eye-comparison
previews can rebuild with `face:review:front-diagonals:v5`. The accepted full-eye
source, scoped approval record and all required derivation baselines are retained.

Local commit `831093c` preserves the face investigation before cleanup. It records
work in progress, not artwork approval. Face revision 4 and its neck-side seams
remain under review; Step 6C is unfinished and Step 6D has not started.

Source and staging packs now share this layout beneath `heroine-v1/`:

| Previous folder | Current folder |
| --- | --- |
| `hair-long-waves-v1` | `hair/long-waves-v1` |
| `head-soft-oval-v1` | `head/soft-oval-v1` |
| `ears-human-v1` | `ears/human-v1` |
| `face-reference-v1` | `face/reference-v1` |
| `reference-import-v1` (staging) | `references/import-v1` |

Asset IDs, native coordinates, pixels, relative derivation paths, configuration
bytes and approval hashes are unchanged. CLI defaults, integration fixtures and
authoring scripts use the new directories. Immutable prompt/guide JSON can still
record old full paths: interpret those through this table. The eye-fit guide
replay resolves its historical ear path explicitly. Raw flattened references
remain in `assets/references/heroine-v1/detailed/`.

Five unselected/reproducible images and three abandoned mask drafts were removed
from the working tree. Their exact original paths, hashes and reasons appear in
[asset-cleanup-manifest.json](asset-cleanup-manifest.json). Recover an individual
file from the checkpoint with `git show 831093c:<original-path>` if needed.
Selected studies, guides, masks, approval records and earlier revisions needed
for pinned derivations remain on disk. Historical prompt descriptions of
rejected attempts remain useful even when the unselected image is archived.

## Generated data

```bash
pnpm assets:clean --dry-run
pnpm assets:clean
pnpm assets:clean --build-outputs
```

The cleanup command removes generated placeholder assets, obsolete staging
previews, render-demo exports and test reports. `--build-outputs` also removes
workspace `dist` folders. It preserves the current S face review's declared outputs
and interactive viewer, plus the current SE/SW and E/W face reviews' declared
outputs, the current E/W, SE/SW, NE/NW and N ear-review outputs, the dedicated N anatomy review and three consolidated head sheets,
eight native transparent references
and their import metadata/audit.
Source/reference artwork, dependencies, legacy packages and Git
history are outside its deletion targets. Unsafe metadata paths or symlinks
abort before deletion. If current face metadata is missing, its entire staging
folder is retained.

The retained S viewer is
`assets/staging/heroine-v1/face/reference-v1/inspection/head-reference-overlay.html`.
The E/W, SE/SW, NE/NW and N ear anatomy/fit reviews are retained under
`assets/staging/heroine-v1/ears/human-v1/{profiles,front-diagonals,back-diagonals,north}/`.
The compact eight-facing head review is retained under
`assets/staging/heroine-v1/head/assembly-v1/` (three sheets and metadata).
The dedicated N anatomy review is retained under
`assets/staging/heroine-v1/head/soft-oval-v1/north/`.
The current SE/SW and E/W facial overviews/comparisons are retained in
`front-diagonals/` and `profiles/` below that face-review root. Other review
previews are intentionally absent after cleanup. Rebuild them with
the existing `hair:review`, `head:review`, `ears:review` or historical face commands;
`pnpm reference:import` rebuilds reference contact sheets and inspection outputs.
Normal review commands consume retained transparent references. `pnpm dev` and
`pnpm build` regenerate temporary runtime assets automatically.

Run authoring replays in an isolated scratch copy. Keep approved/versioned source
layers intact and continue human visual review; cleanup does not resolve mask
defects or certify production assets. This reduces workspace disk use, while
the checkpoint and earlier artwork remain recoverable in local Git history.

## Verification

Root `pnpm typecheck`, `pnpm lint` (zero warnings), `pnpm build`,
`pnpm exec vitest run --maxWorkers=1` (45 tests across 14 files) and
`pnpm test:e2e` (six Chromium workflows) passed. The cleanup integration workflow
also passed after the final utility edits. Current and historical-v3 face CLI
exports retained their pre-refactor fit hashes; the offline browser check passed
for both viewers. An isolated revision-4 authoring replay reproduced all 21
selected outputs. All 416 retained source PNG/JSON hashes and mtimes were unchanged.

The applied cleanup removed 3,395 generated files (303.1 MiB); the eight archived
source drafts total another 1.7 MiB. Asset-directory disk usage fell from about
412 MiB to 107 MiB, with staging at 23 MiB. All 47 declared current face outputs,
its viewer and eight transparent references survived. A subsequent dry run
found zero additional files to remove. Build caches were removed after validation;
normal commands rebuild them when needed.
