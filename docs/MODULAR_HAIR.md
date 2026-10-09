# Step 6C — modular long-hair authoring

The user approved proceeding from the verified Steps 6A–6B audit on 2026-10-09.
The initial S/N hair design has user approval recorded in `review-v1.json`.
The independent E/W hair design also has user approval recorded in
`profiles-review-v1.json`. Both approval records pin source and cleaned hashes.
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

The planned next authoring increment is SE/SW, followed by independent NE/NW.
All four diagonal facings and modular body/head/clothing authoring remain
unfinished. Keep NE/NW eyes and front-only fringe hidden. Final Step 6C review
still precedes material/shade maps, pixel counterparts or publication.
