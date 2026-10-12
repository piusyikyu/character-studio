# Female Character Studio — Project Context and Handoff

> Purpose: This file transfers the **requirements and decisions** from a ChatGPT planning conversation into the WSL2/VS Code Codex development workflow. It is project context, **not** proof that any implementation is complete. Review actual repository files and tests before assuming a feature exists.

## Post-move SE/SW review — 2026-10-12

**Latest decision:** The user approved revision 4 for now and requested a local
commit followed by the next Step 6C increment. Abrupt hair starts in the circled
neck/shoulder area are accepted in this detached head/hair review because the
future body should cover them. `front-diagonals-review-fit-v4.json` pins this
qualified approval. Actual body occlusion remains unverified: check these starts
with real same-facing body/clothing layers, preserving correct front/rear hair
depth, and version any remaining visible defects. Do not erase valid hair now
or treat a detached overview as proof of finished body fit. The next increment
is independently authored NE/NW head/neck anatomy, with no visible eyes. Final
Step 6C and Step 6D approval remain outstanding.

The new-machine read-only audit confirmed all 424 transported checkpoint files,
the selected source configurations, eight original/transparent references and
123 current head-review PNG hashes. The temporary `wip` commit was already undone:
HEAD is `62847da`, with its transported changes retained in the working tree.

The user generally approved the SE/SW revision-3 fit, but circled abrupt hair at
SW's neck. `front-diagonals-review-fit-v3.json` records that limited approval and
remaining issue. It does not certify complete production anatomy or Step 6C.

Revision 4 clears one detached 157-pixel foreground fragment at native
x466–475/y263–286. Every selected RGBA pixel already exists identically in the
rear, behind head/neck skin. Rear hair, anatomy, SE, nose pixels and anchors remain
unchanged. This is a depth correction, with no new image generation or broad
colour cleanup. Other seams in the circled region still need visual review.

`pnpm head:review:front-diagonals` now selects
`head-soft-oval-v1/front-diagonals-authoring-v4.json`; its current overview stays at
`assets/staging/heroine-v1/head-soft-oval-v1/front-diagonals/overview.png`.
`pnpm head:review:front-diagonals:v3` retains the accepted checkpoint separately.
The comparison shows reference / revision 3 / revision 4. The latest qualified
approval above supersedes the prior pending-review state. S/N v5 and E/W v3
selections are unchanged.
Step 6C remains unfinished; Step 6D has not started.

## Machine-move checkpoint — 2026-10-10

This section describes the current handoff. The dated entries below retain
historical decisions, rejected drafts and superseded command defaults.

The user requested a temporary local commit with the exact subject `wip` to
preserve the current work while moving machines. Its parent is `62847da`
(`feat: add approved profile head and hair fit`). The checkpoint includes the
SE/SW revision-1, revision-2 and revision-3 source studies, masks, authoring
scripts, configurations, prompt records and audits, plus the asset-validator
changes and documentation. It records work in progress, not visual approval.
The user intends to undo the temporary commit after the move; retain the files
when doing so. Do not push, publish branches or create pull requests.

### Implementation and approval status

- MVP milestones 1–4 are implemented using the temporary geometric catalog:
  core recipe/contracts, asset resolution, independent renderers and studio UI.
  Real heroine artwork is still an offline authoring/review pipeline and is not
  the editor's runtime catalog. Preserve the separate legacy 64×96 demo packages.
- Steps 6A–6B have repeatable reference validation, transparent staging,
  measurements, candidate anchors and source-preservation tests. Human review
  of matte edges, uncertain regions, anchors and baseline inconsistency remains
  open in `docs/mvp.md`; do not mark full acceptance from generated files alone.
- Step 6C is in progress. All eight hairstyle designs have recorded approvals,
  with incomplete concealed hair and production rig/T-pose compatibility.
  S fit revision 5 is generally approved with known hair noise; N is an anatomy
  draft. E/W standing-reference fit revision 3 is approved with minor W overview
  ear pixelation acknowledged. These are limited fit checkpoints.
- The latest SE/SW head fit is revision 3. SE reuses revision-2 head/neck/front
  layers and assembled fit byte-for-byte. SW has local nose/jaw/neck ownership
  corrections and a newly authored curl. The user found SE much better; the
  latest SW repair has not received visual approval. Review anatomy, local mask
  transitions and remaining edge noise before continuing authoring.
- NE/NW heads, separate facial/ear variants, concealed lower hair, full body and
  clothing anatomy, material maps, independently authored pixel assets and
  production T-pose fit remain unfinished. Final Step 6C approval is outstanding;
  Step 6D has not started and requires explicit approval.

### Files and review commands to resume

All selected source imagery and derivation inputs are under version control in
`assets/references/heroine-v1/` and `assets/source/heroine-v1/`. Retained raw
studies are local repository copies; external Codex generated-image paths in
provenance are historical records, not regeneration dependencies. Temporary
files under `/tmp` and the previous machine's Codex session are not required.
Use the checked-in portable authoring scripts only to replay a derivation in a
separate scratch copy; normal review commands consume the retained sources.
Never overwrite approved artwork or mirror another facing.

