import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const products = [
  { id: 'lipstick-01', color: [220, 53, 69] },
  { id: 'foundation-01', color: [255, 193, 7] },
  { id: 'serum-01', color: [13, 202, 240] },
  { id: 'mascara-01', color: [33, 37, 41] },
  { id: 'compact-01', color: [253, 126, 20] },
  { id: 'shampoo-01', color: [25, 135, 84] },
  { id: 'facewash-01', color: [102, 16, 242] },
  { id: 'nailpolish-01', color: [214, 51, 132] },
  { id: 'perfume-01', color: [111, 66, 193] },
  { id: 'hairoil-01', color: [32, 201, 151] },
  { id: 'moisturizer-01', color: [253, 228, 201] },
  { id: 'sunscreen-01', color: [255, 243, 128] },
  { id: 'eyeshadow-01', color: [132, 0, 255] },
  { id: 'bbcream-01', color: [183, 110, 52] },
  { id: 'settingspray-01', color: [108, 117, 125] },
];

const outputDir = join(process.cwd(), 'public', 'products');
mkdirSync(outputDir, { recursive: true });

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  for (const byte of data) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, data.length);
  const crcData = new Uint8Array(typeBytes.length + data.length);
  crcData.set(typeBytes);
  crcData.set(data, typeBytes.length);
  const crcBytes = new Uint8Array(4);
  new DataView(crcBytes.buffer).setUint32(0, crc32(crcData));
  return new Uint8Array([...len, ...typeBytes, ...data, ...crcBytes]);
}

function createSolidColorPng(width, height, r, g, b) {
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width);
  ihdrView.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + width * 3;
  const rawData = new Uint8Array(height * rowSize);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0;
    for (let x = 0; x < width; x++) {
      rawData[offset + 1 + x * 3] = r;
      rawData[offset + 1 + x * 3 + 1] = g;
      rawData[offset + 1 + x * 3 + 2] = b;
    }
  }

  const maxBlockSize = 65535;
  const blocks = [];
  for (let i = 0; i < rawData.length; i += maxBlockSize) {
    const block = rawData.slice(i, i + maxBlockSize);
    const isLast = (i + maxBlockSize) >= rawData.length;
    const header = new Uint8Array([isLast ? 1 : 0, block.length & 0xFF, (block.length >> 8) & 0xFF, ~block.length & 0xFF, (~block.length >> 8) & 0xFF]);
    blocks.push(header, block);
  }

  let s1 = 1, s2 = 0;
  for (const byte of rawData) { s1 = (s1 + byte) % 65521; s2 = (s2 + s1) % 65521; }
  const adler = new Uint8Array(4);
  new DataView(adler.buffer).setUint32(0, (s2 << 16) | s1);

  const zlibData = new Uint8Array([0x78, 0x01, ...blocks.flatMap(b => [...b]), ...adler]);

  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', zlibData);
  const iendChunk = chunk('IEND', new Uint8Array(0));

  const total = sig.length + ihdrChunk.length + idatChunk.length + iendChunk.length;
  const png = new Uint8Array(total);
  let offset = 0;
  for (const part of [sig, ihdrChunk, idatChunk, iendChunk]) {
    png.set(part, offset);
    offset += part.length;
  }
  return png;
}

for (const { id, color: [r, g, b] } of products) {
  const png = createSolidColorPng(80, 120, r, g, b);
  writeFileSync(join(outputDir, `${id}.png`), png);
  console.log(`Created ${id}.png`);
}
console.log(`Done! Created ${products.length} placeholder images.`);
