# Step 6C — modular long-hair authoring

## S body/head/hair revision 6 approved — 2026-10-14

The user approved the current S body/head/hair fit and requested cleanup, a local
commit and continued Step 6C work. `body/reference-v1/review-fit-v6.json` pins the
accepted configuration and actual bare/assembled hashes. Accepted source artwork
stays unchanged. This is an offline S layering-study checkpoint, not production
anatomy, full T-pose acceptance, native pixel approval or final Step 6C acceptance.

The exact requested future authoring note is:

> eventually we may want to create asset by asset from scratch when given a design to avoid this masking problem as long as the layering system works.

Keep that preference in future asset work. Preserve the project and its existing
approvals; complete independently authored parts from a supplied design remain a
future option. The next bounded increment separates this accepted S body study
into torso and left/right arm/leg layers, using the established render planes and
native positions, with exact actual recomposition. Joint/concealed geometry and
separate underwear remain later authoring work. Step 6D has not started.
Earlier pending-approval statements below are historical.

## Future separate-asset authoring preference — 2026-10-14

The current reference-derived head/hair/body studies test actual modular layering.
After one final bounded S curl-spill correction (body revision 6), the user wants
to move on. For a future supplied design, consider independently authoring complete
front/rear hair and the other reusable parts from scratch, including concealed
geometry from the outset. Verify native anchors, real depth/occlusion and all
compatible independently authored facings/targets. Preserve accepted sources and
scoped approvals; this preference does not restart the project, publish these
studies, complete Step 6C or start Step 6D. See [modular-body.md](modular-body.md).

The user approved proceeding from the verified Steps 6A–6B audit on 2026-10-09.
The initial S/N hair design has user approval recorded in `review-v1.json`.
The independent E/W hair design also has user approval recorded in
`profiles-review-v1.json`. Both approval records pin source and cleaned hashes.
The SE/SW revision-4 visible hair draft has user approval recorded in
`front-diagonals-review-v1.json`. Revision-5 rear-root and connection design approval
is recorded separately in `front-diagonals-review-v2.json`; full anatomy fit remains unfinished.
It does not complete Step 6C or approve the remaining art package.
Existing reference matte flags and candidate anchors remain observations, not
certified anatomy. Detailed production artwork still requires an authored T-pose.

## Authoring inputs and provenance

`assets/source/heroine-v1/hair/long-waves-v1/` holds versioned
reference-based authoring inputs. Built-in imagegen edits created the PNGs;
`prompts.json` records the selected prompts. The original eight references and
reference-import staging are preserved. New hair surfaces previously hidden by
the person are newly authored candidates, not recovered source pixels.
The S/N intermediate rear images and E/W edit inputs are preserved in `inputs/`;
each authoring configuration names the selected top-level PNGs for its pair.

`authoring-v1.json` records the semantic `hair.long-waves.v1` ID, raw PNG hashes,
native 1024×1536 dimensions, candidate head origins, allowable bounds and explicit
N fringe invisibility. It is an **authoring review schema**, not a runtime asset
manifest: its pose is honestly `standing-reference`, rig compatibility is
unverified and palette readiness is false. Declaring either body preset or an
approved T-pose without review would misrepresent the artwork.

S has separate rear and front pieces. Its rear piece completes previously
occluded long hair; its front piece contains the frontal cap/fringe, ahoge and
face-framing locks. N has its own independently authored rear piece, retaining
the reference's open-back drape. The front fringe is explicitly hidden in N,
rather than represented by copied or fabricated rear-facing bangs.

## Generate inspection outputs

```bash
source "$HOME/.nvm/nvm.sh"
nvm use
pnpm reference:import # only needed if the reference staging is absent
pnpm hair:review
```

The review command never calls imagegen. It validates tracked authoring inputs,
prepares deterministic inspection PNGs and leaves source files unchanged. All
outputs live in the ignored directory
`assets/staging/heroine-v1/hair/long-waves-v1/`:

- `layers/`: three transparent, label-free, native PNGs.
- `assembled/`: detached hair combinations for S and N.
- `inspection/checker/` and `inspection/green/`: native layer/assembled previews.
- `inspection/comparison/`: original character on the left, detached hair on the
  right, both at native scale. This is a reference comparison, not a completed
  reconstruction of a modular character.