`assets/staging/` is ignored and is deliberately excluded from the `wip`
commit. The user will transfer that directory separately to the same relative
location on the new machine. It contains generated inspection images/reports,
not approved runtime assets. The current review entry points are:

| Scope | Selected source config | Command | Staging overview |
| --- | --- | --- | --- |
| S/N head fit | `head-soft-oval-v1/authoring-v5.json` | `pnpm head:review` | `head-soft-oval-v1/overview.png` |
| E/W head fit | `head-soft-oval-v1/profiles-authoring-v3.json` | `pnpm head:review:profiles` | `head-soft-oval-v1/profiles/overview.png` |
| SE/SW head fit | `head-soft-oval-v1/front-diagonals-authoring-v3.json` | `pnpm head:review:front-diagonals` | `head-soft-oval-v1/front-diagonals/overview.png` |

Config paths in the table are relative to `assets/source/heroine-v1/`; overview
paths are relative to `assets/staging/heroine-v1/`. For the latest SW repair,
also inspect `head-soft-oval-v1/front-diagonals/inspection/SW-fit-comparison.png`
(reference / revision 2 / revision 3). Revision-1 and revision-2 head-fit commands
remain available separately. See `docs/modular-head.md` and
`front-diagonals-fit-audit-v3.json` for measurements and review limits.

On the new machine, use Ubuntu/WSL Bash and keep the checkout under `/home`.
Install NVM if needed, then follow the pinned toolchain:

```bash
source "$HOME/.nvm/nvm.sh"
nvm install
nvm use
npm install --global pnpm@10.34.6
pnpm install --frozen-lockfile
```

Reinstall dependencies rather than transferring `node_modules`, build outputs
or browser binaries. To regenerate reference staging if it has not been
transferred, run `pnpm reference:import` first: hair/head review commands read
`assets/staging/heroine-v1/reference-import-v1/transparent/`. The head commands
above then rebuild their current inspections from checked-in source assets.
Hair inspections can be regenerated with `pnpm hair:review`,
`pnpm hair:review:profiles`, `pnpm hair:review:front-diagonals`,
`pnpm hair:review:front-diagonals:completion` and
`pnpm hair:review:back-diagonals`. The ordinary editor's temporary catalog is
regenerated by `pnpm dev` or `pnpm build`, independently of heroine staging.

### Validation carried with this checkpoint

The latest artwork change passed asset-validator typecheck, root lint,
asset-validator JS/declaration build, current revision-3 and historical
revision-2 CLI exports, and the existing focused SE/SW integration workflow:

```bash
pnpm exec vitest run tools/asset-validator/src/head-review.integration.test.ts -t 'independent SE/SW'
```

Result: one passed, two unrelated workflows skipped, 156.49 seconds. The workflow
covers actual plane composition, native nose/neck samples, unchanged SE,
deterministic output, immutable sources and rejection of re-pinned edits outside
masks. No additional unit test cases were added. All 270 pre-repair source/reference
hashes were preserved, 47 current staging PNG hashes verified, and 16 authoring
outputs plus two guides reproduced byte-for-byte in an isolated temporary copy.
S/N and E/W workflows passed during revision-2 verification and were not rerun
for the SW-only increment. Full application build/browser E2E were not rerun.
These are prior local results; rerun checks after installing on the new machine.

For a full environment check, run `pnpm test:e2e:install`, `pnpm verify`, then
`pnpm test:e2e`; Chromium system dependencies may need installation as described
in `README.md`. Do not add repetitive unit tests for the migration. Passing
automated checks does not replace visual review or authorize the next milestone.

## 1. Goal

Build a modular female fantasy character creator that lets users select and combine:

- Ancestry/race (human, elf, vampire, dwarf, furry/beast, dragonborn, angel, devil, spirit, and compatible hybrids).
- Hair length, style and colours.
- Skin tone.
- Chest size, height and overall body proportions.
- Head shape, face style and expressions.
- Independent left and right eye colours.
- Eventually outfits and other race-specific anatomy.

The user interface should let users swap compatible parts in real time, recolour individual materials and preview/export eight directional views.

## 2. Core architecture — one recipe, two independent outputs

- A single versioned `CharacterRecipe` describes character identity and appearance.
- A shared, render-agnostic TypeScript engine validates traits, selects anatomy variants, resolves compatible assets, plans layer depth, and produces a `RenderPlan`.
- **Detailed output:** 1024×1536 native image artwork, composed from separately authored detailed layers.
- **Pixel output:** 128×192 native pixel assets, separately authored for crisp in-game use. Do **not** automatically shrink detailed artwork and treat that as final pixel art.
- Both outputs share semantic asset IDs, traits, attachment names and palettes, but have separate image assets and rendering implementations.
- Internal asset PNGs are transparent. Final previews/exports use `#00FF00` backgrounds; exported direction labels appear in yellow at the upper-left. Keep labels and background OUT of internal artwork.
- Palette-based recolouring should target semantic materials (hair, skin, eyes, fabric, scales) and shade levels, not blindly tint every pixel or replace approximate RGB matches.
- Larger body geometry differences use approved silhouette/rig variants and compatible clothing assets; do not stretch entire images arbitrarily.

