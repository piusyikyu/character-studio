# Step 6C — first S/N modular hair draft

The user approved proceeding from the verified Steps 6A–6B audit on 2026-10-09.
This increment authors the long silver-lilac hairstyle for S and N and stops for
visual review. It does not complete Step 6C or approve the remaining art package.
Existing reference matte flags and candidate anchors remain observations, not
certified anatomy. Detailed production artwork still requires an authored T-pose.

## Authoring inputs and provenance

`assets/source/heroine-v1/hair-long-waves-v1/` holds versioned
reference-based authoring inputs. Built-in imagegen edits created the PNGs;
`prompts.json` records the selected prompts. The original eight references and
reference-import staging are preserved. New hair surfaces previously hidden by
the person are newly authored candidates, not recovered source pixels.
The two intermediate rear images used for targeted edits are preserved in
`inputs/`; only the three top-level PNGs are selected for review.

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
