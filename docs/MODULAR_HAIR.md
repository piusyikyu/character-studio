# Step 6C — modular long-hair authoring

The user approved proceeding from the verified Steps 6A–6B audit on 2026-10-09.
The initial S/N hair design has user approval recorded in `review-v1.json`.
The independent E/W hair design also has user approval recorded in
`profiles-review-v1.json`. Both approval records pin source and cleaned hashes.
The SE/SW revision-4 visible hair draft has user approval recorded in
`front-diagonals-review-v1.json`; body-occluded connections remain unfinished.
It does not complete Step 6C or approve the remaining art package.
Existing reference matte flags and candidate anchors remain observations, not
certified anatomy. Detailed production artwork still requires an authored T-pose.

## Authoring inputs and provenance

`assets/source/heroine-v1/hair-long-waves-v1/` holds versioned
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
`assets/staging/heroine-v1/hair-long-waves-v1/`:

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

Outputs go to `assets/staging/heroine-v1/hair-long-waves-v1/profiles/`, following
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

SE/SW is the current authoring increment, awaiting design review. Independent
NE/NW and modular body/head/clothing authoring remain unfinished. Keep NE/NW eyes
and front-only fringe hidden. Final Step 6C review still precedes material/shade
maps, pixel counterparts or publication.

## SE/SW front-diagonal review

The user questioned the revision-1 front/rear combination in `front-diagonals/overview.png`.
Inspection confirms that the detached result is not sufficient for design
approval: SE has an exposed abrupt rear-root boundary and mismatched cap/root
geometry; SW rear roots show through the face/neck opening without the head/neck
occlusion that a real character composition requires. The prior passing tests
prove deterministic compositing, not a visually coherent hair fit.

A pixel-by-pixel audit confirmed both assembled images equal rear-then-front
source-over at `(0,0)` and the overview exactly equals the reduced native
comparison images. There is no swapped layer order, swapped facing or overview
placement error. Reversing the planes or moving whole PNGs would not establish
correct anatomy. Current source PNGs and configurations are retained as review
evidence; SE/SW have no approval record.

The correction plan called for one common head/scalp layout per facing,
versioned replacements for the mismatched upper rear junctions fitted to the
front cap, and inspection of `rear hair -> head/neck -> front hair` with an explicit
head/neck review asset. Such an asset must be identified as a review fixture until
real anatomy is authored and approved. Keep a separate hair-only diagnostic so
occlusion cannot conceal seams or be mistaken for proof of production fit.
Resolve this SE/SW review before proceeding to NE/NW.

Four source PNGs (`SE-front.png`, `SE-rear-drape.png`, `SW-front.png`,
`SW-rear-drape.png`) are independently authored from each facing's own reference.
`front-diagonals-authoring-v1.json` pins the selected source and transparent
reference hashes, native bounds and candidate origins. The front layer owns the
cap, single loop ahoge, asymmetric bangs and short locks. The rear drape completes
hidden strands and removes the duplicate crown. These are standing-reference
design candidates, not approved anatomy or a completed modular character.

Built-in imagegen prompt history and selected edit lineage are in
`front-diagonals-prompts.json`; raw/normalized intermediate inputs are in
`inputs/front-diagonals/`. Oversized, undersized and ear-contaminated variants were
rejected. Scale corrections were new imagegen edits to unapproved candidates;
the review command never resizes, translates or mirrors artwork. The same
8/255 alpha cleanup and invisible-RGB normalization applies, with lineage hashes
in `inputs/front-diagonals/cleanup-v1.json`. Approved S/N and E/W inputs and
their approval records remain unchanged.

```bash
pnpm hair:review:front-diagonals
```

Revision-1 outputs used `assets/staging/heroine-v1/hair-long-waves-v1/front-diagonals/`:
four native transparent layers, two detached assembled images, checker/green
previews, native comparisons, an overview and metadata. The comparison shows
the original on the left and detached hair on the right; it does not simulate
head/body occlusion. Reports describe this pair only. Across the three configs,
six hair facings have drafts, four have standing-reference design approval,
and NE/NW have no hair drafts yet.

