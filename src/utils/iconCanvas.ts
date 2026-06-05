import * as LucideIcons from "lucide-react";
import { ALL_ICONS } from "@/data/icons";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { adjustBrightness, getContrastColor } from "@/utils/colors";

export async function drawFolderIconToCanvas(
  color: string,
  iconId: string
): Promise<{ pixels: Uint8ClampedArray; dataUrl: string }> {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  const baseColor = color;
  const darkColor = getContrastColor(color); // Highly visible contrasting color
  const lightColor = adjustBrightness(color, 30);

  // Helper to draw a rounded rect
  const drawRoundedRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fillStyle: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  };

  // Draw folder shapes matching electron/icon-generator.ts:
  // 1. Tab top (x=38, y=78, w=110, h=48, r=18) -> lightColor
  drawRoundedRect(38, 78, 110, 48, 18, lightColor);

  // 2. Middle flap (x=30, y=100, w=198, h=128, r=20) -> shaded color (adjustBrightness(color, -15))
  drawRoundedRect(30, 100, 198, 128, 20, adjustBrightness(color, -15));

  // 3. Main front flap (x=42, y=116, w=184, h=98, r=16) -> baseColor
  drawRoundedRect(42, 116, 184, 98, 16, baseColor);

  // 4. Inner flap shine (x=52, y=128, w=164, h=24, r=12) -> shade(base, 1.22) -> adjustBrightness(color, 40)
  drawRoundedRect(52, 128, 164, 24, 12, adjustBrightness(color, 40));

  // 5. Draw the selected icon or emoji
  // Folder is the default, which has no overlay
  if (iconId !== "folder") {
    const icon = ALL_ICONS.find((i) => i.id === iconId);
    if (icon) {
      if (icon.lucideIcon) {
        const LucideComponent = (LucideIcons as any)[icon.lucideIcon];
        if (LucideComponent) {
          // Render Lucide icon to static SVG string
          const svgStr = renderToStaticMarkup(
            React.createElement(LucideComponent, {
              size: 56,
              stroke: darkColor,
              strokeWidth: 4, // Thicker stroke for better visibility at small sizes
            })
          );
          // Create an Image from the SVG string
          const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);
          const img = new Image();
          img.src = url;

          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.globalAlpha = 1.0; // Fully opaque for maximum visibility and sharpness
              ctx.drawImage(img, 134 - 28, 165 - 28, 56, 56);
              ctx.globalAlpha = 1.0;
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve(); // Resolve anyway to not block
            };
          });
        }
      } else if (icon.emoji) {
        ctx.fillStyle = "#ffffff"; // Monochrome fallback color
        ctx.font = "56px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif"; // Slightly larger font size
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 1.0; // Draw emojis at 100% opacity to ensure vivid colors
        ctx.fillText(icon.emoji, 134, 165);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  // Get raw pixels
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const dataUrl = canvas.toDataURL("image/png");
  return { pixels: imgData.data, dataUrl };
}
