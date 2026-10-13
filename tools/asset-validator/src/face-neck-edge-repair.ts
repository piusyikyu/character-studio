import { z } from 'zod';
import { assetSourceSchema } from '@character-studio/core';
import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const pin = z.strictObject({ source: assetSourceSchema, sourceSha256: hash });
const selected = pin.extend({ selection: pin });
export const faceNeckEdgeRepairSchema = z.strictObject({
  study: pin, settings: z.strictObject({ source: z.literal('inputs/neck-edges-v5/ownership-settings.json'), sourceSha256: hash }),
  front: selected, rear: selected, neck: selected,
});
export const faceNeckEdgeGeometry = {
  "backingPolygons": [
    [
      [
        479,
        254
      ],
      [
        495,
        257
      ],
      [
        495,
        283
      ],
      [
        492,
        295
      ],
      [
        490,
        309
      ],
      [
        478,
        313
      ],
      [
        474,
        306
      ],
      [
        478,
        293
      ],
      [
        481,
        280
      ]
    ],
    [
      [
        536,
        250
      ],
      [
        547,
        250
      ],
      [
        547,
        277
      ],
      [
        551,
        292
      ],
      [
        557,
        309
      ],
      [
        559,
        316
      ],
      [
        550,
        318
      ],
      [
        540,
        291
      ],
      [
        536,
        279
      ]
    ]
  ],
  "frontClearPolygons": [
    [
      [
        483,
        255
      ],
      [
        490,
        255
      ],
      [
        490,
        284
      ],
      [
        485,
        292
      ],
      [
        483,
        296
      ],
      [
        481,
        296
      ],
      [
        481,
        289
      ],
      [
        484,
        279
      ]
    ],
    [
      [
        540,
        254
      ],
      [
        545,
        254
      ],
      [
        545,
        283
      ],
      [
        548,
        293
      ],
      [
        555,
        312
      ],
      [
        552,
        313
      ],
      [
        546,
        298
      ],
      [
        542,
        284
      ]
    ]
  ],
  "excludedStudyPixels": [
    [
      536,
      250
    ],
    [
      537,
      250
    ],
    [
      538,
      250
    ],
    [
      539,
      250
    ],
    [
      540,
      250
    ],
    [
      541,
      250
    ],
    [
      536,
      251
    ],
    [
      537,
      251
    ],
    [
      538,
      251
    ],
    [
      539,
      251
    ],
    [
      540,
      251
    ],
    [
      536,
      252
    ],
    [
      537,
      252
    ],
    [
      538,
      252
    ],
    [
      536,
      253
    ],
    [
      537,
      253
    ],
    [
      489,
      256
    ],
    [
      490,
      256
    ],
    [
      491,
      256
    ],
    [
      490,
      257
    ],
    [
      491,
      257
    ],
    [
      492,
      257
    ],
    [
      493,
      257
    ],
    [
      494,
      257
    ],
    [
      492,
      258
    ],
    [
      493,
      258
    ],
    [
      494,
      258
    ],
    [
      494,
      259
    ]
  ],
  "frontFragmentPixels": [
    [
      544,
      293
    ],
    [
      545,
      296
    ],
    [
      545,
      297
    ],
    [
      546,
      299
    ],
    [
      547,
      302
    ]
  ]
} as const;

const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let selected = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected;
  }
  return selected;
};

/** Native local backing replaces cropped fragments; anatomy/ear/features are validated separately. */
export function validateFaceNeckEdgeRepair(images: {
  study: RgbaImage; anatomyStudy: RgbaImage; originalRear: RgbaImage;
  previousFront: RgbaImage; previousRear: RgbaImage; previousNeck: RgbaImage;
  previousRearSelection: RgbaImage; previousNeckSelection: RgbaImage;
  front: RgbaImage; frontSelection: RgbaImage; rear: RgbaImage; rearSelection: RgbaImage; neck: RgbaImage; neckSelection: RgbaImage;
}) {
  const g = faceNeckEdgeGeometry;
  const excluded = new Set(g.excludedStudyPixels.map(([x, y]) => y * 1024 + x));
  const fragments = new Set(g.frontFragmentPixels.map(([x, y]) => y * 1024 + x));
  const counts = { frontCleared: 0, frontActiveCleared: 0, rearBacking: 0, rearReset: 0, neckReset: 0 };
  const mask = (image: RgbaImage, i: number, selected: boolean) => {
    if (image.data.subarray(i, i + 4).some(v => v !== (selected ? 255 : 0))) throw new Error('Neck-edge masks must retain their manually traced native ownership.');
  };
  const owner = (image: RgbaImage, i: number, source: RgbaImage | undefined, name: string) => {
    if (image.data.subarray(i, i + 4).some((v, c) => v !== (source ? source.data[i + c] : 0))) throw new Error(`${name}: neck-edge correction must preserve native source ownership inside masks and unchanged pixels outside.`);
  };
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    const clear = g.frontClearPolygons.some(polygon => contains(x + .5, y + .5, polygon)) || fragments.has(p);
    const backing = g.backingPolygons.some(polygon => contains(x + .5, y + .5, polygon)) && !excluded.has(p);
    const resetRear = images.previousRearSelection.data[i + 3] === 255;
    const resetNeck = images.previousNeckSelection.data[i + 3] === 255;
    mask(images.frontSelection, i, clear); mask(images.rearSelection, i, backing); mask(images.neckSelection, i, resetNeck);
    owner(images.front, i, clear ? undefined : images.previousFront, 'Front hair');
    owner(images.rear, i, backing ? images.study : resetRear ? images.originalRear : images.previousRear, 'Rear hair');
    owner(images.neck, i, resetNeck ? images.anatomyStudy : images.previousNeck, 'Neck');
    if (clear) { counts.frontCleared++; if (images.previousFront.data[i + 3]! >= 8) counts.frontActiveCleared++; }
    if (backing) counts.rearBacking++;
    if (resetRear) counts.rearReset++;
    if (resetNeck) counts.neckReset++;
  }
  return counts;
}

/** Reference / previous / current at native crop coordinates, magnified for edge review only. */
export function faceNeckEdgeComparison(reference: RgbaImage, previous: RgbaImage, current: RgbaImage) {
  const crop = { x: 455, y: 242, width: 120, height: 76 }, scale = 4;
  const out = blankImage(crop.width * scale * 3, crop.height * scale);
  for (const [column, image] of [reference, previous, current].entries()) for (let y = 0; y < out.height; y++) for (let x = 0; x < crop.width * scale; x++) {
    const i = ((crop.y + Math.floor(y / scale)) * 1024 + crop.x + Math.floor(x / scale)) * 4;
    const j = (y * out.width + column * crop.width * scale + x) * 4, alpha = image.data[i + 3]! / 255;
    const checker = (Math.floor(x / 32) + Math.floor(y / 32)) % 2 ? 195 : 235;
    for (let c = 0; c < 3; c++) out.data[j + c] = Math.round(image.data[i + c]! * alpha + checker * (1 - alpha));
    out.data[j + 3] = 255;
  }
  return out;
}
