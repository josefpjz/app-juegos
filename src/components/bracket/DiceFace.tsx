// SVG dice face showing the correct dots for each number 1-6
interface Props {
  value: number;
  size?: number;
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[30, 30], [50, 50], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]],
};

export default function DiceFace({ value, size = 80 }: Props) {
  const dots = DOT_POSITIONS[value] ?? DOT_POSITIONS[1];
  const r = size * 0.12; // dot radius relative to size

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block' }}
    >
      {/* Face background */}
      <rect
        x="4" y="4" width="92" height="92"
        rx="16" ry="16"
        fill="#f0f0f0"
        stroke="#ccc"
        strokeWidth="2"
      />
      {/* Dots */}
      {dots.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="#1a1a2e"
        />
      ))}
    </svg>
  );
}
