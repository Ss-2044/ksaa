import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { fontFamilies } from "../theme";

// Holds rendering until the web fonts are ready.
export const useFonts = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    Promise.all(fontFamilies.map((f) => document.fonts.load(`700 40px "${f}"`, "abcأبج")))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};
