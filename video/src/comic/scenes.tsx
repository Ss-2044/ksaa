import React from "react";
import { interpolate, staticFile } from "remotion";

// Comic scene library. Every scene draws inside a 600×600 box; t = frames since the panel appeared.
export const INK = "#111111";
const SKIN = ["#E8B98A", "#C98E5E", "#F1C9A0", "#A86F45"];
const ST = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Mood = "sad" | "happy" | "talk" | "wow";
export const Person: React.FC<{ x: number; y: number; s?: number; mood?: Mood; thobe?: boolean; shirt?: string; skin?: number; shemagh?: boolean }> = ({ x, y, s = 1, mood = "happy", thobe = true, shirt = "#3D5AFE", skin = 0, shemagh = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* body */}
    <path d="M -70 200 L -60 70 Q 0 40 60 70 L 70 200 Z" fill={thobe ? "#FFFFFF" : shirt} {...ST} />
    {thobe ? <path d="M 0 62 L 0 120" {...ST} strokeWidth={5} /> : null}
    {/* head */}
    <circle cx={0} cy={0} r={52} fill={SKIN[skin % 4]} {...ST} />
    {shemagh ? (
      <>
        <path d="M -62 -8 Q -60 -70 0 -72 Q 60 -70 62 -8 L 74 70 L 48 64 L 46 -10 Q 0 -30 -46 -10 L -48 64 L -74 70 Z" fill="#E63946" {...ST} />
        <path d="M -40 -50 L 40 -50 M -50 -30 L 50 -30 M -20 -66 L -20 -20 M 20 -66 L 20 -20" stroke="#FFFFFF" strokeWidth={4} opacity={0.75} />
        <path d="M -56 -40 Q 0 -60 56 -40" fill="none" stroke={INK} strokeWidth={10} />
      </>
    ) : (
      <path d="M -52 -10 Q -50 -60 0 -58 Q 50 -60 52 -10 Q 30 -36 0 -34 Q -30 -36 -52 -10 Z" fill={INK} />
    )}
    {/* face */}
    <circle cx={-18} cy={4} r={6} fill={INK} />
    <circle cx={18} cy={4} r={6} fill={INK} />
    {mood === "sad" ? <path d="M -18 34 Q 0 20 18 34" fill="none" {...ST} strokeWidth={6} /> : null}
    {mood === "happy" ? <path d="M -20 24 Q 0 44 20 24" fill="none" {...ST} strokeWidth={6} /> : null}
    {mood === "talk" ? <ellipse cx={0} cy={30} rx={12} ry={9} fill={INK} /> : null}
    {mood === "wow" ? <ellipse cx={0} cy={30} rx={10} ry={14} fill={INK} /> : null}
    {mood === "sad" ? <path d="M -30 -14 L -8 -8 M 30 -14 L 8 -8" {...ST} strokeWidth={5} /> : null}
  </g>
);

const Speed: React.FC<{ color?: string; n?: number }> = ({ color = "#FFFFFF", n = 28 }) => (
  <g opacity={0.55}>
    {new Array(n).fill(0).map((_, i) => {
      const a = (i / n) * Math.PI * 2;
      return <path key={i} d={`M ${300 + Math.cos(a) * 140} ${300 + Math.sin(a) * 140} L ${300 + Math.cos(a) * 520} ${300 + Math.sin(a) * 520}`} stroke={color} strokeWidth={i % 2 ? 6 : 12} />;
    })}
  </g>
);

const Heart: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 18 C -26 0 -24 -20 -10 -22 C -4 -23 0 -18 0 -14 C 0 -18 4 -23 10 -22 C 24 -20 26 0 0 18 Z" fill="#EF233C" {...ST} strokeWidth={4} />
);

