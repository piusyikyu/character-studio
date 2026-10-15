// Replay in scratch only; never replace approved source artwork.
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url)),assets=resolve(root,'../../..');
const {decode,encode}=createRequire(resolve(root,'../../../../../../tools/asset-validator/package.json'))('fast-png');
const blankImage=(width,height)=>({width,height,channels:4,depth:8,data:new Uint8Array(width*height*4)});
const eastBodyPartLayout = [
    { id: 'torso', plane: 'body-torso', characterSide: 'center', visibility: 'visible' },
    { id: 'right-arm', plane: 'body-front-arm', characterSide: 'right', visibility: 'visible' },
    { id: 'left-arm', plane: 'body-back-arm', characterSide: 'left', visibility: 'occluded-unavailable' },
    { id: 'right-leg', plane: 'body-front-leg', characterSide: 'right', visibility: 'visible' },
    { id: 'left-leg', plane: 'body-back-leg', characterSide: 'left', visibility: 'occluded-unavailable' },
];
/** E-specific visible cuts, not concealed joint shapes or reusable rig anchors. */
const eastBodyPartsGeometry = {
    arm: [[487, 337], [513, 331], [536, 343], [549, 365], [542, 385], [528, 396], [504, 403], [480, 443], [430, 443], [430, 337]],
    leg: [[469, 680], [500, 637], [540, 627], [580, 640], [610, 666], [634, 702]],
};
const inPolygon = (x, y, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i], b = polygon[j];
        if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])
            inside = !inside;
    }
    return inside;
};
function partitionEastBody(body) {
    if (body.width !== 1024 || body.height !== 1536)
        throw new Error('Native E body required.');
    const parts = eastBodyPartLayout.map(() => blankImage(1024, 1536)), pixelCounts = eastBodyPartLayout.map(() => 0);
    for (let y = 0; y < 1536; y++)
        for (let x = 0; x < 1024; x++) {
            const p = (y * 1024 + x) * 4;
            if (body.data[p + 3] < 8)
                continue;
            const line = eastBodyPartsGeometry.leg, px = x + .5, py = y + .5;
            let legTop = line.at(-1)[1];
            if (px <= line[0][0])
                legTop = line[0][1];
            else
                for (let i = 1; i < line.length; i++) {
                    const a = line[i - 1], b = line[i];
                    if (px <= b[0]) {
                        legTop = a[1] + (b[1] - a[1]) * (px - a[0]) / (b[0] - a[0]);
                        break;
                    }
                }
            const owner = inPolygon(px, py, eastBodyPartsGeometry.arm) ? 1 : py >= legTop ? 3 : 0;
            parts[owner].data.set(body.data.subarray(p, p + 4), p);
            pixelCounts[owner]++;
        }
    return { parts, pixelCounts };
}

const settings=JSON.parse(await readFile(resolve(root,'settings.json'),'utf8'));
if(JSON.stringify(settings.geometry)!==JSON.stringify(eastBodyPartsGeometry))throw Error('E contours changed');
const body=decode(await readFile(resolve(assets,settings.sourceBody)),{checkCrc:true});
if(body.channels!==4||body.depth!==8)throw Error('Native RGBA body required');
const result=partitionEastBody(body);
for(const i of [0,1,3])await writeFile(resolve(root,'E-'+eastBodyPartLayout[i].id+'-v1.png'),encode({...result.parts[i],channels:4,depth:8},{zlib:{level:9}}),{flag:'wx'});
console.log(JSON.stringify(result.pixelCounts));
