# Detailed renderer scaffold

Reserved for MVP milestone 3: native 1024 × 1536 detailed T-pose composition,
using PixiJS v8 for preview. It will consume validated RenderPlans and independently
authored directional artwork. Palette/mask composition and PNG export are not
implemented. Trait selection belongs to core and the registry.

The existing `renderer-pixi` is an empty-stage demo that consumes the legacy
Character contract. It is preserved for the current UI; it is not this target's
RenderPlan pipeline. Reuse its lifecycle code when the new contracts are ready.