## 3. Eight-direction contracts

Required facings: `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`.

- `N` is full back, no visible face/eyes.
- `NE` and `NW` are three-quarter **back**, no visible eyes.
- `S` is full front.
- `SE` and `SW` are three-quarter **front**.
- `E` and `W` are independent side views.
- Never generate a direction by simply mirroring another. Side-specific hands, accessories, garment openings, hairstyles, head, torso and feet must stay physically consistent.
- Back-view garments are not reflected front garments. A slit exposing the front thigh in S/SE/SW must **not** be copied onto the rear skirt in N/NE/NW.
- All directions preserve consistent character scale, alignment, grounded feet and body proportions. Pixel-art assets use a uniform square grid with no antialiasing, blur, gradients, dithering or arbitrary rotations/scaling.
- No hanging accessories unless specified. Avoid rhombus/diamond-shaped accessories or decoration.

## 4. Planned stack and repository

Development environment: Windows + WSL2 Ubuntu. The repository is under `~/projects/character-studio`, not `/mnt/c`. VS Code runs through its WSL extension; the Codex VS Code extension is preferred over the CLI. Run Node.js, pnpm, Git, builds and tests inside Ubuntu.

Proposed stack:

- React + TypeScript + Vite + Tailwind CSS.
- Zustand state; Zod schema validation.
- `pnpm` workspaces.
- `packages/core`: pure TypeScript recipe, ancestry, anatomy and composition model.
- `packages/asset-registry`: versioned manifests and asset resolution.
- `packages/renderer-detailed`: PixiJS v8/WebGL for detailed preview/rendering.
- `packages/renderer-pixel`: deterministic integer-pixel compositor; nearest-neighbour preview.
- `tools/asset-validator` and later asset-import / palette / atlas / QA helpers.
- Vitest + Playwright where appropriate.

Suggested documentation files: `AGENTS.md`, `docs/architecture.md`, `docs/asset-spec.md`, `docs/mvp.md` and eventually `docs/asset-pipeline.md` or `docs/reference-import.md`. These should agree; if they conflict, flag for decision rather than silently choosing one.

## 5. Art / reference status

An eight-direction detailed reference pack exists **in the user's ChatGPT conversation**. The intended local repository location is:

`assets/references/heroine-v1/detailed/{N,NE,E,SE,S,SW,W,NW}.png`

Important: These image files are **not automatically present in the repository**. Verify they exist before using them; ask the user to copy them if missing.

Character visual identity:

- Adult female anime/fantasy character; long voluminous wavy silver-lilac hair with defined curls.
- Deep-purple strapless corset dress with layered flowing skirt, red/crimson sash and lining, long purple gloves, purple high heels.
- Pose: standing, arms relaxed down (this is an **idle/dressed reference**, not the proposed neutral T-pose anatomy master).
- The eight reference images are nominally 1024×1536.
- Original `NE` and `NW` images exposed an implausible front thigh slit in three-quarter back views. Corrected `NE` and `NW` reference artworks have been supplied and visually approved: the rear skirt now covers the legs and retains the red lining and folds.
- The eight PNGs have baked-in bright green backgrounds and some baked-in yellow direction labels; source files are flattened illustrations, **not modular parts**.
- Previous analysis identified fully opaque source images, imperfectly uniform green and some baseline variation. Re-measure from actual files; don't assume exact measurements without inspecting the local copies.
- Treat these as canonical **visual references** only until modular components are independently authored and approved.

## 6. MVP plan

1. Monorepo scaffold and checks (`pnpm dev`, typecheck, lint, test, build).
2. Shared `CharacterRecipe`, ancestry traits, body presets and validation in pure TypeScript.
3. Asset registry + direction-aware layered `RenderPlan` + compatibility checks.
4. Both renderers using simple synthetic placeholder assets; complete eight-direction exports with correct dimensions/colours.
5. React character creator UI (race/body/hair/face/palettes, target switch, 8 facings, S/N compare, JSON and PNG exports, undo/redo as implemented).
6. First real production art package.

**Important:** The ChatGPT discussion outlined these steps, but there is no verified implementation status for Steps 1–5. Codex must inspect the actual repository and report what is done before proceeding.

### Step 6, detailed sequence

