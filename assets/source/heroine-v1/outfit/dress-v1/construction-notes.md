# S covered wardrobe study

This Step 6C study is approved in `review-fit-v1.json`, limited to S. It preserves the approved body, head, hair, hands and heel-oriented feet; no runtime catalog or CharacterRecipe change is made. The pending N attachment study remains separate and unapproved.

Everyday bra and panties are independent, disjoint source partitions. Together with the exposed-surface torso they reproduce the approved body exactly. The torso alone is incomplete beneath those garments and must never be previewed/exported as a wearable state. It contains no newly authored intimate anatomy.

The fitted reference gown replaces the everyday underlayers with separate opaque bust cups and a high-cut pelvic lining hidden behind the gown. These are clothed fabric panels, not skin patches. The lining is S-specific, not a claim that the same cut works with every slit. Visible lining or missing bust/pelvic coverage must reject a combination. A different neckline, waist or slit needs its own compatible underlayer and exposed-surface patches.

The midriff/high-slit frame is a construction test: the corset's waist section is omitted up to the red sash while preserving the original belly pixels. It is not a finished second outfit. Bust and pelvic coverage are checked independently, so a continuous covered torso is not required. Neither preview exposes intimate areas.

Two fully clothed images were authored with built-in imagegen. The first fits the reference gown; the second exposes neckline/shoulder skin formerly hidden by hair while retaining the whole outfit. Exact prompts are in `prompts.json`. Approved head/hair/body pixels are reused instead of publishing either generated whole-character image.

`settings.json` records native ownership windows, two-pixel cloth-boundary ownership, bounded dress selection, opaque interior alpha normalisation, up to ten native pixels of fitted lateral seam allowance, explicit bust/pelvic coverage regions and the midriff test. Seam allowance copies adjacent new fabric/retains original dark edge ink; it does not transform the body. Interface patches include the selected study's neckline/slit antialiasing ink and visible skin only outside the required coverage regions. They are specific to this gown and are not a universal unclothed anatomy layer.

The two 1024x1536 previews are the actual source-layer composition with the approved head/hair and original limbs. The HTML comparison displays inspection thumbnails; source layers remain native. Palette maps, other facings, gloves, shoes and production outfit acceptance remain unfinished. Human review is required for garment topology, neckline, side seams, slit and matte quality.

Replay after `pnpm --filter @character-studio/asset-validator build`:

```bash
node assets/source/heroine-v1/outfit/dress-v1/construct-study-v1.js /tmp/heroine-s-wardrobe-replay
pnpm outfit:review:dress
```

Construction refuses to overwrite existing output layers. Current review outputs are declared in staging metadata and protected by cleanup. No new naked preview or complete unclothed body is generated.

Real-world references consulted on 2026-10-15:

- [Commando's underwear silhouettes](https://www.wearcommando.com/blogs/our-blog/the-essential-underwear-for-women): distinguishes lower-rise/higher-leg bikinis from fuller briefs and discusses choosing undergarments for the outfit.
- [David's Bridal fitting guidance](https://www.davidsbridal.com/content/style-guides/wedding-dress-try-on-tips-and-what-to-bring): discusses seamless underwear and strapless support for structured bodices.
- [A fully lined thigh-slit dress](https://www.davidsbridal.com/product/chiffon-spaghetti-strap-a-line-dress-with-slit-eds742013): a construction example, not proof that one lining pattern fits all openings.

The separate high-cut opaque lining is this project's design choice informed by those sources. It is not a garment pattern copied from them.
