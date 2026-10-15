# Asset workspace cleanup — 2026-10-13

NW part staging at `body/parts-v1/northwest/` protects five metadata-declared PNGs. Preserve five original native source partitions, settings, provenance and scratch replay plus approved NW body/head/hair dependencies. All earlier source art and current reviews stay intact; temporary composition exports and obsolete part previews are removed.

NE part staging at `body/parts-v1/northeast/` protects five metadata-declared PNGs. Preserve five original native source partitions, settings, provenance and scratch replay plus the approved NE revision-2 body/head/hair dependencies. Existing SW/SE/E/W sources remain intact; temporary composition exports and obsolete part previews are removed.

SW part staging at `body/parts-v1/southwest/` protects five metadata-declared PNGs. Preserve its five native source partitions, settings, provenance and scratch replay, plus the approved revision-5 fabric and revision-4 head/hair dependencies. Existing SE/E/W sources stay intact; temporary composition exports and obsolete part previews are removed.

SE part staging at `body/parts-v1/southeast/` protects five metadata-declared PNGs and removes obsolete previews. Preserve five native source partitions, settings, provenance and scratch replay. The approved SE revision-2 body/hands and all earlier E/W sources remain protected; temporary composition exports are removed after validation.

W visible-part staging at `body/parts-v1/west/` protects five metadata-declared PNGs and removes obsolete previews. Preserve its three original W source partitions plus settings, provenance and scratch replay. Far-side entries create no blank source images. All approved E inputs and review outputs remain protected.

E visible-part staging at `body/parts-v1/east/` protects five metadata-declared PNGs. Three source RGBA partitions and their settings/provenance/replay remain retained; occluded far-side slots create no blank source PNGs. Temporary baseline/part exports are removed after validation.

SW colour revision 5 keeps its selected colour study, native edit/SE guides, bounded fabric body/mask, settings/prompts and scratch replay. Current southwest staging protects six metadata-declared PNGs including the old/new clothing comparison. Superseded eye/hair inspection previews are regenerable from retained revision 4. All three versioned all-eight selections and their source pins remain retained; current metadata protects the current sheets/viewer. The explicit revision-5 SW colour approval is retained.

The current all-eight body review at `body/assembly-v1/` protects two metadata-declared native PNG sheets and its interactive viewer. Its source selection pins the eight individually approved native body configurations and approvals. Temporary component review exports are removed after validation, so no duplicate per-facing fits are retained in the consolidated folder. All approved source art and replay inputs remain protected.

NW is approved in `review-fit-nw-v1.json`. Preserve all six current nested review PNGs and pinned native source/replay inputs; next consolidate the eight individually approved body studies. Older candidate entries below are historical.

Current NW body review is metadata-protected in `body/back-diagonals-v1/northwest/`, including all six exported PNGs. Retain its native source pack, selected study/guide inputs, masks/settings/prompts and scratch replay, along with approved NE/source derivations. Reuse the existing N guide; discarded generation attempts and obsolete build/review output are not source dependencies.

NE revision 2 is approved in `review-fit-ne-v2.json`. Cleanup preserves all six current metadata-declared review PNGs and every pinned source/guide/replay input, while removing regenerable build files. Next is independently authored NW. Earlier candidate notes below are historical.

Current NE revision-2 proportion review protects six metadata-declared PNGs, including `inspection/NE-proportion-comparison.png`. Keep the selected v2 study, N/SE/old-NE prompt/comparison guides, native layers/masks, settings/prompts and scratch replay, plus pinned revision-1 sources. Historical review outputs are regenerable; original approved source art is unchanged. Older NE entries below are historical.

Current NE study retains its selected body study, exact head guide, four native
derived layers/masks, settings, prompts and scratch replay. Five metadata-declared
NE review PNGs are protected under `body/back-diagonals-v1/`. The resolved pending
JSON checkpoint was removed after generation succeeded; its failed-attempt
provenance is retained with the selected study. Approved source art is unchanged.


NE authoring returned no usable image after two output-stage tool rejections.
The unused native head guide copy was removed; only the pending JSON checkpoint
and tested offline pipeline remain. Future NE current review metadata is now
protected by cleanup; no placeholder or NE artwork was published.


SW revision-4 body/head/hair fit is approved in `review-fit-sw-v4.json`.
Current layers and their pinned previous derivation inputs stay retained. Next
is the independently authored NE body; Step 6C remains open and Step 6D has not
started. Older candidate status below is historical.


Current SW contour review selects `authoring-sw-v4.json`. Keep its selected head
and rear-detail studies, native head guide and enlarged rear guide, nine derived
layer/mask outputs, settings/provenance and scratch replay. Current six metadata
PNG exports remain protected. Historical revision-3 previews are regenerable;
all pinned previous source inputs remain retained. Discarded imagegen studies
are not repository dependencies.


Current SW hair fit selects `authoring-sw-v3.json`. Preserve its revision-2
eye/body baseline, new native assembly guide and local hair study, six source
layers/masks, settings/provenance, eye-feedback record and scratch replay script.
Current six metadata-declared PNGs remain protected. Historical `--southwest-v2`
previews are regenerable; neither prior source revision is deleted.

Current SW correction selects `authoring-sw-v2.json`. Preserve the qualified
revision-1 body feedback and config/body/neck baselines, native eye guide/study,
selected complete eye, local front/rear derivatives, masks/settings/provenance
and scratch replay scripts. The metadata-protected eye/hair comparison is current;
`--southwest-v1` exports are historical and regenerable. No approved source is
overwritten or deleted by the bounded correction.

SW body candidate: cleanup protects current metadata-declared outputs under
`body/front-diagonals-v1/southwest/`. The selected independent study, native head
guide, body/mask, posed neck/mask, pinned config/settings/prompt and scratch replay
script are required source inputs. Rebuild with
`pnpm body:review:front-diagonals:southwest`; accepted SE baselines stay retained.
The superseded untracked generation-blockage note was removed after successful
SW authoring; the selected prompt/provenance is in `prompts-sw-v1.json`.

Current SE body candidate: cleanup protects metadata-declared outputs/metadata
under `body/front-diagonals-v1/`. Retain its native SE study, accepted head guide,
manual masks/settings/config/provenance, bounded pose-neck derivative, revision-2
hand envelopes/body/mask and scratch replay scripts. Revision-1 body/config remain
pinned derivation inputs. Current native hand comparisons are metadata-protected. `pnpm body:review:front-diagonals` rebuilds current outputs.
Accepted S/N/E/W source artwork and reviews remain protected.

Current W profile body candidate: cleanup additionally protects metadata-declared
outputs and metadata under the nested `body/profiles-v1/west/` review. The accepted
E review remains protected at the parent root. Retain W's own selected study,
head guide, masks/settings/config/provenance, bounded pose-neck derivative and
scratch-only replay scripts, revision-2 hair layers and local transfer/discard
masks, and pinned revision-1 config/art. Rebuild W with `pnpm body:review:profiles:west`;
unselected generated variants and obsolete views remain removable.

Approved E body study: cleanup protects metadata-declared PNGs/metadata under
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
