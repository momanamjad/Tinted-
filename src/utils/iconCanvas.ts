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

  // Helper to draw a gradient rounded rect
  const drawGradientRoundedRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    topColor: string,
    bottomColor: string
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

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fill();
  };

  // Determine if color is light or dark for overlay contrast
  const getIconOverlayColor = (hexStr: string): string => {
    const hex = hexStr.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 180 ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.75)";
  };

  const iconColor = getIconOverlayColor(color);

  // 1. Draw soft 3D folder drop shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  // 2. Draw Back Flap + Tab (macOS Style)
  const backColor = adjustBrightness(color, -12);
  drawRoundedRect(32, 52, 80, 30, 10, backColor);
  drawRoundedRect(32, 68, 192, 136, 14, backColor);

  // 3. Draw Front Flap with smooth 3D gradient
  const frontTopColor = adjustBrightness(color, 12);
  const frontBottomColor = adjustBrightness(color, -16);
  drawGradientRoundedRect(32, 90, 192, 114, 14, frontTopColor, frontBottomColor);

  // Reset shadow for highlights & overlay
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 4. Draw Front Flap top highlight line (glossy bevel)
  drawRoundedRect(34, 91, 188, 2, 1, "rgba(255, 255, 255, 0.45)");

  // 5. Draw selected overlay icon or emoji centered on front flap (x=128, y=147)
  if (iconId !== "folder") {
    const icon = ALL_ICONS.find((i) => i.id === iconId);
    if (icon) {
      if (icon.lucideIcon) {
        const LucideComponent = (LucideIcons as any)[icon.lucideIcon];
        if (LucideComponent) {
          const svgStr = renderToStaticMarkup(
            React.createElement(LucideComponent, {
              size: 52,
              stroke: iconColor,
              strokeWidth: 3.5,
            })
          );
          const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);
          const img = new Image();
          img.src = url;

          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.globalAlpha = 1.0;
              ctx.drawImage(img, 128 - 26, 147 - 26, 52, 52);
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
          });
        }
      } else if (icon.emoji) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "52px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 1.0;
        ctx.fillText(icon.emoji, 128, 147);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  // Get raw pixels
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const dataUrl = canvas.toDataURL("image/png");
  return { pixels: imgData.data, dataUrl };
}
