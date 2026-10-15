// Replay in scratch only; never replace approved source artwork.
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url)),assets=resolve(root,'../../..');
const {decode,encode}=createRequire(resolve(root,'../../../../../../tools/asset-validator/package.json'))('fast-png');
const blankImage=(width,height)=>({width,height,channels:4,depth:8,data:new Uint8Array(width*height*4)});
const northwestBodyPartLayout = [
    { id: 'torso', plane: 'body-torso', characterSide: 'center', visibility: 'visible' },
    { id: 'right-arm', plane: 'body-back-arm', characterSide: 'right', visibility: 'visible' },
    { id: 'left-arm', plane: 'body-front-arm', characterSide: 'left', visibility: 'visible' },
    { id: 'right-leg', plane: 'body-back-leg', characterSide: 'right', visibility: 'visible' },
    { id: 'left-leg', plane: 'body-front-leg', characterSide: 'left', visibility: 'visible' },
];
const northwestBodyPartsGeometry = {
    armBottom: 455,
    rightArmRoot: [[555, 300], [568, 322], [575, 344], [571, 365], [566, 382], [557, 408], [550, 435], [545, 455]],
    leftArmRoot: [[408, 300], [421, 320], [425, 342], [415, 365], [397, 382], [332, 397], [320, 425], [315, 455]],
    legSeam: [[505, 752], [494, 800], [486, 880], [492, 940], [505, 1000], [510, 1100], [510, 1536]],
    rightThighRoot: [[505, 752], [542, 745], [568, 731], [586, 710], [597, 685]],
    leftThighRoot: [[360, 665], [390, 657], [420, 662], [450, 677], [479, 699], [503, 727], [514, 743]],
};
const lineValue = (value, line, axis) => {
    const output = axis === 0 ? 1 : 0;
    if (value <= line[0][axis])
        return line[0][output];
    for (let j = 1; j < line.length; j++) {
        const a = line[j - 1], b = line[j];
        if (value <= b[axis])
            return a[output] + (b[output] - a[output]) * (value - a[axis]) / (b[axis] - a[axis]);
    }
    return line.at(-1)[output];
};
const partitionNorthwestBody = (body) => partitionPosteriorBody(body, northwestBodyPartsGeometry);
function partitionPosteriorBody(body, g) {
    if (body.width !== 1024 || body.height !== 1536)
        throw new Error('Native posterior body required.');
    const parts = Array.from({ length: 5 }, () => blankImage(1024, 1536)), pixelCounts = Array(5).fill(0);
    for (let y = 0; y < 1536; y++)
        for (let x = 0; x < 1024; x++) {
            const p = (y * 1024 + x) * 4;
            if (body.data[p + 3] < 8)
                continue;
            const px = x + .5, py = y + .5, rightLeg = px >= lineValue(py, g.legSeam, 1);
            const owner = py < g.armBottom && px >= lineValue(py, g.rightArmRoot, 1) ? 1
                : py < g.armBottom && px < lineValue(py, g.leftArmRoot, 1) ? 2
                    : rightLeg && py >= lineValue(px, g.rightThighRoot, 0) ? 3
                        : !rightLeg && py >= lineValue(px, g.leftThighRoot, 0) ? 4 : 0;
            parts[owner].data.set(body.data.subarray(p, p + 4), p);
            pixelCounts[owner]++;
        }
    return { parts, pixelCounts };
}

const settings=JSON.parse(await readFile(resolve(root,'settings.json'),'utf8'));
if(JSON.stringify(settings.geometry)!==JSON.stringify(northwestBodyPartsGeometry))throw Error('NW contours changed');
const body=decode(await readFile(resolve(assets,settings.sourceBody)),{checkCrc:true});
if(body.channels!==4||body.depth!==8)throw Error('Native RGBA body required');
const result=partitionNorthwestBody(body);
for(const [i,part]of northwestBodyPartLayout.entries())await writeFile(resolve(root,'NW-'+part.id+'-v1.png'),encode({...result.parts[i],channels:4,depth:8},{zlib:{level:9}}),{flag:'wx'});
console.log(JSON.stringify(result.pixelCounts));
