# Authoring sources

Keep versioned selected generation masters, reusable transparent parts,
material/shading maps and the settings/provenance needed to reproduce preparation.
Original flattened design references live in `assets/references/`.

On the alternative branch, the old heroine extraction/repair pack was removed.
It remains recoverable from Git history and local `master` commit `a8da310`.
No production anatomy pack is currently present in this folder.

Approve complete anatomy masters before catalogue expansion, then prepare useful
compatible parts and colour maps. Preserve each part's facing, physical side,
pose, support state and attachment/overlap geometry. A generated image is a
candidate until reviewed; missing surfaces and fitted variants remain unavailable.

Never overwrite approved versions without permission. Internal layers use real
RGBA transparency without export labels or backgrounds. Put disposable previews
in ignored `assets/staging/`; `pnpm assets:clean` removes that entire directory.
See [current handoff](../../docs/project-context.md) and
[asset specification](../../docs/asset-spec.md).
