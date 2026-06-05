import type { IconItem } from "@/data/icons";

/**
 * Normalizes and extracts keywords from a folder name.
 * Handles camelCase (MyPhotos -> My Photos), spaces, hyphens, and removes digits.
 */
function cleanFolderName(name: string): string[] {
  const camelSplit = name.replace(/([a-z])([A-Z])/g, "$1 $2");
  return camelSplit
    .toLowerCase()
    .replace(/[0-9]/g, "")
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Media: ["photos", "videos", "images", "music", "audio", "camera", "film", "gallery", "art", "sound", "mp3", "movie", "clip"],
  Development: ["code", "dev", "terminal", "database", "git", "github", "programming", "bug", "scripts", "bin", "node", "app", "typescript", "javascript", "react", "html", "css", "src"],
  Design: ["palette", "brush", "design", "layers", "layout", "art", "draw", "vector", "ui", "ux", "assets", "creative", "sketch", "figma", "psd"],
  Finance: ["money", "finance", "dollar", "chart", "sales", "budget", "billing", "invoice", "crypto", "pay", "bank", "account"],
  Business: ["work", "projects", "briefcase", "office", "company", "corp", "clients", "docs", "documents", "contracts", "resume"],
  Utilities: ["settings", "tools", "gear", "trash", "downloads", "temp", "cache", "logs", "system", "build", "backup", "archive", "zip", "setup"]
};

/**
 * Scoring algorithm to find the best icon match for a folder name.
 */
export function matchIconToFolderName(
  folderName: string,
  icons: IconItem[]
): { icon: IconItem; confidence: number; reasoning: string } | null {
  if (!folderName || !folderName.trim()) return null;

  const keywords = cleanFolderName(folderName);
  if (keywords.length === 0) return null;

  const scoredIcons = icons.map((icon) => {
    let score = 0;
    const reasons: string[] = [];
    const iconNameLower = icon.name.toLowerCase();

    keywords.forEach((keyword) => {
      // 1. Exact match on icon name
      if (keyword === iconNameLower) {
        score += 10;
        reasons.push(`exact match on '${icon.name}'`);
      }

      // 2. Exact match on keywords
      icon.keywords.forEach((iconKeyword) => {
        const iconKeywordLower = iconKeyword.toLowerCase();
        if (keyword === iconKeywordLower) {
          score += 5;
          reasons.push(`matches keyword '${iconKeyword}'`);
        } else if (iconKeywordLower.includes(keyword) || iconNameLower.includes(keyword)) {
          // 3. Partial match (substring)
          score += 2;
          reasons.push(`partially matches '${iconKeyword}'`);
        }
      });

      // 4. Category association match
      const iconCategory = icon.category;
      if (CATEGORY_KEYWORDS[iconCategory]?.includes(keyword)) {
        score += 1;
        reasons.push(`matches '${iconCategory}' theme`);
      }
    });

    return { icon, score, reasons };
  });

  const validMatches = scoredIcons.filter((m) => m.score > 0);
  if (validMatches.length === 0) return null;

  // Sort by score (descending), then alphabetically by name (ascending) for ties
  validMatches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.icon.name.localeCompare(b.icon.name);
  });

  const best = validMatches[0];

  // Calculate a human-readable confidence percentage based on score strength
  let confidence = 0;
  if (best.score >= 15) confidence = 95;
  else if (best.score >= 10) confidence = 90;
  else if (best.score >= 5) confidence = 75;
  else if (best.score >= 2) confidence = 50;
  else confidence = 30;

  // Build a concise explanation
  const uniqueReasons = Array.from(new Set(best.reasons)).slice(0, 2);
  const reasoning = `Matched: ${uniqueReasons.join(", ")}`;

  return {
    icon: best.icon,
    confidence,
    reasoning
  };
}

/**
 * Returns a recommended color palette tint based on the icon's category.
 */
export function suggestComplementaryColor(icon: IconItem): string {
  const colorMap: Record<string, string> = {
    Media: "#06B6D4", // cyan
    Development: "#10B981", // green
    Design: "#8B5CF6", // purple
    Finance: "#F59E0B", // amber
    Business: "#3B82F6", // blue
    Utilities: "#6366F1", // indigo
    "Folders & Files": "#EC4899" // pink
  };

  return colorMap[icon.category] || "#3B82F6";
}