Candidate origins SE `(554,164)` and SW `(454,175)` are low-confidence reference
observations. Front/rear origin equality preserves top-left `(0,0)`; it does not
prove scalp fit. Review the native comparisons, curl lengths, near/far locks,
root continuity and alpha edges before approving SE/SW design. Actual head/body
and T-pose fit remain a later review within Step 6C. After this pair's design
review, the next hair increment is independently authored NE/NW.

Native review measurements (inclusive terminal y):

| Layer | Visible bounds x/y/width/height | Terminal y | Main design difference |
| --- | --- | --- | --- |
| SE front | 420 / 33 / 298 / 329 | 361 | Broader cap, longer short curls than reference y325 |
| SE rear | 274 / 260 / 491 / 583 | 842 | Outer-left edge narrower than reference x195; upper roots need fit review |
| SW front | 308 / 19 / 336 / 428 | 446 | Broader cap, curls below reference collarbone near y345 |
| SW rear | 264 / 180 / 633 / 710 | 889 | Broader drape and curls below reference near y825 |

All four cleaned layers have genuine transparent margins and zero detected green
candidates. That diagnostic cannot establish anatomical coherence. The SW upper
repair replaces a straight-cut draft with newly authored tapered strands; inspect
their overlap behind a future head rather than approving the detached composite
as evidence of face fit. SE's partial upper roots also need that head/neck review.
Neither body preset nor a production T-pose rig is declared compatible yet.

Validation for this increment: `pnpm hair:review:front-diagonals` generated 21
inspection PNGs plus metadata. `pnpm verify` passed typecheck, zero-warning lint,
all 36 tests in 10 files and the workspace build. The SE/SW integration workflow
recreates transparent references from tracked originals, checks native positions
and facing plane order, rejects omitted/reused layers, and repeats byte-identical
outputs. Existing S/N and E/W approval hashes are checked too. A separate source
check confirmed all 34 pre-existing source/reference files unchanged and all nine
normalized edit-input derivations preserve visible RGBA. Browser E2E was not
rerun for this offline authoring/tooling change; the editor still uses placeholders.
SE/SW user design approval has not been recorded and no production art is published.
The subsequent visual review above supersedes any implication that passing
these checks made the combined design acceptable.

### Revision 2 — junction repairs and explicit fit inspection

The user requested fixing SE/SW. Built-in imagegen edits produced versioned
`SE-rear-drape-v2.png` and `SW-rear-drape-v2.png`. SE's severed horizontal root
boundary is replaced by continuous curved roots; SW's pointed root flap is
replaced by a smooth rear scalp fan. Existing front PNGs, revision-1 rear PNGs,
configs and all approved S/N/E/W inputs are preserved. These new designs need
human review; they are not an approval record.

`front-diagonals-authoring-v2.json` pins the new rear hashes and explicit
`reviewRevision: 2`. It defines independently positioned, synthetic **faceless
scalp/neck polygons** for each facing. These plain guides are deterministic
review fixtures, not extracted anatomy, authored character faces or production
rigs. Face candidates generated during the repair did not fit the cap and were
rejected. The guides make the intended `hair-rear -> head/neck -> hair-front`
occlusion inspectable without certifying anatomy. Their coordinates remain
provisional and the same native origins yield `(0,0)` for every hair layer.

`pnpm hair:review:front-diagonals` initially selected revision 2. Its main
`front-diagonals/overview.png` shows each reference on the left and the new hair
with the synthetic guide on the right, marked **FIT DRAFT**. In addition to the
original hair-only outputs, it writes:

- `hair-only-overview.png`: both revised rear/front pairs without occlusion,
  allowing direct inspection of the junctions and hidden rear surfaces.
- `fixtures/`: native, transparent, label-free synthetic guides.
- `fit/`: native transparent rear/guide/front composition.
- `inspection/checker/*-fit.png`, `inspection/green/*-fit.png` and
  `inspection/fit-comparison/`: marked native fit previews and comparisons.