- `overview.png`: S comparison above N comparison, reduced only for inspection.
- `metadata.json`: input/output hashes, bounds, alpha, green candidates,
  position/depth, missing facings and the human-review gate.

The built-in authoring outputs contain near-zero alpha speckles, including some
far outside the drawn hairstyle. Version 1 clears pixels with alpha below 8/255
(less than 3.14% coverage) and normalizes zero-alpha RGB. The raw PNGs are retained
unchanged; cleared counts and source/output alpha histograms are reported. All
other alpha and visible RGB remain unchanged. Inspect fine strands against the
raw output before approving this threshold. No scale, translation, reflection,
recolouring or foreground inpainting happens in this review command.

Full-canvas origins equal the provisional head anchors, so
`anchor - origin + offset` gives `(0,0)` without transforming pixels. Detached
hair combination follows core's actual direction-specific `hair-rear` /
`hair-front` plane ordering. Candidate origins are not installed in runtime rigs.
This check does not certify hair/face/shoulder occlusion on a finished body.

## S/N approval and remaining fit review

The user approved the current S/N increment with “approved. commit and then next
step”. `review-v1.json` pins the accepted source and cleaned layer hashes and alpha
threshold. The draft authoring status is retained because T-pose/head/body fit and
publication remain unverified. The length differences below are accepted design
observations, not certification of anatomy. Future fit review should check:

1. Silhouette, length, curl rhythm and silver-lilac identity against each original.
   Generated imagery is not pixel-identical segmentation. In particular, the S
   fringe's face-framing curls extend lower than the original; judge its fit before
   accepting it or requesting a new version.
   S rear curls also extend below the reference hair length. These differences
   are recorded in `knownReviewIssues`, not treated as successful source-exact
   extraction or approved fit. N's terminal curls were shortened in a targeted
   edit; compare their shape and length with the original.
2. S front/rear junction, cap overlap, ahoge ownership and newly authored hidden
   strands. No face, skin, clothes, glove-shaped gaps or opaque background should
   remain inside a hair-only layer.
3. N's independent curl design, open-back drape and absent front fringe/eyes.
4. Fine strands and alpha noise, comparing raw authoring inputs to cleaned PNGs;
   residual green counts are diagnostics, not visual approval.
5. Head attachments and future T-pose/head/body compatibility. The current
   standing-reference draft cannot be published as an approved T-pose asset.

Do not promote these inputs to `assets/detailed`, bind them into the editor, claim
eight-facing coverage or add pixel counterparts. After S/N approval, author the
remaining six facings independently and continue the body/head/clothing work.
Step 6C needs its own final approval before Step 6D material/shade maps.

## E/W profile design approval and remaining fit review

The user approved the E/W increment on 2026-10-09 with “approved, commit”.
`profiles-review-v1.json` pins its authoring config, raw source hashes, cleaned
layer hashes and the accepted alpha threshold. The standing-reference design
differences below are accepted. Draft authoring status remains because a
separately authored head/body, T-pose fit and production publication are pending.

Four new source PNGs (`E-front.png`, `E-rear-drape.png`, `W-front.png`, `W-rear-drape.png`)
and `profiles-authoring-v1.json` describe independently authored profile pieces.
The S/N config, PNGs and approval record stay unchanged. This additive facing
increment keeps the same semantic asset version; it does not replace any
approved facing. `profiles-prompts.json` preserves the built-in imagegen prompt
history and intermediate edit inputs are retained in `inputs/`.

Some direct rear edits introduced visible haze and failed the same alpha/bounds
checks used for accepted layers. They were rejected. Retrying from alpha-normalized
transparent inputs succeeded without changing the 8/255 threshold. Raw and cleaned
edit inputs are preserved, with the deterministic cleanup described in
`inputs/cleanup-v1.json`. Only the four top-level files named in the profile
configuration are selected; intermediate face-outline drafts are not accepted.
The rear drapes also remove the duplicated crown/fringe from earlier candidates.
The front layer owns the complete cap and ahoge in each profile; partial rear
roots are intended to sit beneath it and a future head. Raw/normalized pre-removal
inputs are kept for lineage. Attempts that enlarged the drape were rejected.

```bash
pnpm hair:review:profiles
```

