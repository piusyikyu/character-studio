// Replay in scratch only; never replace approved source artwork.
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url)),assets=resolve(root,'../../..');
const {decode,encode}=createRequire(resolve(root,'../../../../../../tools/asset-validator/package.json'))('fast-png');
const blankImage=(width,height)=>({width,height,channels:4,depth:8,data:new Uint8Array(width*height*4)});
const southeastBodyPartLayout = [
    { id: 'torso', plane: 'body-torso', characterSide: 'center', visibility: 'visible' },
    { id: 'right-arm', plane: 'body-front-arm', characterSide: 'right', visibility: 'visible' },
    { id: 'left-arm', plane: 'body-back-arm', characterSide: 'left', visibility: 'visible' },
    { id: 'right-leg', plane: 'body-front-leg', characterSide: 'right', visibility: 'visible' },
    { id: 'left-leg', plane: 'body-back-leg', characterSide: 'left', visibility: 'visible' },
];
/** Native SE ownership cuts; no concealed joints, limb deformation or rig anchors. */
const southeastBodyPartsGeometry = {
    armBottom: 420,
    rightArmRoot: [[478, 278], [485, 300], [484, 322], [466, 340], [443, 352], [443, 420]],
    leftArmRoot: [[616, 288], [627, 305], [648, 328], [672, 350], [697, 367], [710, 390], [715, 420]],
    legSeam: [[584, 694], [585, 740], [581, 800], [567, 880], [550, 960], [560, 1100], [560, 1536]],
    rightThighRoot: [[466, 571], [495, 581], [526, 606], [548, 639], [566, 677], [584, 695]],
    leftThighRoot: [[584, 695], [610, 675], [636, 646], [661, 620], [676, 608]],
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
function partitionSoutheastBody(body) {
    if (body.width !== 1024 || body.height !== 1536)
        throw new Error('Native SE body required.');
    const g = southeastBodyPartsGeometry, parts = southeastBodyPartLayout.map(() => blankImage(1024, 1536)), pixelCounts = southeastBodyPartLayout.map(() => 0);
    for (let y = 0; y < 1536; y++)
        for (let x = 0; x < 1024; x++) {
            const p = (y * 1024 + x) * 4;
            if (body.data[p + 3] < 8)
                continue;
            const px = x + .5, py = y + .5, rightLeg = px < lineValue(py, g.legSeam, 1);
            const owner = py < g.armBottom && px < lineValue(py, g.rightArmRoot, 1) ? 1
                : py < g.armBottom && px >= lineValue(py, g.leftArmRoot, 1) ? 2
                    : rightLeg && py >= lineValue(px, g.rightThighRoot, 0) ? 3
                        : !rightLeg && py >= lineValue(px, g.leftThighRoot, 0) ? 4 : 0;
            parts[owner].data.set(body.data.subarray(p, p + 4), p);
            pixelCounts[owner]++;
        }
    return { parts, pixelCounts };
}

const settings=JSON.parse(await readFile(resolve(root,'settings.json'),'utf8'));
if(JSON.stringify(settings.geometry)!==JSON.stringify(southeastBodyPartsGeometry))throw Error('SE contours changed');
const body=decode(await readFile(resolve(assets,settings.sourceBody)),{checkCrc:true});
if(body.channels!==4||body.depth!==8)throw Error('Native RGBA body required');
const result=partitionSoutheastBody(body);
for(const [i,part]of southeastBodyPartLayout.entries())await writeFile(resolve(root,'SE-'+part.id+'-v1.png'),encode({...result.parts[i],channels:4,depth:8},{zlib:{level:9}}),{flag:'wx'});
console.log(JSON.stringify(result.pixelCounts));
