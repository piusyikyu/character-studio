# Asset registry status

The current registry is the preserved initial demo: unique flat IDs, one direction
per entry, integer geometry, and local `/assets/` PNG/WebP paths. It does not parse
the versioned manifest in `docs/ASSET_SPEC.md` and is not MVP-ready.

Milestone 2 must add catalog/schema/asset versions; target, pose, body and rig
lookups; traits; all-eight-facing coverage; native anchors and per-direction
planes; material/occlusion metadata; deterministic RenderPlans; and actionable
compatibility diagnostics. Missing facings or variants must fail, never mirror or
substitute. Migrate the demo API after the milestone 1 core contracts exist.
