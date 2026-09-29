import { colors } from "../theme";

export const inkLine = "#16141f";

/** Googly eye: white ball with a pupil that can look around. */
const Eye: React.FC<{ x: number; y: number; r: number; look: [number, number]; lid?: number; closed?: boolean; bodyColor: string }> = ({ x, y, r, look, lid = 0, closed, bodyColor }) =>
  closed ? (
    <path d={`M ${x - r} ${y} Q ${x} ${y + r * 0.7} ${x + r} ${y}`} fill="none" stroke={inkLine} strokeWidth={5} strokeLinecap="round" />
  ) : (
    <g>
      <circle cx={x} cy={y} r={r} fill="white" stroke={inkLine} strokeWidth={4} />
      <circle cx={x + look[0] * r * 0.45} cy={y + look[1] * r * 0.45} r={r * 0.5} fill={inkLine} />
      <circle cx={x + look[0] * r * 0.45 + r * 0.18} cy={y + look[1] * r * 0.45 - r * 0.18} r={r * 0.15} fill="white" />
      {lid > 0 && <rect x={x - r - 3} y={y - r - 3} width={r * 2 + 6} height={(r * 2 + 6) * lid} fill={bodyColor} stroke={inkLine} strokeWidth={4} />}
    </g>
  );

export type Mood = "bored" | "sleep" | "curious" | "happy";

/** A round little audience member. */
export const Blob: React.FC<{ x: number; y: number; color: string; mood: Mood; frame: number; seed: number; flip?: boolean; scale?: number }> = ({
  x,
  y,
  color,
  mood,
  frame,
  seed,
  flip,
  scale = 1,
}) => {
  const breathe = Math.sin(frame / 12 + seed) * 3;
  const hop = mood === "happy" ? Math.abs(Math.sin(frame / 6 + seed)) * 40 : 0;
  const squash = mood === "happy" ? 1 + Math.sin(frame / 3 + seed) * 0.04 : 1;
  const look: [number, number] = mood === "bored" ? [0.2, 0.9] : mood === "curious" ? [-0.7, -0.2] : [Math.sin(frame / 20 + seed) * 0.4, 0];
  return (
    <g transform={`translate(${x} ${y - hop}) scale(${(flip ? -1 : 1) * scale / squash} ${scale * squash})`}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="rgba(0,0,0,0.12)" transform={`translate(0 ${hop / scale})`} />
      <path d={`M -70 0 C -80 -120 80 -120 70 0 Z`} transform={`translate(0 ${breathe * 0.3}) scale(1 ${1 + breathe * 0.004})`} fill={color} stroke={inkLine} strokeWidth={6} />
      <Eye x={-22} y={-62} r={16} look={look} lid={mood === "bored" ? 0.45 : 0} closed={mood === "sleep"} bodyColor={color} />
      <Eye x={22} y={-62} r={16} look={look} lid={mood === "bored" ? 0.45 : 0} closed={mood === "sleep"} bodyColor={color} />
      {mood === "happy" && <path d="M -18 -32 Q 0 -12 18 -32" fill="none" stroke={inkLine} strokeWidth={5} strokeLinecap="round" />}
      {mood === "curious" && <circle cx={0} cy={-28} r={6} fill={inkLine} />}
      {(mood === "bored" || mood === "sleep") && <line x1={-10} y1={-30} x2={10} y2={-30} stroke={inkLine} strokeWidth={5} strokeLinecap="round" />}
      {mood === "bored" && (
        <g transform={`rotate(${Math.sin(frame / 8 + seed) * 4} 0 -8)`}>
          <line x1={-40} y1={-20} x2={-16} y2={-10} stroke={inkLine} strokeWidth={5} strokeLinecap="round" />
          <line x1={40} y1={-20} x2={16} y2={-10} stroke={inkLine} strokeWidth={5} strokeLinecap="round" />
          <rect x={-18} y={-26} width={36} height={52} rx={7} fill={inkLine} />
          <rect x={-13} y={-20} width={26} height={38} rx={3} fill={colors.lavender} opacity={0.6 + 0.4 * Math.abs(Math.sin(frame / 5 + seed))} />
        </g>
      )}
    </g>
  );
};

