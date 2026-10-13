# Source artwork

Packs are grouped by type under `heroine-v1/{hair,head,ears,face}/`. See
[asset-cleanup.md](../../docs/asset-cleanup.md) for the folder migration and
checkpoint archive. Keep selected derivation baselines here; obsolete previews
belong in ignored staging and can be removed with `pnpm assets:clean`.

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