Outputs go to `assets/staging/heroine-v1/hair/long-waves-v1/profiles/`, following
the same layers/assembled/checker/green/comparison conventions as S/N. The E/W
configuration has its own pinned hashes and explicitly visible front hair for
both profiles; neither is filled from a reflection or copied source. Reports
describe only the pair they inspect, so E/W reports list S/N as absent from that
inspection even though approved S/N authoring exists separately.

Future fit review should inspect each front/rear combination at native size
against its own reference and separately authored head/body.
Check the scalp junction, near/far lock ownership, profile outline, ahoge and curl
length. Compare E to E and W to W: their original silhouettes differ. Front
pieces may differ in scale and curl length from the reference, and newly exposed
rear strands are authored candidates. Broad draft bounds are overflow checks,
not proof of anatomical fit. Candidate head anchors remain E `(558,165)` and
W `(451,176)`; there is no approved head or T-pose rig behind these pieces yet.

The E front curls end at y480, below the reference collarbone near y355, while W
front ends at y419. W rear ends around y872 versus the reference near y810 and is
broader. E rear ends at y857, close to its reference near y850. These observations
are recorded in `knownReviewIssues` and accepted as standing-reference design
observations. Head/body fit remains unverified. No stage command scales or
translates the artwork to hide the differences.

The SE/SW visible draft has design approval; its hidden connections remain unfinished. Independent
NE/NW and modular body/head/clothing authoring remain unfinished. Keep NE/NW eyes
and front-only fringe hidden. Final Step 6C review still precedes material/shade
maps, pixel counterparts or publication.

## SE/SW front-diagonal design approval and remaining work

The user approved the revision-4 visible SE/SW draft on 2026-10-10 with
“approved. commit”. `front-diagonals-review-v1.json` pins the accepted configuration,
raw/cleaned hair layers, masters, partition/restoration masks and partial
review-head hashes. Approval covers visible standing-reference facing geometry,
manual front/rear separation and the restored far-side reference curls. Partial
heads are review evidence, not approved anatomy. Body-occluded connections,
concealed rear roots, independent head/body/T-pose fit, NE/NW and the complete
Step 6C review remain unfinished. Step 6D has not begun.

### Why these layers use a shared master

The rejected revision-1/2 parts had mismatched cap/root geometry and scale.
Deterministic rear-then-front composition reproduced those parts correctly but
could not establish visual fit. Generating each part separately continued to
lose the shared perspective. The user explicitly chose manually drawn masks.
Revision 3 therefore partitions a coherent, independently authored head-and-hair
study for each facing into front hair, rear hair and visible head/neck pixels.
Every visible master pixel belongs to exactly one layer, without recolouring,
resampling or mirroring. This preserves visible geometry; it cannot reconstruct
concealed anatomy or hair roots.

The user then identified omitted far-side curls in those studies: character-left
(screen-right) in SE and character-right (screen-left) in SW. Revision 4 restores
those portions from each facing's own transparent reference through manually
traced native polygons. Warm skin/garment pixels (`R - B > 15`) and green matte
spill (`G - max(R,B) > 20`) are excluded at the boundary; retained RGBA is copied
unchanged. SE restores 10,921 pixels and SW restores 4,789. All additions occupy
previously transparent locations, preserving existing study geometry. The source
body occluded parts of those curls, so **gaps between fragments remain** until
the concealed connecting hair is authored.

### Retained inputs and reproducibility

The current configuration is `front-diagonals-authoring-v4.json`. Selected source
PNGs are `SE/SW-{master,front,rear-drape,review-head}-v4.png`.
`inputs/front-diagonals-v4/` retains native binary masks, selected reference
fragments, polygon coordinates, hashes and authoring scripts. The partition is
recorded in `partition-v4.json`; `side-restoration-v4.json` records the reference
and prior-master provenance.

Revision-3 normalized masters (`SE/SW-master-v3.png`), selected raw studies and
SW's earlier study remain because restoration and its regression checks use them.
`front-diagonals-prompts-v3.json` records the selected generation lineage and
rejected requests. Rejected revision-1/2 assets/configs/prompts, revision-3 split
layers, duplicate normalized copies and old partition outputs were removed during
the user-requested cleanup. They remain available in Git history at `d2ec13f`.
The accepted config, approval records, original references and retained artwork
were not changed. Historical `/tmp` paths in prompts describe past tool inputs,
not dependencies of the review command.

