import fs from "fs";
import zlib from "zlib";

const path = process.argv[2];
if (!path) {
  console.error("Usage: node fix-product-cutout.mjs <png-path>");
  process.exit(1);
}

function readChunks(buf) {
  let o = 8;
  const chunks = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.slice(o + 4, o + 8).toString("ascii");
    const data = buf.slice(o + 8, o + 8 + len);
    chunks.push({ type, data });
    o += 12 + len;
  }
  return chunks;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buf) {
  const chunks = readChunks(buf);
  const ihdr = chunks.find((c) => c.type === "IHDR").data;
  const w = ihdr.readUInt32BE(0);
  const h = ihdr.readUInt32BE(4);
  const color = ihdr[9];
  if (color !== 6) throw new Error("need rgba, got " + color);
  const raw = zlib.inflateSync(
    Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.data))
  );
  const bpp = 4;
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const x = row[i];
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let v;
      if (ft === 0) v = x;
      else if (ft === 1) v = (x + a) & 255;
      else if (ft === 2) v = (x + b) & 255;
      else if (ft === 3) v = (x + ((a + b) >> 1)) & 255;
      else v = (x + paeth(a, b, c)) & 255;
      cur[i] = v;
    }
    prev = Buffer.from(cur);
  }
  return { w, h, data: out };
}

function crcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}
const CRC = crcTable();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const buf = fs.readFileSync(path);
const { w, h, data } = decodePng(buf);
const total = w * h;
const visited = new Uint8Array(total);
const queue = new Int32Array(total);
let qh = 0;
let qt = 0;

function isBg(r, g, b, a) {
  if (a < 12) return true;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  return min >= 195 && max - min <= 32;
}

function tryEnq(x, y) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const i = y * w + x;
  if (visited[i]) return;
  const o = i * 4;
  if (!isBg(data[o], data[o + 1], data[o + 2], data[o + 3])) return;
  visited[i] = 1;
  queue[qt++] = i;
}

for (let x = 0; x < w; x++) {
  tryEnq(x, 0);
  tryEnq(x, h - 1);
}
for (let y = 0; y < h; y++) {
  tryEnq(0, y);
  tryEnq(w - 1, y);
}
for (let i = 0; i < total; i++) {
  if (data[i * 4 + 3] < 12 && !visited[i]) {
    visited[i] = 1;
    queue[qt++] = i;
  }
}
while (qh < qt) {
  const i = queue[qh++];
  const x = i % w;
  const y = (i / w) | 0;
  tryEnq(x - 1, y);
  tryEnq(x + 1, y);
  tryEnq(x, y - 1);
  tryEnq(x, y + 1);
}
for (let i = 0; i < total; i++) if (visited[i]) data[i * 4 + 3] = 0;

for (let y = 1; y < h - 1; y++) {
  for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    if (visited[i]) continue;
    const o = i * 4;
    if (data[o + 3] < 12) continue;
    const minc = Math.min(data[o], data[o + 1], data[o + 2]);
    if (minc < 170) continue;
    let near = false;
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const ni = (y + dy) * w + (x + dx);
      if (visited[ni] || data[ni * 4 + 3] < 12) {
        near = true;
        break;
      }
    }
    if (!near) continue;
    const t = Math.min(1, (minc - 170) / 85);
    data[o + 3] = Math.round(data[o + 3] * (1 - t * 0.95));
  }
}

let minX = w;
let minY = h;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] >= 16) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}
if (maxX <= minX || maxY <= minY) {
  console.error("empty after cutout");
  process.exit(1);
}
const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.025);
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(w - 1, maxX + pad);
maxY = Math.min(h - 1, maxY + pad);
const cw = maxX - minX + 1;
const ch = maxY - minY + 1;
const cropped = Buffer.alloc(cw * ch * 4);
for (let y = 0; y < ch; y++) {
  const src = ((minY + y) * w + minX) * 4;
  data.copy(cropped, y * cw * 4, src, src + cw * 4);
}
const out = encodePng(cw, ch, cropped);
fs.writeFileSync(path, out);
console.log(JSON.stringify({ ok: true, from: [w, h], to: [cw, ch], removed: qt, bytes: out.length }));
