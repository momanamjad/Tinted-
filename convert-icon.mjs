import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs/promises';

async function main() {
  const input = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\425bfb0a-8ca1-4bf0-b25c-0b11187f3ee3\\tintd_pro_icon_matte_gray_1781617177422.png";
  const tempPng = "temp_icon.png";
  const output = "build\\icon.ico";

  await sharp(input)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(tempPng);

  const buf = await pngToIco(tempPng);
  await fs.writeFile(output, buf);
  await fs.unlink(tempPng);
}
main().catch(console.error);
