# Source artwork

Packs are grouped by type under `heroine-v1/{hair,head,ears,face}/`. See
[asset-cleanup.md](../../docs/asset-cleanup.md) for the folder migration and
checkpoint archive. Keep selected derivation baselines here; obsolete previews
belong in ignored staging and can be removed with `pnpm assets:clean`.

`face/reference-v1/profiles-v1/authoring.json` selects the approved E/W
visible eye/brow/mouth layers. Each profile uses its own reference and explicitly
hides its opposite eye/brow. Native mask coverage changes alpha only; approved
profile anatomy/hair and accepted S/SE/SW sources stay unchanged. Replay its
partition script only in scratch. Review with `pnpm face:review:profiles`.
`profiles-v1/review-fit-v1.json` pins the visible standing-reference approval;
complete concealed surfaces, variants and production anatomy remain unfinished.

`heroine-v1/face/reference-v1/authoring-v5.json` selects the approved S neck-edge
hair-backing correction. Its generated study is an authoring input; only locally
masked hair pixels are consumed. Head/ear/facial inputs remain pinned to v4.
`review-fit-v5.json` pins standing-reference approval; brows and production anatomy
remain unfinished. See [modular-face.md](../../docs/modular-face.md).

`face/reference-v1/front-diagonals-v1/authoring-v2.json` selects the current SE/SW
facial candidate. A locally traced SE right-eye lower-lid mask excludes the broad
reference cheek tint with native alpha coverage. The other nine features and all
approved anatomy/hair stay exact; no source RGB is resampled or repainted.
Revision 1 and its feedback remain pinned derivation baselines. Both the original
partition and `trim-se-eye-cheek-v2.js` scripts must run only in scratch.
`front-diagonals-v1/review-fit-v2.json` pins the approved visible standing-reference
SE/SW facial fit, including that cheek correction. Production approval remains open.
Each direction retains only its own reference pixels and accepted anatomy/hair.
The approved S revision-11 source/configuration remains unchanged.

`face/reference-v1/review-fit-v11.json` pins approval of the S visible facial
and fringe-depth fit. Its selected layers, masks, studies and historical
configurations remain required baselines. Production approval is still pending.
The next bounded candidate separates native SE/SW facial layers over accepted
same-facing head/hair anatomy, retaining S exactly.

Current `face/reference-v1/authoring-v11.json` retains both exact v10 brow layers
and restores original v5 foreground-hair opacity above the left tail. Inputs in
`inputs/brows-v11/` select the unchanged contours; no new image study is needed.
The right-brow region stays exact. `review-fit-v10.json` records positive feedback
and the remaining overlap correction. Revision 11 has standing-reference fit approval; all
prior images, masks, configs and provenance remain pinned baselines.

The preceding `face/reference-v1/authoring-v10.json` restores fuller native brow bands
and a clean longer left tail. `inputs/brows-v10/` retains only the selected study
and native guides/masks; `prompts-v10.json` records selected/discarded provenance.
A new front-fit image changes only the bounded left-tail overlap, preserving
all approved source files. Head/ears/neck/rear hair/features/folds stay exact.
Revision 10 needs visual approval. Earlier configs, studies and rejection records
remain required baselines; generated pixels outside the brow masks are discarded.

The rejected `face/reference-v1/authoring-v9.json` attempted to repair the v8
sharp right brow join and abrupt left tail. The right uses one native study curve, the left
uses its native reference curve, both with manually authored tapered coverage.
Inputs are in `inputs/brows-v9/`; `prompts-v9.json` pins the guide and selected
study. Approved anatomy/hair/features/folds remain exact. Revision 9 was rejected
for brow thickness/length and the tail line. Older configs, studies/masks and
rejection records remain required baselines; generated edits outside the right brow are discarded.

The rejected `face/reference-v1/authoring-v8.json` repaired the rejected v7 brow crossing
lines with two bounded native study patches and revised brow-band masks. Inputs
are in `inputs/brows-v8/`; `prompts-v8.json` pins the guide and selected study.
Generated background/unselected pixels are discarded. Approved v5 anatomy/hair,
original features and retained eyelid folds stay exact. Revision 8 was rejected
for an abrupt tail and sharp transition. Source v6/v7 and their rejection records
remain required baselines.

The rejected `face/reference-v1/authoring-v6.json` selects partial native S
purple eyebrow curves. The previous brow-labelled pale patches are retained as
upper-eyelid folds; approved revision-5 anatomy/hair and original eyes/mouth remain
exact. New inputs and masks are in `inputs/brows-v6/`. No new raw study is needed.

