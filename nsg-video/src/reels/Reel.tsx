import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {useFonts} from '../Video';
import {ReelCTA, ReelHeader, ReelIntro} from './kit';

export const INTRO = 90;
export const CTA = 90;

export type ReelDef = {
  label: string;
  en: string;
  Body: React.FC;
  body: number;
  music: string;
  volume: number;
  trimBefore?: number;
  cta: {ar: string; en: string; sub?: string};
  credit: string;
};

export const ReelShell: React.FC<{def: ReelDef}> = ({def}) => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const progress = interpolate(frame, [INTRO, INTRO + def.body], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Background />
      <Sequence durationInFrames={INTRO} name="intro">
        <ReelIntro />
      </Sequence>
      <Sequence from={INTRO} durationInFrames={def.body} name="body">
        <def.Body />
        <ReelHeader label={def.label} en={def.en} progress={progress} />
      </Sequence>
      <Sequence from={INTRO + def.body} name="cta">
        <ReelCTA {...def.cta} />
        <div style={{position: 'absolute', bottom: 50, left: 60, right: 60, textAlign: 'center', fontFamily: 'Montserrat', fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5}}>{def.credit}</div>
      </Sequence>
      <Audio
        src={staticFile(def.music)}
        trimBefore={Math.round((def.trimBefore ?? 0) * fps)}
        volume={(f) => def.volume * interpolate(f, [0, 10, durationInFrames - 25, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