- **6A** Freeze all eight approved original reference images in `assets/references/heroine-v1/detailed/` (use corrected NE/NW).
- **6B** Build a non-destructive reference-import pipeline: audit dimensions/alpha/green-background variation; create contact sheet; remove background and baked labels from new **staging copies** while preserving delicate hair strands; estimate bounds/foot baseline; mark candidate anatomy anchors for manual review; create checkerboard and green preview images; keep originals immutable.
- **6C** Author genuinely modular body/head, front/rear hair and clothing assets. Begin with the long hairstyle on S and N, then complete all eight; do not mistake green-screen removal for asset decomposition. Hidden head/body anatomy under hair/clothing needs new authored artwork.
- **6D** Integrate semantic material/shade maps for hair palette swapping and test palette isolation.
- **6E** Produce independently authored 128×192 pixel counterparts using the same semantic asset IDs.

### Immediate next Codex assignment (if the previous foundation is functional)

Read `AGENTS.md`, `docs/architecture.md`, `docs/asset-spec.md`, `docs/mvp.md` and this context. Audit `assets/references/heroine-v1/detailed/` for `{N,NE,E,SE,S,SW,W,NW}.png`. If files are missing, report them and stop. Do not edit originals. Implement Step 6A–6B: validate, report alpha/background/bounds, generate a contact sheet, carefully create transparent labeled-free staging copies, and produce automated QA + documentation. Do not generate modular parts, invent occluded anatomy, mirror assets or auto-publish. Run and report relevant tests. Stop for visual approval.

## 7. Asset authoring and quality requirements

### Verified implementation and approved next increment — 2026-10-09

Repository verification established functional recipe/core, asset planning, both
placeholder renderers and the interactive editor. Steps 6A–6B passed source-hash,
native output and repeatability checks; all 32 existing Vitest tests and six
browser workflows passed. The user then approved proceeding with Step 6C.

The first Step 6C increment authors S/N long silver-lilac hair as versioned front
and rear components, with review inputs in
`assets/source/heroine-v1/hair-long-waves-v1/` and generated inspection outputs in
`assets/staging/heroine-v1/hair-long-waves-v1/`. N's front fringe is explicitly
hidden. See `docs/modular-hair.md` for provenance, provisional attachments and
review criteria. Source/import artwork stays immutable. The standing-reference
draft does not certify T-pose, head/body fit, candidate anatomy or the outstanding
48 px baseline spread. The user approved the S/N hair design and requested a local commit followed by
the next increment. Source/cleaned hashes are pinned in `review-v1.json`; T-pose
and head/body fit remain unverified. Continue with independently authored E/W;
Step 6C must be reviewed before Step 6D. No production pixel art is derived.

The next increment adds independent E/W front/rear hair authoring and
`pnpm hair:review:profiles`, with separate pinned authoring configuration and
staging outputs. The user approved the E/W standing-reference hair design on
2026-10-09 and requested a local commit; `profiles-review-v1.json` pins the accepted
config, source and cleaned hashes. S/N approval and source artwork are preserved.
At that point, all diagonal facings, modular body/head/clothing and a production
T-pose rig remained unfinished. Profile authoring did not complete Step 6C.

The next increment authored independent SE/SW front/rear drafts. The user
rejected revision-1/2 assemblies because independently generated pieces lost
shared scale and perspective. The user explicitly selected manually drawn masks
for revision 3: each facing's own coherent head-and-hair study is partitioned into
front hair, rear hair and visible review-head pixels. Exact reconstruction is
required, but does not prove complete reference coverage or hidden anatomy.

On 2026-10-10 the user identified omitted far-side curls, character-left in SE
(screen-right) and character-right in SW (screen-left). Revision 4 restores those
visible portions from each facing's own transparent reference through native
manual masks, preserving all prior study pixels. The review command selects
`front-diagonals-authoring-v4.json` and verifies restored reference RGBA in both
the master and rear layer. Body occlusion still leaves gaps needing authored
connecting hair. The user approved this visible draft and requested a local
commit; `front-diagonals-review-v1.json` pins the accepted config, layers, masters,
masks and partial review heads. Full head anatomy, concealed roots, independent
head/body/T-pose fit, NE/NW, publication and final Step 6C approval remain pending.
Step 6D has not begun.

The user then requested repository cleanup and lowercase kebab-case filenames
in `docs/`. All documentation references follow the renamed paths. Rejected
SE/SW revision-1/2 working files and superseded revision-3 partitions were removed;
historical source evidence remains in Git at `d2ec13f`. Current approved sources,
configurations, approval records, reference imagery and revision-3 master inputs
needed to reproduce/test the accepted restoration remain unchanged. Old preview
iterations and generated test/export artifacts were also removed. Cleanup does
not authorize advancing art authoring or the next milestone.