Revision 6 was rejected for a right-brow gap and shortened left curve, recorded
in `review-fit-v6.json`. The rejected `authoring-v7.json` widened both native reference
contours through their fringe junctions. New masks are in `inputs/brows-v7/`;
approved v5 anatomy/hair and retained eyelid folds remain unchanged. Revision 7
was rejected for crossing fringe lines; prior sources remain pinned derivation baselines.

Contains versioned layered source files and authoring inputs. The initial
`heroine-v1/hair/long-waves-v1` PNGs have S/N design approval and remain unpublished authoring drafts, with
hashes, selected imagegen prompts and provisional geometry in their review JSON.
The E/W profile PNGs also have standing-reference design approval; their config
and prompts are prefixed `profiles-`, with accepted hashes in
`profiles-review-v1.json`. Approved S/N hashes remain pinned in `review-v1.json`;
production T-pose/head/body compatibility is still pending.
SE/SW revision-4 visible hair drafts and manually masked layers have design
approval, pinned in `front-diagonals-review-v1.json`, with missing far-side curls
restored from each original reference.
The masked reconstruction retains every visible study pixel; hidden roots
and complete heads remain unfinished. Their configuration and prompts are prefixed
`front-diagonals-`; approved S/N/E/W sources and revision-3 inputs needed to reproduce
the accepted SE/SW restoration are preserved. Rejected iterations are archived in
Git history at `d2ec13f`, rather than kept in the working tree.
`SE/SW-rear-drape-v5.png` and `front-diagonals-authoring-v5.json` are new,
approved rear-root/connection designs, pinned in `front-diagonals-review-v2.json`. Native masks and generated inputs are
in `inputs/front-diagonals-v5/`, with prompts in `front-diagonals-prompts-v5.json`.
They retain the approved revision-4 files and front/head layers; small cut-edge
repairs change only selected pixels in the new candidate.
See [modular-hair.md](../../docs/modular-hair.md). Preserve approved versions; do not overwrite them without
permission. Source layers must be transparent and contain no export labels or
green background.

SE/SW revision-5 rear-root and curl-connection design is approved in
`front-diagonals-review-v2.json`; complete anatomy and production fit remain pending.

Independent NE/NW rear-crown/drape candidates are `NE-rear-v1.png` and
`NW-rear-v2.png`, with `back-diagonals-` authoring config/prompts. Both hide
frontal fringe. NE design approval is pinned in `back-diagonals-ne-review-v1.json`;
NW shoulder-curl restoration is approved in `back-diagonals-review-v1.json`. The raw NW version1 is retained for
native mask reproduction in `inputs/back-diagonals-v2/`. Complete anatomy remains pending.

`heroine-v1/head/soft-oval-v1/` contains independent S/N bald skin masters,
head/neck partitions, native ownership masks and placement-guide provenance.
These anatomy drafts are unapproved and omit eyes/brows/mouth. Human ears
remain embedded pending independent variants. See
[modular-head.md](../../docs/modular-head.md) for the initial S fit discrepancy,
versioned front/rear fit correction and remaining anatomy/body/T-pose work.
All approved hair and version-1 anatomy sources are unchanged.
Revision 2's standing-reference fit is approved in `review-fit-v2.json`.
Revision 3's local patches were visually rejected because mismatched contours
left disjoint strokes and cropped cheeks. Revision 4 instead partitions the
complete S hair from one shared study at native coordinates, preserving a
continuous drawing. Warm skin/context is excluded by bounded manual masks;
front and rear have disjoint ownership, with the complete head between the
foreground fringe and posterior ear lock. `authoring-v4.json`,
`prompts-coherent-v4.json` and `inputs/partition-coherent-fit-v4.js` retain its
provenance. The raw study is not a runtime layer. Original anatomy, approved
hair, v2 approval and N remain unchanged. This candidate needs visual review.

Revision 5 preserves the entire revision-4 hair drawing and changes only
front/rear ownership at S's left ear. A contour-shaped inward/lower extension
moves 247 existing side-lock pixels behind the complete ear/lobe. It introduces
no newly generated or recoloured hair. `authoring-v5.json` pins the previous
config, unchanged hair master and new ownership masks; the reproducible script
is `inputs/partition-ear-depth-v5.js`. The user generally approved this standing-reference fit with known hair noise; `review-fit-v5.json` pins that limited approval. Production anatomy remains unfinished.
