# N covered wardrobe candidate

This is an unapproved, independently authored posterior companion to the approved S study. The earlier N attachment registrations remain a separate unapproved draft. No S garment geometry, frontal bust masks or thigh opening is reflected into N.

The native everyday bra/back band/clasp and panties are separate, disjoint source partitions. The retained-surface torso and those garments reassemble the approved N body exactly. Source head, posed neck, arms, hands, legs, heel-oriented feet and rear hair are retained. The established N loader clears alpha below 8 in decoded scratch buffers; approved source files remain unchanged.

Only the fully clothed generated gown, opaque pelvic lining and bounded back/strap interface regions are selected. `settings.json` records independent N contours, the closed rear-skirt region, twelve-pixel maximum lateral garment seam allowance through the fitted bodice, two-pixel interior fabric selection, explicit closed side-panel coverage in the reference gown, and recovery of body-owned shoulder edge coverage from same-position study pixels with alpha >=200. The new garment is fitted to the fixed original body; no body point is moved or deformed.

The clothed preview without hair exposes the back neckline for inspection. A second preview uses the real N hair depth. A third, unfinished construction test separates the posterior waist section while keeping opaque pelvic/closed-skirt coverage. The front thigh slit stays out of sight from N. Head/eyes are not generated from a frontal frame. Source torsos are incomplete below clothes and cannot be exported alone as wearable states.

Coverage profiles are outfit/surface/facing specific. See `docs/modular-clothing.md` for the new strappy-top/smooth-chest requirement, explicit missing-surface diagnostics and the limits of the current study masks. A smooth chest variant without nipple detail has not yet been authored; its future use must not silently replace approved body art or disable coverage checks. No new runtime recipe control/catalog item is published.

Built-in imagegen was used once. Exact prompt and original reference image hashes are in `prompts.json` and `generation-record.json`. All source/review outputs remain native 1024x1536; the HTML displays inspection thumbnails only. Gloves, shoes, other facings, palette maps and final garment topology remain unfinished. Human review is required for matte edges, neckline, seam fit, drape and rear construction.

Replay after building asset-validator:

```bash
node assets/source/heroine-v1/outfit/dress-v1/north/construct-study-v1.js /tmp/heroine-n-wardrobe-replay
pnpm outfit:review:dress:north
```

Existing layer files cannot be overwritten by the replay script. Cleanup protects the declared current review and all construction dependencies. Step 6C remains open; Step 6D has not started.