After cleanup commit `e850c1c`, the user requested the next increment and asked
to avoid pointless unit tests. The next Step 6C increment completes SE/SW
concealed rear backing and far-side connections as revision-5 candidates, using
each facing's own imagegen rear edit and explicit manual masks. Approved source
files stay unchanged. Initial additive-only joins retained old extraction cuts;
small seam polygons therefore permit repairs in the new rear version only.
Front/head sources remain revision 4. The review verifies the accepted baseline
partition, exact pixels outside completion masks, generated pixels inside them,
retained visible reference coverage, native depth and deterministic outputs.
One additional case extends the existing public review integration workflow;
no new helper/enum unit suite is added. Separate staging at `front-diagonals-v5/`
keeps the approved visible revision-4 inspection intact. The user approved revision 5 with “approved. commit and then continue”; `front-diagonals-review-v2.json` records its scope and hashes. Full anatomy/T-pose fit, NE/NW and final Step 6C review
remain unfinished. Step 6D does not advance.

### NE/NW rear-hair review increment — 2026-10-10

The user approved SE/SW revision-5 rear completion and requested committing
then continuing. Local commit `3b46839` records that approval; earlier approvals
and artwork remain unchanged. Independent NE/NW rear-crown/drape candidates
are now authored from their own references with explicit hidden front fringe.
Rejected enlarged generations were not retained in the repository; selected
raw sources use the existing alpha cleanup without geometric transforms.
`pnpm hair:review:back-diagonals` prepares a separate two-row comparison in
ignored staging. The existing public integration workflow is extended for
determinism, native geometry, hidden fringe and rejection of reused facing art.
Complete independent anatomy/T-pose fit and
full Step 6C review remain required. Step 6D remains outside this increment.

### NW shoulder-curl restoration and NE approval — 2026-10-10

The user accepted NE and reported a missing NW shoulder lock. NE-only design
approval is recorded in `back-diagonals-ne-review-v1.json`; its artwork and
frame remain unchanged. NW revision 2 copies the missing visible curl from its
own reference using the previously authorized manual-mask method, preserving
native coordinates and all pixels outside the selection. The initial NW source
is retained as required derivation evidence. Authoring script/mask/provenance
are in `inputs/back-diagonals-v2/`. The updated comparison remains at
`back-diagonals/overview.png`; corrected NW was approved with “approved. commit and continue to next step”. `back-diagonals-review-v1.json` pins the pair config/layers and restoration provenance. This does not
advance Step 6C anatomy/production fit or Step 6D.

### Approved back-diagonal hair and S/N anatomy increment — 2026-10-10

The user approved corrected NW and requested a local commit followed by
the next increment. `back-diagonals-review-v1.json` pins both rear-hair
facings and restoration provenance; commit `464f9e4` records that approval.
All eight hair designs are approved at standing-reference design scope.

The next small Step 6C increment authors independent bald S/N soft-oval
head/neck skin bases, partitions native source pixels and prepares offline
comparisons with the unchanged accepted hair. S omits eyes/brows/mouth for
future interchangeable facial parts; N has no facial features. Human ears
remain embedded in these first head bases and need subsequent separation
for ear variants. Synthetic native placement guides are framing aids only.
The new complete scalp/jaw/nape anatomy itself requires visual approval.

`pnpm head:review` prepares native head/neck layers, exact reconstructed
studies, close-up/full-canvas comparisons and hashed QA. One public artwork
integration workflow checks reconstruction, approved hair, real render-order
overlap, deterministic export and meaningful failure boundaries.

The comparison exposes S fringe coverage of the nose and intended eye area
at the reference head position. S fit is not ready; review head geometry
and author a versioned fringe-fit correction. N posterior scalp coverage is
visually plausible but still unapproved. Six other head facings, facial/ear
layers, body/clothing and production T-pose fit remain unfinished. See
`docs/modular-head.md`. This does not complete Step 6C or advance Step 6D.

### S fit correction after anatomy-draft checkpoint — 2026-10-10

The user questioned S alignment, then approved a local commit and continuation.
Commit `2474fde` preserves the initial S/N anatomy draft and review workflow.
Equal approximate anchor coordinates did not establish matching facial geometry.
The accepted S front covered the nose/eye area; its rear also carried oversized
temple locks. Revision 2 therefore fits a new S front/rear pair while preserving
all approved source images, head/neck parts and N output. The front is selected
from S's own reference with native manual masks; the rear is newly authored with
built-in imagegen and clipped to the native reference silhouette above y290.
The revision-2 review selects `authoring-v2.json`; `head:review:v1`
reproduces the historical mismatch separately. Four exposed facial samples and
exact native source ownership are regression boundaries, not anatomical proof.
The user approved this fit candidate with “approved. commit and continue”.
`review-fit-v2.json` pins its config, sources and reviewed composition; the
known temple seams are the next versioned repair. Step 6C remains unfinished and
Step 6D has not begun. See `docs/modular-head.md` for retained provenance.

### S temple and left-ear foreground correction — 2026-10-10