The source-authoring scripts in `inputs/front-diagonals-v4/` document the exact
restoration/partition procedure. Running `restore-side-hair.js` followed by
`partition.js` from the repository root reproduces the current source files,
using the retained revision-3 masters and transparent reference staging.
These scripts write source art and are not part of the read-only review command.
Future changes must use a new version and receive review; do not overwrite the
approved sources.

### Generate and inspect the current draft

```bash
pnpm reference:import # only needed if reference staging is absent
pnpm hair:review:front-diagonals
```

Outputs live in ignored
`assets/staging/heroine-v1/hair/long-waves-v1/front-diagonals/`:

- `overview.png`: three columns, reference / corrected master / masked reconstruction;
  SE above SW, reduced only for inspection.
- `inspection/master-comparison/{SE,SW}.png`: full native 3072×1536 comparisons.
- `masters/`, `fixtures/`, `layers/` and `fit/`: native transparent imagery.
- `hair-only-overview.png`: detached-hair diagnostic, with no review head.
- `restored/` and `inspection/checker/*-restored-reference-hair.png`: restored fragments.
- `metadata.json`: source/output hashes, geometry, coverage and remaining review gates.

Labels and backgrounds belong only to inspection copies. All four hair layers
have zero detected green candidates. Metadata explicitly states that the
partition reconstructs visible pixels exactly, hidden-root completion is pending
and the review head contains only visible study pixels.

The review workflow verifies each facing's own master, exact binary partition,
native placement, deterministic regeneration and the accepted layer hashes.
Every restored pixel must match its reference in both master and rear hair.
Regression checks reject missing restored coverage even when master/layer/mask
hashes are consistently updated, and verify that all prior-master pixels outside
the restoration masks remain unchanged. These checks preserve accepted pixels;
they do not certify hidden anatomy or full production fit.

### Remaining human review

Complete the concealed rear roots and connections in new versioned artwork, then
review strand ownership, scalp junctions, short-lock edges and curl rhythm against
independently authored anatomy. The current SE study ends at y868 (about 33 px
below the reference); SW ends at y830, close to the reference near y825.
Do not publish these drafts, claim complete detached hair or begin Step 6D before
the complete Step 6C package has been reviewed and approved.

## SE/SW revision-5 rear completion — design approved

After cleanup commit `e850c1c`, the user requested the next Step 6C increment.
This increment authors concealed rear backing and connects the far-side curls,
using each facing's own accepted rear as the imagegen edit target and its own
accepted master as alignment guidance. It does not overwrite approved source
files or infer production anatomy. Front/head PNGs remain revision 4.

The first additions left old extraction cuts visible at the joins. Explicit small
seam polygons therefore allow replacing selected cut-edge pixels in the **new**
rear PNG, while every pixel outside the completion mask stays identical to the
accepted rear. Generated RGBA is copied at native coordinates, with no scaling,
mirroring, interpolation or recolouring. The 8/255 alpha threshold remains fixed.
Existing visible curl coverage cannot be erased, including within seam repairs.

`front-diagonals-authoring-v5.json` selects `SE/SW-rear-drape-v5.png` and pins
baseline rear, generated artwork and binary mask hashes. Generated inputs,
polygons and derivation counts live in `inputs/front-diagonals-v5/`;
`front-diagonals-prompts-v5.json` records the built-in imagegen prompts and roles.
The source-authoring `complete-rear.js` writes new files only and refuses to
replace existing outputs. To reproduce in a fresh authoring checkout, run it
from the repository root under Node 24; do not run it over approved art.

SE adds 33,278 rear pixels and repairs 1,507 existing cut-edge pixels in the new
version. SW adds 37,076 and repairs 3,788. These are selection counts, not proof
of good strand topology. Original references, accepted master/front/head/rear
files, configurations and approval records remain intact. The approved visible
master is still the baseline; a completed rear can overlap behind the face and
cap, so the candidate is no longer a disjoint partition of that master.

```bash
pnpm hair:review:front-diagonals:completion
```

The new review uses separate ignored staging at
`assets/staging/heroine-v1/hair/long-waves-v1/front-diagonals-v5/`:

- `overview.png`: reference / approved visible master / candidate composition,
  with SE above SW. It is reduced only for inspection.
- `inspection/master-comparison/`: native comparisons of those same three views.
- `layers/` and `fit/`: native transparent candidate hair and rear/head/front fit.
- `hair-only-overview.png`: detached hair without the partial review head.
- `completion/` and `inspection/checker/*-selected-completion.png`: only the
  selected additions and repairs, for review against the accepted rear.