- Metadata with separate fixture measurements, input/output hashes,
  `fixtureAnatomyApproved: false` and the main overview's declared content.

Fit labels appear only in inspection copies; neither hair layers nor transparent
fit buffers contain text or green backgrounds. The hair-only `assembled/` and
`inspection/comparison/` outputs retain their original meaning. Historical
revision-1 staging was copied to `front-diagonals-v1/` for local comparison;
tracked revision-1 inputs can also reproduce it through `prepareHairReview`.

The repair reauthored some lower curls as well as roots. New native bounds:

| Revised rear | x / y / width / height | Terminal y | Difference from revision 1 |
| --- | --- | --- | --- |
| SE | 308 / 238 / 478 / 637 | 874 | 32 px longer; narrower and shifted curl silhouette |
| SW | 300 / 235 / 609 / 660 | 894 | 5 px longer; new upper root flow |

The pipeline does not move or scale these PNGs. Front lengths remain SE y361
and SW y446. Review these design differences and alpha edges along with the
repaired seams. A fixture can establish draw order and reveal candidate fit;
it cannot prove shoulder/body/T-pose compatibility. SE/SW approval is still
pending, and NE/NW authoring and Step 6D remain gated by the existing reviews.

`front-diagonals-prompts-v2.json` records the complete built-in prompt set,
selected outputs and rejected attempts. Selected SE intermediate raw/cleaned
inputs, the four normalized revision-1 hair inputs used as edit guides, and
cleanup provenance are in `inputs/front-diagonals-v2/`.

Revision-2 validation: `pnpm hair:review:front-diagonals` passed and wrote 36 PNGs
plus metadata. `pnpm verify` passed workspace typecheck/lint and 36 of 37 tests,
then stopped on a new test that incorrectly assumed fully opaque front hair;
the source's maximum alpha is 254/255. The assertion was corrected to check
source-over alpha blending without changing artwork. Affected typecheck
(`pnpm --filter @character-studio/asset-validator typecheck`), `pnpm lint`,
`pnpm test tools/asset-validator/src/hair-review.integration.test.ts` (all five
workflows) and `pnpm build` then passed. The other nine test files passed in the
full run; there are no outstanding test failures. Browser E2E was not rerun for
this offline tool/art change. `git diff --check` passed.

Workflow checks cover head-over-rear/front-over-head blending, an intentionally
wrong draw order, native overview layout, fixture rejection when missing,
unchanged hair-only assembly, byte-identical regeneration and approved hashes.
Separate checks confirmed all 58 existing source/reference inputs unchanged,
all 36 staging output hashes correct, zero hair green candidates and all five
normalized edit-input derivations preserving visible RGBA. Human design and
production anatomy/T-pose review remain outstanding.

### Revision 3 — coherent facing studies and native mask partitions

The user rejected revision 2: the cap and drape still did not read as one SE/SW
hairstyle. Source lineage used each facing's own reference, but independently
generated pieces drifted in size and perspective. Fixing root seams and adding
faceless guides did not resolve that design problem. Revisions 1 and 2 remain
preserved, unapproved evidence.

Built-in imagegen created a coherent head-and-hair study for each facing, using
only that facing's reference. Enlarged studies and separately regenerated layers
were rejected. The selected small native SE study sweeps left; SW sweeps right.
The user explicitly selected manually drawn masks to retain the study pixels.
No other-facing artwork is included in either masked pair.

`front-diagonals-authoring-v3.json` now drives the review command. Selected raw
studies, normalized inputs, binary front/rear/head masks and manual region
coordinates are preserved in `inputs/front-diagonals-v3/`. Warm skin selection
is limited to manually bounded head/neck regions; separate eye polygons and dark
outline selection prevent facial pixels being assigned to hair. Front polygons
assign the crown, ahoge, bangs and short locks; remaining visible hair belongs to
the rear. The masks copy each selected pixel's full RGBA, with no interpolation,
resizing, translation, reflection or recolouring. The same 8/255 normalization
threshold clears near-zero speckles before partitioning. Prompts and rejected
generation stages are documented in `front-diagonals-prompts-v3.json`.