Commit `bde4c80` freezes the approved revision-2 fit candidate. The next
increment retains a new shared S seam study and manually traced local masks.
During review, the user identified missing foreground hair at S's left ear
(screen-right): the original ear exclusion removed part of a crossing strand.
The initial narrow revision-3 restoration failed visual review. The user then
identified that the hair lies both in front of and behind the ear. Revised local
ownership keeps the crossing bang in front and places the side lock behind the
complete unchanged head/ear. S's own native reference supplies retained hair;
visible reference ear/skin is excluded. Neck-curl masks also clear skin-filled
holes, warm rims and a detached clavicle-outline fragment. Retained RGBA is
unchanged, with no blur or feathering. Independent ear layers remain unfinished.

At revision 3, `pnpm head:review` selected `authoring-v3.json`; `head:review:v2` reproduces
the approved baseline under separate staging/v2. The new comparison shows
reference / approved v2 fit / v3 candidate. Masks and exact pixel ownership
are verified, including unchanged anatomy, N and all pixels outside the local
repair areas. Local strand joins, revised ear depth and cleaned neck contours still require
human visual review. This increment does not complete Step 6C or advance 6D.

### S coherent native hair partition after rejected local patches — 2026-10-10

The user rejected the revised overview: hair strokes remained disjoint and
cheeks were cropped. Exact local source ownership and passing tests did not
establish a coherent fit. The cause was a composition of original-reference
fringe, independently authored rear hair and small shared-study patches whose
contours differed. Position changes alone could not repair those strokes.

Revision 4 uses the entire existing shared S drawing as the sole hair source,
not its local patches. The visible face/ear/neck context is excluded within a
bounded manual skin mask; one pale nose-highlight pixel and two detached
alpha-8 specks have explicit exclusions. The supposed black/purple background
in this raw study has zero alpha; it is not visible haze. Every retained RGBA
pixel stays at its native coordinate. A posterior ear region places the side
lock behind the complete original head; the fringe/face-framing locks remain
in front. Lower drapes pass to the rear below the neck. Front and rear have
exact disjoint ownership and reconstruct one continuous hair master.

At revision 4, `pnpm head:review` selected `authoring-v4.json`; `head:review:v3` retains
historical rejected-patch reproduction separately. The current overview and
`inspection/S-coherent-partition.png` show the assembled fit and exact split.
Approved v2, all complete anatomy sources and N remain unchanged. A further
imagegen edit was rejected for changing native framing and is not retained.
The selected earlier prompt and manual derivation are recorded in
`prompts-coherent-v4.json`. The one existing integration workflow now checks
the coherent reconstruction, uncovered cheeks, posterior ear depth, unchanged
anatomy/N, deterministic exports and rejection of re-pinned forged hair.
No additional unit-test suite was introduced. Visual review and all remaining
Step 6C anatomy/body/T-pose work remain pending; Step 6D has not begun.

### Lower left-ear clipping in the coherent S fit — 2026-10-10

The user said the coherent partition looked fine at the moment, but the ear
was still clipped in the assembled overview. This is not approval of the
assembled anatomy or complete Step 6C. The cause was remaining foreground
side-lock pixels over the inner/lower ear: the rectangular posterior region
started at x584, while the complete ear/lobe extends farther inward.

Revision 5 changes only the native depth ownership. A contour-shaped inward
extension transfers 247 existing hair pixels from front to rear, including
173 pixels over head/ear skin. The complete revision-4 hair-only master remains
identical; no hair is cut, redrawn, recoloured or repositioned. Skin exclusion,
crown/fringe, neck curls, drapes, all original anatomy, approved sources and N
remain unchanged. `authoring-v5.json` pins the v4 ownership baseline;
`inputs/partition-ear-depth-v5.js` writes new parts/masks only.
`pnpm head:review` now selects v5; `head:review:v4` reproduces the earlier fit
in separate staging/v4. The current partition's complete-hair column is
unchanged; its front/rear columns reflect only the ear-depth transfer.

The existing single integration workflow checks real previously occluded
inner-ear/lobe pixels in the assembled fit, unchanged whole hair, localized
ownership changes, source preservation and repeatable exports. Review of the
updated ear and remaining Step 6C work is pending. No new unit-test suite or
Step 6D work was introduced.

### General approval of S fit with known hair noise — 2026-10-10

The user generally approved revision 5 and requested committing then
continuing, while noting residual noise in the hair. `review-fit-v5.json`
records this limited standing-reference checkpoint approval and the known
noise. Do not overwrite its source or interpret it as final production
anatomy/Step 6C acceptance. The next increment authors independent E/W bald
head/neck anatomy and compares each with its own approved profile hair.
S/N stay unchanged. Step 6D remains outside the authorized increment.

### Independent profile anatomy and hair-fit diagnostics — 2026-10-10

Local commit `11fe059` freezes the generally approved revision-5 S fit,
including known residual hair noise. The subsequent small Step 6C increment
authors separate E and W complete bald head/neck skin masters, using each
facing's own reference and independently drawn native placement guide.
`profiles-authoring-v1.json` pins those masters, exact head/neck partitions,
binary masks and the already approved profile hair. E faces screen-right and
W screen-left; neither is reflected or resampled. Complete scalp, cheek/jaw,
near ear and neck are authored anatomy candidates, not reference cutouts.
Near human ears remain embedded, facial features need separate layers, and
production T-pose/body compatibility remains unverified.

