import { ShaderBackground } from "./istanblue";
export const MIDNIGHT_PALETTE = [
  "#0D1322",
  "#151E34",
  "#1E294A",
  "#FF5C39",
  "#0D1322",
  "#FF8C42",
] as const;
/** Reuses the supplied wave renderer, including its reduced-motion and GPU safeguards. */
export function GradientWave({
  colors = MIDNIGHT_PALETTE,
  className = "",
}: {
  colors?: readonly string[];
  className?: string;
}) {
  const valid =
    colors.length >= 2 &&
    colors.length <= 8 &&
    colors.every((color) => /^#[0-9a-f]{6}$/i.test(color));
  return (
    <ShaderBackground
      className={className}
      palette={valid ? colors : MIDNIGHT_PALETTE}
    />
  );
}
