import type { Lang } from "../lang";

// Comedy: a shouting megaphone loses the crowd; Neo Capta asks and listens.
export const megaCopy: Record<
  Lang,
  {
    sticker: string;
    shouts: string[];
    louder: string[];
    nobody: string;
    ask: string;
    listen: [string, string];
    wink: string;
  }
> = {
  en: {
    sticker: "Traditional marketing",
    shouts: ["BUY NOW!!!", "LIMITED OFFER!!!", "BUY NOW!!!", "HELLO?!"],
    louder: ["BUY!!!", "PLEASE!!!", "!!!!!!"],
    nobody: "Nobody's listening.",
    ask: "So… what do you actually like?",
    listen: ["Listen first.", "Then talk."],
    wink: "(and we hear it too)",
  },
  ar: {
    sticker: "التسويق التقليدي",
    shouts: ["اشترِ الحين!!!", "عرض محدود!!!", "اشترِ الحين!!!", "ألو؟!"],
    louder: ["اشترِ!!!", "تكفون!!!", "!!!!!!"],
    nobody: "ولا أحد سامع.",
    ask: "طيب… وش تحبون فعلاً؟",
    listen: ["اسمع أول…", "بعدين تكلّم."],
    wink: "(ونسمعه بعد)",
  },
};