The initial profile review reproduced the reference / bare skin / existing
hair composition in `assets/staging/heroine-v1/head-soft-oval-v1/profiles/`.
The actual comparison confirms a fit failure: E's hair cap leaves scalp exposed,
and both front fringes overlap the nose. Earlier hair design approval did not
approve this head fit. No geometry shift, scalp clipping, contour collage or
fallback artwork conceals the discrepancy. Two attempted whole-hair imagegen
edits changed native framing and were rejected; exact prompts and input roles
are recorded in `profiles-fit-experiments-v1.json`, with no selected replacement
image or profile-fit revision 2. Review the bare anatomy first; then author a
versioned coherent same-facing hair correction that preserves its native frame.
The E/W assembled fit is unfinished. S/N approval and all approved hair sources
are unchanged. Four diagonal head facings, ear/facial layers, full body/clothing
and final Step 6C approval remain outstanding; Step 6D has not started.

### Profile visible-fit continuation — 2026-10-10

The user requested continuation while the profile increment was in progress.
Further whole-hair edits changed framing; full-character studies held the
native scale but contained nonzero-alpha coloured background and clothing
occlusion. A trial colour-assisted matte damaged strand outlines. All such
generated hair alternatives were rejected and removed from the repository;
`profiles-prompts-v2.json` retains exact prompts/input roles/rejection reasons.
Only the separately authored bald E/W anatomy masters are selected generations.

`profiles-authoring-v2.json` now fits the **visible** hair from each facing's
own clean native reference. Manual hair/curl, face/shoulder/body exclusion
regions and the bounded warm-skin guard create exact disjoint front/rear
parts from one reference per facing. Source RGBA and complete anatomy remain
unchanged; no global colour key, scaling, mirroring, shifted head or collaged
direction drawing is used. Ear-side locks go behind the complete ear; crown
and fringe go in front. Both eye/nose/chin sample sets remain hair-free, and
the inspected scalp samples have hair coverage. Manual mask edges, cheek/neck
transitions and ear placement still require visual review. This does not author
hair hidden by the standing guide body, so the complete reusable lower hair
and production T-pose/body fit remain unfinished.

`pnpm head:review:profiles` selects v2; `head:review:profiles:v1` reproduces the
original failed fit in `profiles/v1/`. Current profile staging contains 40 PNGs,
including independent coherent partitions and reference / old fit / current
fit comparisons. `profiles-fit-audit-v2.json` records measurements and remaining
limits with approval/completion flags false. The single added profile public
artwork workflow now checks both the original failure and revised facial/crown
exposure, exact reference ownership, anatomy/source preservation, actual depth,
repeatable exports and re-pinned forged-part rejection. No additional unit-test
cases or Step 6D work were introduced.

- Distinguish `assets/references/` (immutable source images), `assets/source/` (editable layered files), `assets/staging/` (unapproved outputs), `assets/detailed/` and `assets/pixel/` (approved published parts), `assets/manifests/` and `assets/qa/` (generated reports).
- Each modular part should declare a unique semantic ID, target, supported facings, compatible rig/body presets, image paths, attachment anchor, native offset, depth plane, visibility/occlusion, optional material/shade masks and requires/excludes.
- Layer order may vary with facing. Long hair usually needs rear and front components. Clothing should conform to genuine front/rear three-dimensional construction.
- Create transparent source parts and apply solid `#00FF00` / yellow direction text only in final preview/export.
- Verify dimensions, RGBA values, no overflow, foot baseline, direction correctness, sharp pixel eyes, fingers, legs and no unintended stray green pixels.
- Automated checks cannot fully verify dress anatomy, correct near/far limbs, hairstyle consistency or hidden facial features; retain human visual approval gates.

## 8. Codex operating rules

- Read actual repository files first and reuse working code.
- Work in small milestones; don't broaden scope or prematurely add complex features.
- Clearly distinguish proposed scripts from scripts already present.
- Do not claim tests passed without running them.
- Do not fabricate missing images or masks and do not modify approved reference images.
- Report exact missing input/asset files and ask for human approval when required.
- Keep documentation up to date as decisions are made, and retain the repo as the source of truth.

### Profile ear size and native placement correction — 2026-10-10

The user rejected the E/W ears as larger than the references and misaligned.
This is a visual failure despite the earlier face/scalp sample checks. The old
bald ear geometry was larger and higher, and the broad v2 posterior masks exposed
too much of those ears. Neither E/W anatomy nor their fit has been approved.