export const SCENES: Record<string, React.FC<{ t: number }>> = {
  shop: ({ t }) => (
    <g>
      <rect x={70} y={130} width={460} height={430} fill="#FFF3D6" {...ST} />
      {new Array(8).fill(0).map((_, i) => (
        <path key={i} d={`M ${70 + i * 57.5} 130 L ${127.5 + i * 57.5} 130 L ${127.5 + i * 57.5} 190 Q ${99 + i * 57.5} 214 ${70 + i * 57.5} 190 Z`} fill={i % 2 ? "#FFFFFF" : "#EF233C"} {...ST} strokeWidth={5} />
      ))}
      <rect x={100} y={240} width={200} height={190} fill="#BDE8F5" {...ST} />
      <rect x={130} y={300} width={140} height={60} rx={8} fill="#FFFFFF" {...ST} strokeWidth={5} />
      <text x={200} y={342} textAnchor="middle" fontFamily="Lalezar" fontSize={40} fill={INK}>مفتوح</text>
      <rect x={340} y={250} width={150} height={310} fill="#8C5A3C" {...ST} />
      <Person x={415} y={420} s={0.62} mood="sad" />
      {/* tumbleweed rolling past */}
      <g transform={`translate(${-80 + ((t * 6) % 760)} 540) rotate(${t * 12})`}>
        <circle r={30} fill="none" stroke="#8C5A3C" strokeWidth={5} />
        <path d="M -24 -10 Q 0 20 24 -8 M -18 16 Q 0 -20 20 18" fill="none" stroke="#8C5A3C" strokeWidth={4} />
      </g>
    </g>
  ),
  call: ({ t }) => (
    <g>
      <Person x={300} y={300} s={1.5} mood="talk" />
      <rect x={350} y={240} width={70} height={130} rx={14} fill={INK} transform="rotate(14 385 305)" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${440 + i * 26} ${210 - i * 10} Q ${480 + i * 30} ${280} ${440 + i * 26} ${350 + i * 10}`} fill="none" {...ST} strokeWidth={6} opacity={(Math.sin(t / 3 - i) + 1) / 2} />
      ))}
    </g>
  ),
  hero: ({ t }) => (
    <g>
      <Speed />
      <polygon points={new Array(24).fill(0).map((_, i) => { const r = i % 2 ? 150 : 230; const a = (i / 24) * Math.PI * 2 + t / 40; return `${300 + Math.cos(a) * r},${300 + Math.sin(a) * r}`; }).join(" ")} fill="#FFD60A" {...ST} />
      <image href={staticFile("neocapta-logo-dark.png")} x={140} y={190} width={320} height={235} />
    </g>
  ),
  plan: ({ t }) => (
    <g>
      <rect x={60} y={110} width={480} height={330} fill="#FFFFFF" {...ST} />
      <path d="M 120 440 L 100 560 M 480 440 L 500 560" {...ST} />
      {["هوية", "محتوى", "حملة"].map((w, i) => {
        const p = interpolate(t, [12 + i * 12, 20 + i * 12], [0, 1], cl);
        return (
          <g key={w}>
            <rect x={420} y={150 + i * 95} width={60} height={60} rx={8} fill="#FFFFFF" {...ST} />
            <path d={`M 430 ${182 + i * 95} L 446 ${198 + i * 95} L 474 ${160 + i * 95}`} fill="none" stroke="#2A9D8F" strokeWidth={10} strokeLinecap="round" strokeDasharray={60} strokeDashoffset={60 * (1 - p)} />
            <text x={395} y={196 + i * 95} textAnchor="end" fontFamily="Lalezar" fontSize={54} fill={INK}>{w}</text>
          </g>
        );
      })}
      <Person x={130} y={430} s={0.7} thobe={false} shemagh={false} shirt="#3D5AFE" mood="talk" skin={1} />
    </g>
  ),
  post: ({ t }) => (
    <g>
      <rect x={170} y={70} width={260} height={470} rx={36} fill={INK} />
      <rect x={186} y={100} width={228} height={410} rx={20} fill="#FFFFFF" />
      <rect x={206} y={130} width={188} height={170} rx={10} fill="#FFD60A" {...ST} strokeWidth={4} />
      <circle cx={300} cy={215} r={42} fill="#3D5AFE" {...ST} strokeWidth={4} />
      <path d="M 210 330 L 390 330 M 210 360 L 340 360" {...ST} strokeWidth={8} opacity={0.4} />
      <Heart x={230} y={420} s={1.2} />
      {new Array(7).fill(0).map((_, i) => {
        const k = ((t * 2 + i * 22) % 120) / 120;
        return <Heart key={i} x={120 + ((i * 97) % 360)} y={520 - k * 520} s={0.9 + (i % 3) * 0.3} />;
      })}
    </g>
  ),
  crowd: ({ t }) => (
    <g>
      <rect x={60} y={60} width={480} height={180} fill="#FFF3D6" {...ST} />
      {new Array(8).fill(0).map((_, i) => (
        <path key={i} d={`M ${60 + i * 60} 60 L ${120 + i * 60} 60 L ${120 + i * 60} 110 Q ${90 + i * 60} 132 ${60 + i * 60} 110 Z`} fill={i % 2 ? "#FFFFFF" : "#EF233C"} {...ST} strokeWidth={5} />
      ))}
      {new Array(9).fill(0).map((_, i) => (
        <Person key={i} x={70 + (i % 5) * 115 + (i > 4 ? 55 : 0)} y={(i > 4 ? 470 : 390) + Math.sin(t / 3 + i) * 6} s={0.48} mood={i % 3 ? "happy" : "wow"} skin={i} shemagh={i % 2 === 0} thobe={i % 3 !== 1} shirt={["#3D5AFE", "#2A9D8F", "#EF233C"][i % 3]} />
      ))}
      <Person x={300} y={330} s={0.7} mood="happy" />
    </g>
  ),
  ask: ({ t }) => (
    <g>
      <Person x={180} y={300} s={1.4} mood="talk" skin={2} />
      {[0, 1, 2].map((i) => (
        <text key={i} x={360 + i * 70} y={260 - i * 60 + Math.sin(t / 5 + i) * 10} fontFamily="Lalezar" fontSize={110 - i * 20} fill={INK} transform={`rotate(${i * 12 - 10} ${360 + i * 70} ${260 - i * 60})`}>؟</text>
      ))}
    </g>
  ),
  answer: () => (
    <g>
      <Speed n={36} />
    </g>
  ),
  meeting: ({ t }) => (
    <g>
      <Person x={150} y={300} s={0.75} mood="talk" thobe={false} shemagh={false} shirt="#2A9D8F" skin={1} />
      <Person x={300} y={280} s={0.75} mood="happy" />
      <Person x={450} y={300} s={0.75} mood={t % 30 < 15 ? "happy" : "talk"} thobe={false} shemagh={false} shirt="#EF233C" skin={3} />
      <rect x={40} y={400} width={520} height={60} fill="#8C5A3C" {...ST} />
      <path d="M 90 460 L 90 580 M 510 460 L 510 580" {...ST} strokeWidth={10} />
      <path d="M 250 400 L 270 340 L 350 340 L 330 400 Z" fill="#D9D9D9" {...ST} strokeWidth={5} />
    </g>
  ),
  bulbs: ({ t }) => (
    <g>
      {[0, 1, 2].map((i) => {
        const on = t > 10 + i * 12;
        const x = 140 + i * 160;
        const y = 260 + (i % 2) * 70;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${on ? 1.1 : 0.9})`}>
            {on ? new Array(8).fill(0).map((_, k) => <path key={k} d="M 0 -95 L 0 -130" stroke={INK} strokeWidth={7} strokeLinecap="round" transform={`rotate(${k * 45} 0 -20)`} />) : null}
            <path d="M 0 -90 C -50 -90 -66 -50 -60 -25 C -54 0 -32 10 -30 32 L 30 32 C 32 10 54 0 60 -25 C 66 -50 50 -90 0 -90 Z" fill={on ? "#FFF3B0" : "#FFFFFF"} {...ST} />
            <rect x={-28} y={32} width={56} height={34} rx={6} fill="#AAAAAA" {...ST} strokeWidth={5} />
          </g>
        );
      })}
    </g>
  ),
  camera: ({ t }) => (
    <g>
      {t % 24 < 6 ? <polygon points={new Array(16).fill(0).map((_, i) => { const r = i % 2 ? 120 : 260; const a = (i / 16) * Math.PI * 2; return `${300 + Math.cos(a) * r},${230 + Math.sin(a) * r}`; }).join(" ")} fill="#FFFFFF" {...ST} /> : null}
      <rect x={130} y={240} width={340} height={230} rx={30} fill="#333333" {...ST} />
      <rect x={200} y={200} width={110} height={50} rx={10} fill="#333333" {...ST} />
      <circle cx={300} cy={355} r={80} fill="#5C6BC0" {...ST} />
      <circle cx={300} cy={355} r={40} fill={INK} />
      <circle cx={285} cy={338} r={12} fill="#FFFFFF" />
      <rect x={400} y={260} width={44} height={26} rx={6} fill="#FFD60A" {...ST} strokeWidth={4} />
    </g>
  ),
  rocket: ({ t }) => {
    const y = 330 - Math.min(t, 80) * 2.4;
    return (
      <g>
        {new Array(6).fill(0).map((_, i) => (
          <circle key={i} cx={300 + (i - 2.5) * 46} cy={540 - (i % 2) * 20} r={48 + (i % 3) * 10} fill="#FFFFFF" {...ST} strokeWidth={5} opacity={0.95} />
        ))}
        <g transform={`translate(300 ${y})`}>
          <path d="M 0 -150 C 60 -100 62 20 46 80 L -46 80 C -62 20 -60 -100 0 -150 Z" fill="#FFFFFF" {...ST} />
          <circle cx={0} cy={-40} r={24} fill="#00B4D8" {...ST} strokeWidth={5} />
          <path d="M -46 30 L -90 100 L -42 80 Z M 46 30 L 90 100 L 42 80 Z" fill="#EF233C" {...ST} strokeWidth={5} />
          <path d={`M -26 80 Q 0 ${150 + (t % 6) * 6} 26 80 Z`} fill="#FFD60A" {...ST} strokeWidth={5} />
        </g>
      </g>
    );
  },
  chart: ({ t }) => (
    <g>
      <path d="M 70 540 L 540 540 M 70 540 L 70 120" {...ST} strokeWidth={9} />
      {[0.25, 0.4, 0.55, 0.8].map((h, i) => {
        const p = interpolate(t, [8 + i * 8, 24 + i * 8], [0, 1], { ...cl });
        return <rect key={i} x={110 + i * 105} y={540 - 380 * h * p} width={80} height={380 * h * p} fill={["#00B4D8", "#2A9D8F", "#3D5AFE", "#EF233C"][i]} {...ST} strokeWidth={6} />;
      })}
      <path d={`M 110 470 L 220 400 L 320 410 L 470 ${interpolate(t, [30, 50], [300, 160], cl)}`} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <Person x={480} y={450} s={0.55} mood="wow" />
    </g>
  ),
};
