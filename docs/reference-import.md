# Heroine v1 reference import — Steps 6A–6B

The approved source pack lives in `assets/references/heroine-v1/detailed/`:
`N.png`, `NE.png`, `E.png`, `SE.png`, `S.png`, `SW.png`, `W.png`, `NW.png`.
These are eight independently supplied **flattened standing illustrations**, not
modular sprites or the current detailed rig's T-pose. The approved NE/NW dress
corrections remain in the original files. This workflow never writes to them,
mirrors a facing, creates artwork, reconstructs anatomy or publishes assets.

## Run in WSL2 Ubuntu

From the repository on the Linux filesystem:

```bash
source "$HOME/.nvm/nvm.sh"
nvm use
pnpm install --frozen-lockfile
pnpm reference:import
pnpm verify
```

The portable Node 24 CLI belongs to `tools/asset-validator`. Its build bundles
workspace dependencies and the existing JavaScript PNG codec. No browser, Windows
graphics library, image-generation service or external image editor is involved.
`pnpm reference:import` is an explicit batch operation; app development/builds
never import or publish these references automatically.

## Inputs and versioning

`assets/references/heroine-v1/import-v1.json` is a strict Zod-validated version-1
review configuration. It pins each approved PNG's SHA-256 hash, native dimensions,
explicit label rectangles, matte settings, candidate landmarks and shoe search
regions for all eight directions. Missing files, changed hashes, wrong dimensions,
invalid PNG CRCs, unsupported formats or duplicate files abort before outputs are
written. RGB8 and RGBA8 sources are supported; staging is straight RGBA8.

Source hashes are rechecked after processing. Output paths cannot overlap the
source/settings paths or traverse symlinks. Originals are opened for reading only.
An intentional change to approved source imagery needs a reviewed new pack/import
version, rather than silently updating the hash lock. Candidate metadata is not
an approved rig profile or runtime asset manifest.

Processing revision 2 adds `se-curl-gap-v1`, a localized background correction at
native x=290, y=720, width=45, height=60. The screen inside that lower-left curl is
mint green with higher red/blue values than the global key allows. The correction
permits red/blue up to 160 only within that reviewed region, allowing background
samples and transparent pixels there. Estimated edges within the region also
receive green-spill suppression; core non-green hair pixels remain byte-identical.
This corrects the import without modifying the source or relaxing other facings.
Correction settings and the processing revision are included in audit metadata,
so regeneration repeats the fix. Staging remains subject to human review.

## Staging outputs

Everything generated goes into the ignored directory
`assets/staging/heroine-v1/references/import-v1/`. Re-running the same inputs and
settings overwrites these derived outputs with identical bytes. No timestamps or
machine paths enter metadata; PNGs use the existing fixed codec settings.

| Output | Purpose |
| --- | --- |
| `transparent/{direction}.png` | Eight native 1024 × 1536 transparent full-character PNGs; no labels |
| `contact-originals.png` | Native 4096 × 3072 contact sheet, order N/NE/E/SE then S/SW/W/NW |
| `overview-originals.png` | 1024 × 768 inspection thumbnail of the source sheet |
| `overview-checker.png`, `overview-green.png` | Matching inspection overviews with fresh preview labels |
| `inspection/checker/{direction}.png` | Native checkerboard preview of transparency |
| `inspection/green/{direction}.png` | Native pure #00FF00 background preview with fresh yellow direction label |
| `inspection/review/{direction}.png` | Matte diagnostics over checkerboard |
| `inspection/anchors/{direction}.png` | Candidate cyan landmark crosses and orange measured baseline |
| `metadata.json` | Versioned measurements, source/output hashes, settings and candidate anchors |
| `audit.md` | Human-readable findings and the review gate |

Overview downsampling is **only** for inspecting a contact sheet. It does not
author a pixel target, and native staging PNGs retain their original positions,
dimensions, pose, proportions and clothing detail. The green preview has a pure
green background; antialiased foreground boundaries naturally composite with it.

## Green-screen and label processing

The sources contain opaque RGB and a non-uniform green screen. Matching only
`#00FF00` would miss most background pixels. The importer identifies high-confidence
green samples and non-green foreground, then propagates observed nearest colours
within a six-pixel Manhattan edge band. It estimates coverage using the observed
mixture `C = alpha × F + (1-alpha) × B`, unmixed against local green samples.
For narrow enclosed openings without a nearby background sample, it uses the
pack frame's median green and marks that estimate for review.