- `metadata.json`: added, repaired and repaired-reference pixel counts, source
  hashes, output hashes and remaining review gates.

The public review workflow still requires the **baseline** front/rear/head masks
to partition and reconstruct the approved visible master exactly. It additionally
checks that candidate rear pixels outside completion masks match the baseline,
selected pixels match the same facing's generated artwork, mask counts agree and
no selected patch erases visible reference hair. Front/head share the baseline
master and remain unchanged. The integration workflow also checks head-over-rear
occlusion and rejects a re-pinned rear edit outside its manual mask.

Inspect the far-side curl joins, narrow strand width, root growth and backing
behind the face/cap at native scale. The review head contains only visible study
pixels; a complete independent head/body and production T-pose fit are still
needed. The user approved the root/connection design on 2026-10-10 with “approved. commit and then continue”. `front-diagonals-review-v2.json` pins the config, source/cleaned layers and completion provenance. NE/NW and final Step 6C review remain
unfinished, and Step 6D has not begun.

Validation: affected tool typecheck, workspace lint, the completion CLI (including
its tool build), output-hash checks and preservation of all 66 prior asset
PNG/JSON files passed. The existing hair integration file passed its four earlier
workflows; the new revision-5 case initially failed because its negative order
swapped disjoint front/head layers. After changing that check to place rear hair
incorrectly over the head, the targeted revision-5 workflow passed, including
repeat generation and rejection of edits outside the mask. All five workflows
are verified with no remaining failure. Browser E2E was not rerun for this offline
art/review-tool increment. Rear-root design approval is recorded; independent anatomy fit remains open.


## NE/NW back-diagonal design — approved

After local approval commit `3b46839`, the user requested continuing Step 6C.
`back-diagonals-authoring-v1.json` now selects independently authored
`NE-rear-v1.png` and the initial `NW-rear-v1.png`. Each built-in imagegen edit used only its
own transparent standing reference; selected prompts and input roles are saved
in `back-diagonals-prompts-v1.json`. The rear layer owns the rear crown, long
drape and visible near-side locks for this draft; frontal fringe is explicitly
hidden in both directions. No head/body anatomy is supplied by this increment.

Initial generations enlarged the hair and were rejected before staging. The
selected native sources were copied without scaling, translation or reflection.
At the existing 8/255 alpha threshold, NE bounds are x233–687/y25–873 and NW
bounds x334–819/y31–843 (inclusive). Cleanup removes 13,050 and 11,757 near-zero
alpha pixels respectively; raw generation remains intact in source. The cleaned
layers show no visible glow, skin, eyes or clothing in manual inspection. These
observations require user review and are not anatomical certification.

```bash
pnpm hair:review:back-diagonals
```

Inspection outputs are separate ignored staging under
`assets/staging/heroine-v1/hair/long-waves-v1/back-diagonals/`.
`overview.png` compares original reference (left) and detached hair (right),
with NE above NW. Native `inspection/comparison/`, checker/green previews,
transparent `layers/` and `assembled/`, and hashed `metadata.json` support
review. Yellow labels and checker/green backgrounds exist only in inspection
outputs. The source layers remain transparent and label-free.

The existing public authoring workflow is parameterized for this pair as well
as S/N; no helper or enum test suite is added. It checks native placement,
explicit hidden fringe, transparent/green/yellow export conventions, repeatable
bytes and unchanged sources. NE/NW rear art is checked against identical and
reflected reuse; invalid reuse and visible-fringe configurations must fail
through the review API. Schema checks express layer visibility, not semantic
recognition of eyes in artwork.

Review curl silhouette/length, near-side locks, back crown orientation and
absence of face/eyes at native scale. Complete head/body anatomy and production
T-pose fit are still absent, so this is a detached standing-reference hair
design review. All eight directions now have candidate hair artwork across
the four review groups, and the pair design is approved in `back-diagonals-review-v1.json`. Earlier NE acceptance is preserved in `back-diagonals-ne-review-v1.json`. Stop after each subsequent anatomy increment
for visual review; Step 6C remains incomplete and Step 6D has not begun.

Validation for this increment:

- `pnpm hair:review:back-diagonals` passed, including the asset-tool build and
  generation of 15 hashed PNGs.
