const ICON_SIZE = 256;

type Rgba = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export function generateFolderIco(hexColor: string): Buffer {
  const base = hexToRgba(hexColor);
  const pixels = new Uint8ClampedArray(ICON_SIZE * ICON_SIZE * 4);

  const backColor = shade(base, 0.88); // equivalent to adjustBrightness(color, -12)
  const frontTopColor = shade(base, 1.12); // equivalent to adjustBrightness(color, 12)
  const frontBottomColor = shade(base, 0.84); // equivalent to adjustBrightness(color, -16)

  // 1. Back Flap + Tab
  drawRoundedRect(pixels, 32, 52, 80, 30, 10, backColor);
  drawRoundedRect(pixels, 32, 68, 192, 136, 14, backColor);

  // 2. Front Flap with linear gradient
  drawGradientRoundedRect(pixels, 32, 90, 192, 114, 14, frontTopColor, frontBottomColor);

  // 3. Front Flap top highlight line
  drawRoundedRect(pixels, 34, 91, 188, 2, 1, { r: 255, g: 255, b: 255, a: 115 });

  return makeIco(pixels);
}

function drawGradientRoundedRect(
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  topColor: Rgba,
  bottomColor: Rgba
) {
  for (let py = y; py < y + height; py += 1) {
    const t = (py - y) / (height - 1);
    const color: Rgba = {
      r: clamp(Math.round(topColor.r * (1 - t) + bottomColor.r * t)),
      g: clamp(Math.round(topColor.g * (1 - t) + bottomColor.g * t)),
      b: clamp(Math.round(topColor.b * (1 - t) + bottomColor.b * t)),
      a: clamp(Math.round(topColor.a * (1 - t) + bottomColor.a * t))
    };

    for (let px = x; px < x + width; px += 1) {
      const dx = Math.max(x - px + radius, 0, px - (x + width - radius - 1));
      const dy = Math.max(y - py + radius, 0, py - (y + height - radius - 1));

      if (dx * dx + dy * dy <= radius * radius) {
        blendPixel(pixels, px, py, color);
      }
    }
  }
}

export function makeIco(pixels: Uint8ClampedArray): Buffer {
  const pixelBytes = ICON_SIZE * ICON_SIZE * 4;
  const maskStride = Math.ceil(ICON_SIZE / 32) * 4;
  const maskBytes = maskStride * ICON_SIZE;
  const dibBytes = 40 + pixelBytes + maskBytes;
  const iconBytes = 6 + 16 + dibBytes;
  const buffer = Buffer.alloc(iconBytes);

  let offset = 0;
  buffer.writeUInt16LE(0, offset);
  offset += 2;
  buffer.writeUInt16LE(1, offset);
  offset += 2;
  buffer.writeUInt16LE(1, offset);
  offset += 2;

  buffer.writeUInt8(0, offset++);
  buffer.writeUInt8(0, offset++);
  buffer.writeUInt8(0, offset++);
  buffer.writeUInt8(0, offset++);
  buffer.writeUInt16LE(1, offset);
  offset += 2;
  buffer.writeUInt16LE(32, offset);
  offset += 2;
  buffer.writeUInt32LE(dibBytes, offset);
  offset += 4;
  buffer.writeUInt32LE(22, offset);
  offset += 4;

  buffer.writeUInt32LE(40, offset);
  offset += 4;
  buffer.writeInt32LE(ICON_SIZE, offset);
  offset += 4;
  buffer.writeInt32LE(ICON_SIZE * 2, offset);
  offset += 4;
  buffer.writeUInt16LE(1, offset);
  offset += 2;
  buffer.writeUInt16LE(32, offset);
  offset += 2;
  buffer.writeUInt32LE(0, offset);
  offset += 4;
  buffer.writeUInt32LE(pixelBytes, offset);
  offset += 4;
  buffer.writeInt32LE(0, offset);
  offset += 4;
  buffer.writeInt32LE(0, offset);
  offset += 4;
  buffer.writeUInt32LE(0, offset);
  offset += 4;
  buffer.writeUInt32LE(0, offset);
  offset += 4;

  for (let y = ICON_SIZE - 1; y >= 0; y -= 1) {
    for (let x = 0; x < ICON_SIZE; x += 1) {
      const source = (y * ICON_SIZE + x) * 4;
      buffer[offset++] = pixels[source + 2];
      buffer[offset++] = pixels[source + 1];
      buffer[offset++] = pixels[source];
      buffer[offset++] = pixels[source + 3];
    }
  }

  return buffer;
}

function drawRoundedRect(
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: Rgba
) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      const dx = Math.max(x - px + radius, 0, px - (x + width - radius - 1));
      const dy = Math.max(y - py + radius, 0, py - (y + height - radius - 1));

      if (dx * dx + dy * dy <= radius * radius) {
        blendPixel(pixels, px, py, color);
      }
    }
  }
}

function blendPixel(pixels: Uint8ClampedArray, x: number, y: number, color: Rgba) {
  const index = (y * ICON_SIZE + x) * 4;
  const alpha = color.a / 255;
  const inverse = 1 - alpha;

  pixels[index] = Math.round(color.r * alpha + pixels[index] * inverse);
  pixels[index + 1] = Math.round(color.g * alpha + pixels[index + 1] * inverse);
  pixels[index + 2] = Math.round(color.b * alpha + pixels[index + 2] * inverse);
  pixels[index + 3] = Math.max(color.a, pixels[index + 3]);
}

function hexToRgba(hexColor: string): Rgba {
  const hex = hexColor.replace("#", "");
  const value = Number.parseInt(hex.length === 3 ? expandShortHex(hex) : hex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
    a: 255
  };
}

function expandShortHex(hex: string) {
  return hex
    .split("")
    .map((char) => `${char}${char}`)
    .join("");
}

function shade(color: Rgba, amount: number): Rgba {
  return {
    r: clamp(Math.round(color.r * amount)),
    g: clamp(Math.round(color.g * amount)),
    b: clamp(Math.round(color.b * amount)),
    a: color.a
  };
}

function clamp(value: number) {
  return Math.min(255, Math.max(0, value));
}