Every visible normalized master pixel has exactly one owner. The review tool
hash-checks all three masks and layers, verifies binary masks and exact master
pixel ownership, then verifies the transparent reconstruction is byte-identical
in RGBA to the whole-facing study. This catches renewed scale drift, foreign
pixels and partition gaps even if a layer's file hash is updated. It does not
prove visual design approval. Revision-2 overlapping-fixture tests remain as
separate coverage of head-over-rear/front-over-head compositing; the revision-3
visible partition deliberately has no overlap and cannot certify hidden fit.

The main `front-diagonals/overview.png` has **three columns**, left to right:
original reference, whole-facing study, masked reconstruction. SE is the top row
and SW the bottom. `inspection/master-comparison/{SE,SW}.png` retains the full
3072×1536 comparison for native inspection. `masters/`, `fixtures/`, `layers/`
and `fit/` contain transparent native imagery; labels and green backgrounds are
restricted to inspection copies. `hair-only-overview.png` remains a separate
detached-hair diagnostic. Metadata explicitly records exact visible partition,
pending hidden-root completion and a review head containing only visible study
pixels. Local revision-2 staging is preserved in `front-diagonals-v2/`.

**This fixes shared visible geometry, not the complete modular asset.** Masking
cannot invent hair behind the head or reconstruct a full bald scalp. The rear
therefore has hidden gaps, and front/rear mask boundaries need review for strand
ownership. Complete those concealed roots after this coherent design is accepted,
then fit against independently authored anatomy. The selected SE study ends at
y868 (about 33 px below its original hair), while SW ends at y830, close to its
original near y825. Newly exposed rear strands are authored rather than recovered
source pixels. Inspect curl rhythm, face/ear mask edges and short-lock ownership.
SE/SW remain unapproved; NE/NW, production rig/T-pose fit and Step 6D do not advance.

The native front bounds are SE `(410,26,258,316)` and SW `(340,23,269,356)`;
rear bounds are SE `(194,130,475,739)` and SW `(340,188,523,643)`.
Front terminal y is now SE 341 and SW 378, compared with the rejected revision-2
fronts at 361 and 446. All four hair layers have zero detected green candidates.
The preserved raw-study normalization clears 19,100 near-zero speckles for SE
and 17,270 for SW, with every retained visible RGBA channel unchanged.

To reproduce these unapproved source partitions from preserved raw studies, run
`node assets/source/heroine-v1/hair-long-waves-v1/inputs/front-diagonals-v3/partition.js`
from the repository root under Node 24. This is an explicit authoring operation,
not part of the read-only review command. Changing the manual regions requires
a new reviewed source version and updated config hashes.

Revision-3 validation: `pnpm hair:review:front-diagonals` generated 44 PNGs plus
metadata. Workspace `pnpm typecheck`, `pnpm lint`, `pnpm test` (38 tests in 10
files) and `pnpm build` passed. After extending the same-master guard to the
review head, affected tool typecheck/build and lint passed again, followed by
`pnpm test tools/asset-validator/src/hair-review.integration.test.ts -t front-diagonals-authoring-v3`
(one workflow passed; five unrelated workflows skipped by the name filter).
The workflow includes exact reconstruction, deterministic regeneration and
rejection of an altered pixel even after updating its file hash. A separate
check verified all 70 pre-existing source/reference inputs unchanged, all 44
staging output hashes correct and raw-to-normalized visible RGBA unchanged.
`git diff --check` passed. Browser E2E was not rerun for this offline art/tool
change. Human design review, hidden roots and production anatomy fit remain open.

### Revision 4 — restore omitted far-side reference curls

On 2026-10-10 the user marked missing hair on the character's left in SE
(screen-right) and her right in SW (screen-left). The omission was in the
generated revision-3 studies, before masking. Exact reconstruction of those
studies proved pixel preservation, but did not prove complete visible reference
coverage. Revision 3 remains preserved as review evidence, without approval.

