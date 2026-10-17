# Clothing fitting and coverage

Anatomy owns body geometry and surfaces. Clothing fits the selected anatomy;
anchors only place already compatible parts. Underwear cut and support are
explicit reusable choices. Garments may need different prepared variants for
chest, hips, build, pose or support, while unrelated accessories can be reused.
See [the product target](character-vision.md) for authoring and export requirements.

The old S/N heroine wardrobe studies and their unavailable-art checkpoint were
retired on the alternative branch. They remain in Git history and local `master`
commit `a8da310`. No production underwear family or fitted outfit is available.

Two generic offline checks remain in `tools/asset-validator/src/`:

- `wardrobe-compatibility.ts` validates authored garment/body-surface/facing
  profiles. Each profile has its own native coverage masks; one bra footprint
  cannot serve as the requirement for every top. Exposed waists are independent
  of required opaque panels. Missing/wrong-facing surfaces, missing or empty
  masks and insufficient garment alpha produce errors.
- `wardrobe-surface-fit.ts` assembles complete versioned surfaces before fitting
  garments. Replacement ownership is disjoint, source silhouette alpha remains
  exact, and unavailable/incomplete surfaces fail. Garments name required
  surfaces and body/facing fits. When concealment is required, visible underwear
  through a neckline, midriff opening or slit is rejected rather than clipped.

These helpers have abstract integration coverage for different underwear cuts,
open waists, coverage, concealment and invalid fit boundaries. They are software
contracts, not automatic anatomical analysis or proof of universal compatibility.
Actual anatomy, underlayers and outerwear still need visual fitting approval.

For the anatomy-first proof, prepare one separable outfit against approved
masters and test it on two anatomy combinations before building a wardrobe.
High slits and exposed bellies require a compatible brief or lining. Do not
paint a new body into each outfit or rely on clothing to hide an incomplete join.
