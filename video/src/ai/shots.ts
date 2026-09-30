// Shot list for the REEF-style NEO CAPTA edit. Drop the generated clips in public/shots/ with these names.
export type Shot = {
  file: string;
  duration: number; // frames @30fps
  startFrom?: number; // frames to skip at the start of the clip
  label: string; // Arabic description shown on the placeholder
  text?: { en: string; ar: string; highlight?: number[] };
  inserts?: boolean; // quick designed cards after the clip
};

export const shots: Shot[] = [
  { file: "shot01.mp4", duration: 105, label: "المجلة على كرسي الطيارة وتلمع" },
  { file: "shot02.mp4", duration: 120, label: "المضيفة تعطيك المجلة" },
  { file: "shot03.mp4", duration: 90, label: "فتح المجلة ويطلع منها ضوء" },
  { file: "shot04.mp4", duration: 90, label: "تقليب الصفحات بسرعة", inserts: true },
  { file: "shot05.mp4", duration: 105, label: "تناظر الكاميرا", text: { en: "Every idea starts somewhere.", ar: "كل فكرة تبدأ من مكانٍ ما.", highlight: [3] } },
  { file: "shot06.mp4", duration: 105, label: "تمشي في طيارة خاصة", text: { en: "But not every idea knows where to go.", ar: "لكن ليست كل فكرة تعرف إلى أين تذهب.", highlight: [5, 6, 7] } },
  { file: "shot07.mp4", duration: 90, label: "لقطة الوجه القريبة", text: { en: "We give every idea a direction.", ar: "نحن نمنح كل فكرة وجهتها.", highlight: [5] } },
  { file: "shot08.mp4", duration: 150, label: "توقيع الشراكة والمصافحة", text: { en: "Strategic Partnership", ar: "شراكة استراتيجية" } },
  { file: "shot09.mp4", duration: 105, label: "الناس يصورونك بالجوالات" },
];

export const INSERT_FRAMES = 45;
export const OUTRO_FRAMES = 120;
export const aiDuration =
  shots.reduce((sum, s) => sum + s.duration + (s.inserts ? INSERT_FRAMES : 0), 0) + OUTRO_FRAMES;