The correction uses the previously authorized manual-mask method, without new
image generation. Native polygons trace the visible far-side hair in each
facing's own transparent reference. Boundary selections exclude warm skin/red
garment pixels (`R - B > 15`) and reference-matte green spill
(`G - max(R,B) > 20`); retained RGBA channels are copied unchanged. SE restores
10,921 pixels and SW restores 4,789. Every added pixel occupied a transparent
location in its prior master, so no existing revision-3 head, cap, front locks,
curl geometry or alpha is changed. These are source-based extractions, not
mirrored parts or newly generated curls.

Versioned `*-master-v4.png` and `*-rear-drape-v4.png` include the additions.
The versioned front and visible-head PNGs have identical RGBA to revision 3.
`inputs/front-diagonals-v4/` preserves the selected fragments, native binary
restoration masks, hand-drawn polygon coordinates, hashes and reproducible
authoring scripts. `side-restoration-v4.json` records the original reference and
prior master provenance; `partition-v4.json` records the resulting layer masks.
Run `restore-side-hair.js` followed by `partition.js` in that folder from the
repository root to reproduce these unapproved authoring outputs. Neither script
is invoked by the read-only review command; changed selections require a new
version and updated authoring hashes.

`pnpm hair:review:front-diagonals` now selects
`front-diagonals-authoring-v4.json`. Along with the existing exact master
partition check, it verifies that every restored pixel remains identical to its
reference in both the master and rear hair, and that selected coverage matches
the pinned count. The regression workflow checks native sample points on both
sides and rejects a lost reference pixel even when master/layer/mask file hashes
are consistently updated. Original source imagery and all prior versions stay
unchanged. Local revision-3 staging is retained in `front-diagonals-v3/`.

The overview still reads reference / corrected study / masked reconstruction.
`restored/` and `inspection/checker/*-restored-reference-hair.png` also isolate the
restored pieces. The reference's body covered parts of these far-side strands:
**transparent gaps between fragments remain** until those hidden connections are
authored. Do not call this a complete detached hairstyle or production head/body
fit. This revision restores the visible portions identified by the user; SE/SW
design approval and the remaining Step 6C work are still pending.

Revision-4 validation: `pnpm --filter @character-studio/asset-validator typecheck`,
`pnpm lint`, `pnpm --filter @character-studio/asset-validator build`,
`pnpm hair:review:front-diagonals` and
`pnpm test tools/asset-validator/src/hair-review.integration.test.ts` all passed
(six workflows). The first test run passed five workflows and rejected the new
rear layer because 20 SE and 19 SW green fringe pixels were copied from reference
staging. The extraction masks now exclude those 39 matte remnants without
recolouring retained hair; all six workflows passed on the corrected sources.
The current generation writes 48 PNGs plus metadata, with zero detected green
candidates in all four hair layers. A separate native RGBA audit verified every
restored pixel against its reference, unchanged master pixels outside the masks,
exact reconstruction and preservation of all 93 previous source/reference
PNG/JSON inputs. `git diff --check` passed. Whole-workspace tests/build and browser
E2E were not rerun for this focused offline authoring correction. No outstanding
test failures remain; visual review and hidden connections are still required.

### SE/SW visible draft approval — 2026-10-10

The user approved the current revision with “approved. commit”.
`front-diagonals-review-v1.json` pins the selected revision-4 config, raw and
cleaned front/rear layer hashes, masters, partition/restoration masks and the
partial review-head evidence. The existing public review workflow now checks
the accepted config and layer hashes against that record.

Approval covers the current visible standing-reference hair design, native
mask partition and restored far-side curls. It does not approve the partial
heads as anatomy or complete the detached hairstyle. Body-occluded connecting
hair, hidden scalp roots, separately authored head/body/T-pose fit, NE/NW and
full Step 6C review remain outstanding. Earlier revisions remain unapproved
history. All historical “pending review” statements above describe those earlier
states; this record accepts the current visible draft. No Step 6D work advances.