/** Neo Capta: a lavender blob with smart round glasses. */
export const Neo: React.FC<{ x: number; y: number; frame: number; wink?: boolean; scale?: number; happy?: boolean }> = ({ x, y, frame, wink, scale = 1, happy }) => {
  const hop = happy ? Math.abs(Math.sin(frame / 6)) * 30 : 0;
  return (
    <g transform={`translate(${x} ${y - hop}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={80} ry={13} fill="rgba(0,0,0,0.12)" transform={`translate(0 ${hop / scale})`} />
      <path d="M -80 0 C -92 -150 92 -150 80 0 Z" fill={colors.lavender} stroke={inkLine} strokeWidth={6} />
      <Eye x={-26} y={-78} r={17} look={[0.1, 0]} closed={false} bodyColor={colors.lavender} />
      {wink ? (
        <path d="M 10 -78 Q 26 -66 42 -78" fill="none" stroke={inkLine} strokeWidth={5} strokeLinecap="round" />
      ) : (
        <Eye x={26} y={-78} r={17} look={[0.1, 0]} closed={false} bodyColor={colors.lavender} />
      )}
      {/* glasses */}
      <circle cx={-26} cy={-78} r={25} fill="none" stroke={inkLine} strokeWidth={6} />
      <circle cx={26} cy={-78} r={25} fill="none" stroke={inkLine} strokeWidth={6} />
      <line x1={-2} y1={-80} x2={2} y2={-80} stroke={inkLine} strokeWidth={6} />
      <path d="M -20 -38 Q 0 -20 20 -38" fill="none" stroke={inkLine} strokeWidth={5} strokeLinecap="round" />
      <circle cx={-44} cy={-44} r={8} fill="#ff9fb8" opacity={0.6} />
      <circle cx={44} cy={-44} r={8} fill="#ff9fb8" opacity={0.6} />
    </g>
  );
};

/** The shouting megaphone. `rage` shakes it, `deflate` squashes it into a sad little thing. */
export const Megaphone: React.FC<{ x: number; y: number; frame: number; rage: number; deflate: number; scale: number; shouting: boolean }> = ({
  x,
  y,
  frame,
  rage,
  deflate,
  scale,
  shouting,
}) => {
  const shake = shouting ? Math.sin(frame * 2.3) * 6 * (1 + rage) : 0;
  const sy = 1 - deflate * 0.55;
  const droop = deflate * 18;
  const body = deflate > 0.5 ? "#8b8fb8" : colors.indigo;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${scale} ${scale * sy}) rotate(${droop - rage * 4})`}>
      <ellipse cx={0} cy={150} rx={150} ry={16} fill="rgba(0,0,0,0.12)" />
      {/* handle */}
      <rect x={-70} y={40} width={40} height={100} rx={12} fill={inkLine} />
      {/* cone */}
      <path d="M -160 -40 L 110 -150 L 110 150 L -160 40 Z" fill={body} stroke={inkLine} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={110} cy={0} rx={34} ry={150} fill={colors.lavender} stroke={inkLine} strokeWidth={7} />
      <ellipse cx={110} cy={0} rx={16} ry={90} fill={inkLine} opacity={shouting ? 0.9 : 0.5} />
      <rect x={-190} y={-45} width={34} height={90} rx={10} fill={inkLine} />
      {/* face on the cone */}
      <Eye x={-60} y={-30} r={24} look={deflate > 0.5 ? [0, 0.8] : [1, -0.2]} closed={false} bodyColor={body} />
      <Eye x={5} y={-50} r={28} look={deflate > 0.5 ? [0, 0.8] : [1, -0.2]} closed={false} bodyColor={body} />
      {deflate < 0.5 ? (
        <>
          <line x1={-86} y1={-70} x2={-38} y2={-58} stroke={inkLine} strokeWidth={8} strokeLinecap="round" />
          <line x1={-22} y1={-94} x2={30} y2={-88} stroke={inkLine} strokeWidth={8} strokeLinecap="round" transform={`rotate(${-8 - rage * 8} 5 -90)`} />
        </>
      ) : (
        <>
          <line x1={-84} y1={-62} x2={-40} y2={-72} stroke={inkLine} strokeWidth={7} strokeLinecap="round" />
          <line x1={-20} y1={-92} x2={28} y2={-100} stroke={inkLine} strokeWidth={7} strokeLinecap="round" />
        </>
      )}
      {/* sweat */}
      {rage > 0.3 && deflate < 0.5 && (
        <path d={`M -120 ${-70 + ((frame * 3) % 60)} q 10 18 0 26 q -10 -8 0 -26 Z`} fill="#8fd3ff" stroke={inkLine} strokeWidth={3} />
      )}
    </g>
  );
};

/** A rolling tumbleweed made of scribbles. */
export const Tumbleweed: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {new Array(9).fill(0).map((_, i) => (
      <ellipse key={i} cx={0} cy={0} rx={60 - i * 3} ry={40 + i * 2} fill="none" stroke="#b58a52" strokeWidth={4} transform={`rotate(${i * 40})`} opacity={0.85} />
    ))}
  </g>
);

export const Heart: React.FC<{ x: number; y: number; s: number; color?: string }> = ({ x, y, s, color = "#ff5d8f" }) => (
  <path
    d="M 0 12 C -30 -12 -18 -38 0 -22 C 18 -38 30 -12 0 12 Z"
    transform={`translate(${x} ${y}) scale(${s * 1.6})`}
    fill={color}
    stroke={inkLine}
    strokeWidth={3}
  />
);
