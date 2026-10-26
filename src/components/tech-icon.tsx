import type { CSSProperties } from "react";
import { isLightColor } from "@/lib/color";
import type { TechIconData } from "@/lib/tech";

function monogram(title: string): string {
  const words = title
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/[\s./-]+/)
    .filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : title.slice(0, 2);
  return letters.toUpperCase();
}

interface TechIconProps {
  tech: TechIconData;
  /** Tile edge in px. */
  size?: number;
  className?: string;
}

/**
 * Brand logo on a white rounded tile (as in the reference design). Pale brand
 * colours draw in black so the glyph stays visible; unknown tech gets a monogram.
 */
export function TechIcon({ tech, size = 20, className = "" }: TechIconProps) {
  const style: CSSProperties = { width: size, height: size };
  const fill = isLightColor(tech.hex) ? "#000000" : tech.hex;

  return (
    <span
      aria-hidden="true"
      style={style}
      className={`inline-flex shrink-0 items-center justify-center rounded-[28%] bg-white ${className}`}
    >
      {tech.path ? (
        <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill={fill}>
          <path d={tech.path} />
        </svg>
      ) : (
        <span
          className="font-mono leading-none font-semibold text-zinc-700"
          style={{ fontSize: size * 0.36 }}
        >
          {monogram(tech.title)}
        </span>
      )}
    </span>
  );
}
