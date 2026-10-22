// npm run fixtures:glb
// Writes public/model/fixture-cube.glb (a tiny valid cube) for /dev/media-states and local testing.
// public/model/ is git-ignored, so run this once per machine. Safe to re-run.
import { mkdirSync, writeFileSync } from 'node:fs';

const P = [ // 24 verts (4 per face) so each face has a flat normal
  [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],   [1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],
  [-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],
  [-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],   [-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],
];
const N = [[0,0,1],[0,0,-1],[-1,0,0],[1,0,0],[0,1,0],[0,-1,0]].flatMap((n) => [n, n, n, n]);
const idx = []; for (let f = 0; f < 6; f++) { const o = f * 4; idx.push(o, o+1, o+2, o, o+2, o+3); }
const pos = new Float32Array(P.flat().map((v) => v * 0.5));
const nor = new Float32Array(N.flat());
const ind = new Uint16Array(idx);
const bin = Buffer.concat([Buffer.from(pos.buffer), Buffer.from(nor.buffer), Buffer.from(ind.buffer)]);
const json = {
  asset: { version: '2.0', generator: 'furnibloc fixture' },
  scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
  materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.52, 0.32, 0.12, 1], metallicFactor: 0, roughnessFactor: 0.7 } }],
  buffers: [{ byteLength: bin.length }],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: pos.byteLength, target: 34962 },
    { buffer: 0, byteOffset: pos.byteLength, byteLength: nor.byteLength, target: 34962 },
    { buffer: 0, byteOffset: pos.byteLength + nor.byteLength, byteLength: ind.byteLength, target: 34963 },
  ],
  accessors: [
    { bufferView: 0, componentType: 5126, count: 24, type: 'VEC3', min: [-0.5,-0.5,-0.5], max: [0.5,0.5,0.5] },
    { bufferView: 1, componentType: 5126, count: 24, type: 'VEC3' },
    { bufferView: 2, componentType: 5123, count: 36, type: 'SCALAR' },
  ],
};
const pad = (b, c) => Buffer.concat([b, Buffer.alloc((4 - (b.length % 4)) % 4, c)]);
const j = pad(Buffer.from(JSON.stringify(json)), 0x20), b = pad(bin, 0);
const head = Buffer.alloc(12); head.write('glTF', 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(12 + 8 + j.length + 8 + b.length, 8);
const ch = (len, type) => { const h = Buffer.alloc(8); h.writeUInt32LE(len, 0); h.write(type, 4, 'latin1'); return h; };
mkdirSync(new URL('../public/model/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/model/fixture-cube.glb', import.meta.url), Buffer.concat([head, ch(j.length, 'JSON'), j, ch(b.length, 'BIN\0'), b]));
console.log('wrote public/model/fixture-cube.glb');
