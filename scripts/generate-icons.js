const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generatePng(width, height) {
  const rowBytes = width * 4 + 1; // 1 filter byte per row
  const raw = Buffer.alloc(height * rowBytes);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    raw[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Rounded squircle distance
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Squircle corner radius
      const cornerR = radius * 0.88;
      const inCorner = dx > cornerR && dy > cornerR;
      const cDist = inCorner ? Math.sqrt((dx - cornerR) ** 2 + (dy - cornerR) ** 2) : 0;

      if (dx <= radius && dy <= radius && (!inCorner || cDist <= radius - cornerR)) {
        // Gradient from Blue #2563eb to Indigo #4f46e5
        const t = (x + y) / (width + height);
        const r = Math.round(37 + (79 - 37) * t);
        const g = Math.round(99 + (70 - 99) * t);
        const b = Math.round(235 + (229 - 235) * t);

        // Draw share circle nodes
        // Center node
        const dCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        // Top right node
        const dTopRight = Math.sqrt((x - (cx + 36)) ** 2 + (y - (cy - 36)) ** 2);
        // Bottom right node
        const dBottomRight = Math.sqrt((x - (cx + 36)) ** 2 + (y - (cy + 36)) ** 2);

        // Lines connecting center to top right and bottom right
        const onLine1 = Math.abs((y - cy) + (x - cx)) < 7 && x >= cx && x <= cx + 36 && y <= cy && y >= cy - 36;
        const onLine2 = Math.abs((y - cy) - (x - cx)) < 7 && x >= cx && x <= cx + 36 && y >= cy && y <= cy + 36;

        if (dCenter < 18 || dTopRight < 14 || dBottomRight < 14 || onLine1 || onLine2) {
          // White symbol
          raw[pxOffset] = 255;
          raw[pxOffset + 1] = 255;
          raw[pxOffset + 2] = 255;
          raw[pxOffset + 3] = 255;
        } else {
          // Gradient background
          raw[pxOffset] = r;
          raw[pxOffset + 1] = g;
          raw[pxOffset + 2] = b;
          raw[pxOffset + 3] = 255;
        }
      } else {
        // Transparent
        raw[pxOffset] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0;
      }
    }
  }

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const compressed = zlib.deflateSync(raw);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function generateIcoFromPng(pngBuffer) {
  // Simple ICO container embedding PNG
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry[0] = 0; // 256 width
  dirEntry[1] = 0; // 256 height
  dirEntry[2] = 0; // Color count
  dirEntry[3] = 0; // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // Image size (Little Endian)
  dirEntry.writeUInt32LE(22, 12); // Offset of image data (6 + 16 = 22)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

const buildDir = path.join(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('Generating high-resolution 256x256 application icon...');
const png256 = generatePng(256, 256);
fs.writeFileSync(path.join(buildDir, 'icon.png'), png256);

console.log('Generating Windows .ico icon...');
const ico = generateIcoFromPng(png256);
fs.writeFileSync(path.join(buildDir, 'icon.ico'), ico);

console.log('✓ Successfully created build/icon.png and build/icon.ico');
