// The four-point star from the NSG logo, as a crisp vector.
export const Sparkle: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({
  size,
  color = '#fff',
  style,
}) => (
  <svg width={size} height={size} viewBox="-1 -1 2 2" style={style}>
    <path
      d="M0,-1 C0.1,-0.1 0.1,-0.1 1,0 C0.1,0.1 0.1,0.1 0,1 C-0.1,0.1 -0.1,0.1 -1,0 C-0.1,-0.1 -0.1,-0.1 0,-1 Z"
      fill={color}
    />
  </svg>
);