Revision 3 confines anatomy changes to local E/W ear masks. Each facing's
reference supplies visible ear RGBA at its original coordinates and size;
separate local built-in imagegen studies remove the old ear and provide bounded
concealed ear surfaces. All anatomy outside those masks, neck, anchors, S/N and
approved hair sources remain unchanged. The actual reference crossing fringe
stays in front instead of being moved behind the larger bald ear. The visible
matte contains no authored concealed strands behind the canonical ear, so zero
posterior overlap there is intentional, not a claim that hidden hair is complete.
One pale E ear-highlight pixel is assigned to skin instead of hair.

`head:review:profiles` selects `profiles-authoring-v3.json`; profile revisions
1 and 2 remain reproducible in separate staging. The overview compares reference,
corrected bare anatomy and actual layered fit; the fit comparison uses the
rejected v2 assembly as its baseline. Exact prompts/input roles/rejected studies
are recorded in `profiles-prompts-v3.json`; only selected native patches enter
parts. The existing profile integration workflow checks assembled reference ear
pixels and rejects unrelated anatomy edits even with re-pinned part hashes.
Concealed ear structure, mask transitions and residual hair noise require human
review. E/W remain unapproved. This does not complete Step6C or advance Step6D.

### E/W fit approval and next increment — 2026-10-10

The user approved the overall revision-3 E/W fit, acknowledging minor pixelation
in the left/W bare-ear overview; other inspected outputs were satisfactory.
`profiles-review-fit-v3.json` pins the accepted config, inputs and measured fits.
The accepted artwork remains unchanged. This is a standing-reference fit checkpoint,
not complete production anatomy or final Step 6C approval.

The next small Step 6C increment is independently authored SE/SW bald head and neck
bases, reviewed against their already approved front-diagonal hairstyle. Preserve
all accepted sources, inspect actual layered geometry, and retain manual masks and
prompt provenance. NE/NW heads, facial/ear variants, concealed hair, body/clothing,
material maps and production T-pose remain later work. Step 6D has not started.

### First SE/SW head/neck increment — 2026-10-10

After qualified E/W approval, commit `62847da` records the accepted profile fit
and minor left/W overview-ear pixelation. Step 6C continues with independently
authored SE/SW bald skin bases, manual native head/neck partitions, and actual
composition against the unchanged approved front-diagonal hairstyle.

The new front-diagonal anatomy is an unapproved candidate. Generation attempts
that zoomed or shifted whole studies were rejected. Local ear-erasure patches
remove displaced ears; bounded masks restore each approved design study's
visible ear pixels without transforms. Visible jaw/nose differences, concealed
ear rims and existing hair-mask seams/speckles need review and likely versioned
correction. Source-ownership checks and one focused public artwork workflow
cover this pair; automatic checks do not prove anatomical coherence.

NE/NW head anatomy, separate facial/ear variants, concealed hair, body/clothing,
material maps and production T-pose remain outstanding. No Step 6D work is
authorized by this incremental anatomy checkpoint.

### SE/SW ear, nose and hair-mask correction — 2026-10-10

The user rejected the first SE/SW anatomy overview: bare ears retained only
clipped visible fragments, the SE nose was displaced, and SW hair-mask fragments
appeared as white pixels over the face. Revision 2 authors complete independent
ear studies and corrects SE cheek/jaw geometry with local native masks. A narrow
same-facing approved-study nose mask retains the original SE landmark after
erasing the generated displaced nose and faint mouth. SW cleanup removes 237
manually selected front-hair face/neck fragment pixels while preserving all
other artwork and legitimate white highlights. Previous sources, approved hair
and rear layers are unchanged; neck layers are reused.

At this checkpoint the default front-diagonal head-review command prepared revision 2, with
reference/rejected/corrected comparisons. `head:review:front-diagonals:v1`
reproduces the earlier draft separately. Both corrections and complete-ear
anatomy remain pending visual approval. They do not complete Step 6C or authorize
Step 6D. Existing public artwork coverage is extended, with no new unit cases.

### SW nose and neck ownership follow-up — 2026-10-10

The user found SE much better but reported the same nose issue on SW, plus
white jaw fragments and neck cutouts. Revision 2 had left SW's profile-shaped
skin outline unchanged. Revision 3 uses a new local SW skin study, manually
traced native masks and 63 nose pixels from SW's own approved hair design.
The jaw contour comes from its canonical review skin. Canonical strand/rear
pixels and a separately authored local curl correct depth ownership around
the marked neck gap without globally removing white hair highlights.

SE's skin/hair layers and assembled fit remain byte-identical to revision 2.
Previous source imagery is preserved. The default front-diagonal head command
now selects revision 3; `head:review:front-diagonals:v2` retains the preceding
checkpoint. Comparisons show reference / revision 2 / revision 3. Exact prompts,
raw studies, masks and portable authoring scripts retain the derivation.

The existing SE/SW artwork integration case passed, with deterministic output,
native nose/neck regressions and rejection of edits outside the selected masks.
No additional unit cases were introduced. This candidate needs visual review
of anatomy and mask transitions; inherited edge noise is still outstanding.
Step 6C is unfinished and Step 6D remains unauthorized.