Only green-dominant boundary RGB is unmixed. Core non-green foreground and its
existing alpha are preserved exactly. Broad green regions are made transparent;
partial edge alpha is retained instead of applying a hard binary silhouette.
Zero-alpha pixels are normalized to zero RGB, preventing hidden green bleeding.
Coverage below 3% is treated as background noise. This threshold is versioned and
must be reviewed against very faint curls; an original alpha channel cannot be
uniquely recovered from flattened RGB. No blur, erosion, dilation, geometry
transform or foreground inpainting is performed.

Six sources have baked labels in the reviewed top-left 180 × 110 margin; N/S have
none. Only those explicit rectangles are excluded from staging. Their foreground
pixel counts appear in the audit. No global yellow-colour deletion is used.
Yellow labels are newly drawn by the shared export decorator on inspection copies,
never on transparent staging. Review the margin before adapting this importer to
any other pack: the restriction does not prove an arbitrary source is art-free there.

## Measurements and candidate anchors

The metadata records dimensions; source/staging alpha histograms and counts;
background sample count, distinct RGB colours, channel ranges/means and common
colours; full/solid character bounds; approximate foot baselines; label removals;
changed boundary RGB counts; residual-green and uncertain 32 × 32 review tiles;
and disconnected retained fragments that might be incomplete masks or fine curls.

Anchor candidates were placed from visible head/hair, neck/skin, shoulder contours,
garment waist/hip contours and shoes. All have low confidence and require review.
Covered necks, far shoulders/hips and hidden feet have **null** coordinates.
Shoulder/hip/foot names refer explicitly to screen sides; anatomical left/right
identity remains unresolved. Garment/hair observations are not recovered bones.
No candidate is installed in the asset registry or used by the editor.

Foot measurements take the lowest row containing at least three pixels with
alpha >= 128 inside each reviewed shoe region. Fabric can overlap these regions,
so the measurements are approximate. The first import ranges from y=1438 (NW)
to y=1486 (SW), a **48 px spread**, exceeding the configured 8 px tolerance.
The importer flags this and leaves all poses in place. Whole-character bounds
are not interchangeable with foot baselines: hems can extend below a shoe.

Diagnostic overlays use red for residual green, orange for uncertain estimates
(poor fit, low coverage or median-background fallback), and cyan for other
estimated edge pixels. Counts are screening heuristics, not an art-approval score.
They do not detect every lost detail, green reflection or incorrect anatomical shape.

## Review gate before Step 6C

1. Compare the source contact sheet with both preview backgrounds. Inspect native
   per-direction PNGs at 100% and higher around fine curls, hair loops/ahoge,
   fingers, dark outlines, garment edges and shoe heels.
2. Use review overlays and metadata tiles to inspect residual green and uncertain
   foreground. Check retained fragments in SW/W, small enclosed green openings
   and possible faint details below the coverage threshold. Flag needed mask
   corrections on a new staging version; preserve approved originals.
3. Verify all six baked labels are absent from transparent PNGs and no character
   art lies in an exclusion margin. Preview/export labels should be fresh overlays.
4. Review candidate coordinates, shoe regions, observed baseline inconsistency and
   physical left/right mapping. Decide whether later rig work requires a different
   pose; these standing references do not satisfy the detailed T-pose contract.
5. Confirm the already-approved NE/NW dress corrections remain intact, rear eyes
   are absent in N/NE/NW, and directional clothing, feet and head remain coherent.
6. Attach human review to this exact pack/import version and output hashes before
   planning modular segmentation. Review alone does not publish runtime assets.

**Stop here.** Steps 6A–6B prepare reference staging. Step 6C segmentation, hidden
anatomy, palette-region authoring, modular layering, rig integration and production
pixel artwork are outside this task. The editor continues using placeholders.

## Verification

Three focused pipeline workflows test a known soft-edge/label/alpha case, the
real eight-image pack imported twice, and invalid/missing/changed input boundaries.
The real pack test checks native/contact-sheet sizes, label exclusion, transparent
RGB, fresh green/yellow previews, candidate metadata, source bytes/mtime preservation
and identical hashes for every generated file. It uses a temporary WSL directory
and removes only its own outputs. The full pack workflow has a longer timeout
because it encodes forty-four native/inspection PNGs twice.