- `pnpm --filter @character-studio/asset-validator typecheck` passed after
  correcting union narrowing in the integration file.
- `pnpm lint` passed for the workspace.
- `pnpm test tools/asset-validator/src/hair-review.integration.test.ts -t
  'prepares.*native attachments'` passed both S/N and NE/NW cases.
- Final reflected-art checks passed with the same two-case command above. A filename-specific
  test filter matched no cases; it was replaced with the working workflow filter.
- All 68 prior source files, eight original reference images and staged output
  hashes matched; local documentation links and `git diff --check` passed.

No unresolved automated failure remains. Browser E2E and the full root build
were not rerun for this offline asset-review increment. NW visual design
approval and independent anatomy fit remain open.


## NW shoulder-curl correction

The user accepted NE and identified a missing curl over the NW shoulder.
`back-diagonals-ne-review-v1.json` records NE-only design approval, pinning its
frame and source/cleaned hashes. NE artwork and placement remain unchanged.

`NW-rear-v2.png` restores the narrow near-side shoulder lock from NW's own
transparent reference through a manually traced binary mask. The user previously
authorized manual masks; no new image generation or other-facing artwork is
used. The current draft config selects this corrected NW source. Original raw
`NW-rear-v1.png` is retained as the hash-pinned derivation input.

`inputs/back-diagonals-v2/restore-shoulder.js` records the polygon, rejects changed
inputs and writes new files only. `restoration-v2.json` pins input/output/mask
hashes and selected coverage; mask and selected-reference PNGs make the
correction inspectable. Warm skin and green spill are excluded locally.
Reference RGBA is unchanged inside the mask; baseline RGBA is unchanged outside.
Source layers keep transparency and native coordinates.

The existing public review workflow verifies the restored reference pixels in
both source and staged output, unchanged pixels outside the mask, provenance
hashes, counts and accepted NE hashes. This is a regression check within the
existing workflow, not an additional helper/unit test suite. The corrected
shoulder-curl join still needs visual review; complete anatomy/T-pose fit and
final Step 6C approval remain pending.

The tightened mask selects 1,117 reference pixels: 1,007 newly visible hair
pixels and 110 overlapping baseline pixels. A thin shoulder-outline fragment
seen in the first enlarged comparison was excluded before final review.

Validation: `pnpm hair:review:back-diagonals` (asset-tool build and 15 PNGs),
`pnpm --filter @character-studio/asset-validator typecheck`, `pnpm lint`, and
`pnpm test tools/asset-validator/src/hair-review.integration.test.ts -t
'prepares.*native attachments'` passed. After tightening the shoulder-edge mask,
the CLI and lint passed again, and
`pnpm test tools/asset-validator/src/hair-review.integration.test.ts -t
'prepares.*back-diagonals'` passed the final correction workflow (one passed,
five unrelated cases skipped). NE frame/source/cleaned hashes, 68 earlier
authoring files, all eight originals, 15 staging output hashes, local links and
`git diff --check` passed. No automated failure remains. Browser E2E was not
rerun for this localized offline art correction. NW visual approval is now recorded in `back-diagonals-review-v1.json`.


## Eight-facing design approval and anatomy follow-up

The user approved the corrected NW shoulder lock with “approved. commit and
continue to next step”. `back-diagonals-review-v1.json` pins the accepted
NE/NW config, raw/cleaned layers and shoulder-restoration provenance; earlier
NE-only approval remains unchanged. Local commit `464f9e4` freezes the pair.
All eight hair designs have standing-reference approval.

The next Step 6C increment authors S/N bald head and neck bases and checks
their native fit with these immutable hair layers; see
[modular-head.md](modular-head.md). The first comparison exposes S fringe
occlusion of the nose/eye area, requiring a new fit correction after head
geometry review. Final anatomy, body/clothing, T-pose and Step 6C approval
remain unfinished; Step 6D is not advanced.

After committing the S/N anatomy draft at `2474fde`, the next fit correction
uses a new S front/rear candidate in the anatomy source directory. It restores
native reference fringe/face-framing placement and removes duplicated rear
temple geometry, leaving four recorded facial samples clear. This fit pair
requires visual review and does not replace any approved hair source/config.
`pnpm head:review` selects it; `pnpm head:review:v1` retains the initial comparison.
