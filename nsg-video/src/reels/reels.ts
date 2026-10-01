import {GUESS_1, GUESS_2, makeGuess, ROUND} from './Guess';
import {Pipeline, STEP} from './Pipeline';
import {createElement} from 'react';
import {CTA, INTRO, ReelDef, ReelShell} from './Reel';
import {ITEM, Top5} from './Top5';
import {QLEN, QUESTIONS, TrueFalse} from './TrueFalse';

const MAC = 'Music: Kevin MacLeod (incompetech.com) · CC BY 4.0';

export const REELS: Record<string, ReelDef> = {
  guess1: {
    label: 'خمّن المكان',
    en: 'GUESS THE PLACE · PART 1',
    Body: makeGuess(GUESS_1),
    body: ROUND * 3,
    music: 'music/hiding-your-reality.mp3',
    volume: 0.55,
    cta: {ar: 'كم جواب صح جاوبت؟', en: 'How many did you get right?', sub: 'اكتب نتيجتك في التعليقات'},
    credit: `Imagery: NASA (Terra, Landsat/ASTER, ISS) · ${MAC} — "Hiding Your Reality"`,
  },
  guess2: {
    label: 'خمّن المكان',
    en: 'GUESS THE PLACE · PART 2',
    Body: makeGuess(GUESS_2),
    body: ROUND * 3,
    music: 'music/danse-morialta.mp3',
    volume: 0.7,
    cta: {ar: 'هل عرفتها كلها؟', en: 'Did you get them all?', sub: 'اكتب نتيجتك في التعليقات'},
    credit: `Imagery: NASA ISS crew photography · ${MAC} — "Danse Morialta"`,
  },
  truefalse: {
    label: 'صح أو خطأ؟',
    en: 'TRUE OR FALSE · SPACE EDITION',
    Body: TrueFalse,
    body: QLEN * QUESTIONS.length,
    music: 'music/volatile-reaction.mp3',
    volume: 0.3,
    cta: {ar: 'كم نتيجتك من 4؟', en: 'What did you score out of 4?', sub: 'شاركها في التعليقات'},
    credit: `Imagery: NASA (Galileo, ISS, Apollo 17, Landsat/ASTER) · ${MAC} — "Volatile Reaction"`,
  },
  top5: {
    label: 'أجمل 5 مشاهد',
    en: 'TOP 5 VIEWS FROM SPACE',
    Body: Top5,
    body: ITEM * 5,
    music: 'music/sovereign-quarter.mp3',
    volume: 1,
    trimBefore: 1,
    cta: {ar: 'أي مشهد أعجبك أكثر؟', en: 'Which view is your favourite?', sub: 'اكتب رقمه في التعليقات'},
    credit: `Imagery: NASA (ISS, Landsat/ASTER, Terra, Apollo 17) · ${MAC} — "Sovereign Quarter"`,
  },
  pipeline: {
    label: 'كيف تُصنع الخريطة؟',
    en: 'FROM LIGHT TO DECISION',
    Body: Pipeline,
    body: STEP * 5,
    music: 'music/ice-flow.mp3',
    volume: 0.3,
    cta: {ar: 'من الضوء… إلى القرار', en: 'From light to decision', sub: 'شارك المقطع مع من يهمه الأمر'},
    credit: `Imagery: NASA (Landsat, ISS, ASTER) · Map data © OpenStreetMap contributors · ${MAC} — "Ice Flow"`,
  },
};

export const reelFrames = (id: string) => INTRO + REELS[id].body + CTA;

// Props stay JSON-serialisable: the composition passes an id, the definition is looked up here.
export const ReelById: React.FC<{id: string}> = ({id}) => createElement(ReelShell, {def: REELS[id]});
