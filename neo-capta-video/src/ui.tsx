import { colors, fonts } from "./theme";

export const Pill: React.FC<{ children: React.ReactNode; dir?: "ltr" | "rtl"; style?: React.CSSProperties }> = ({
  children,
  dir = "ltr",
  style,
}) => (
  <div
    dir={dir}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 16,
      padding: "14px 28px",
      borderRadius: 999,
      border: `1.5px solid ${colors.line}`,
      background: "rgba(11,11,20,0.45)",
      color: colors.white,
      fontFamily: dir === "rtl" ? fonts.ar : fonts.mono,
      fontWeight: 500,
      fontSize: dir === "rtl" ? 28 : 22,
      letterSpacing: dir === "rtl" ? 0 : "0.18em",
      ...style,
    }}
  >
    <span style={{ width: 12, height: 12, borderRadius: 6, background: colors.lavender, boxShadow: `0 0 16px ${colors.lavender}` }} />
    {children}
  </div>
);

/** Big English display line, matching the website's heavy, tight headline. */
export const displayEn: React.CSSProperties = {
  fontFamily: fonts.display,
  fontWeight: 900,
  letterSpacing: "-0.045em",
  lineHeight: 0.95,
  color: colors.white,
};

/** Arabic headline style — no letter-spacing so letters stay joined. */
export const displayAr: React.CSSProperties = {
  fontFamily: fonts.ar,
  fontWeight: 700,
  lineHeight: 1.15,
  color: colors.white,
};
