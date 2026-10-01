import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {FrameSize} from '../frameSize';
import {fonts} from '../theme';
import {Clip, STORIES, StoryId} from './Clip';

const W = 1080;
const SCALE = W / 1920;

// 9:16 version for Reels / TikTok / Snapchat: brand header, the 16:9 story in the middle, footer.
export const VerticalClip: React.FC<{story: StoryId}> = ({story}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = STORIES[story];
  const p = spring({frame: frame - 6, fps, config: {damping: 200}});
  const glow = 0.25 + 0.15 * Math.sin(frame / 20);
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <Img src={staticFile('nsg-logo.png')} style={{width: 300, marginTop: 150, opacity: p}} />
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 86, color: '#fff', marginTop: 70, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
          {s.titleAr}
        </div>
        <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 28, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.7)', marginTop: 4, textTransform: 'uppercase', opacity: p}}>{s.titleEn}</div>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 680,
          width: W,
          height: 1080 * SCALE,
          overflow: 'hidden',
          borderTop: '2px solid rgba(255,255,255,0.6)',
          borderBottom: '2px solid rgba(255,255,255,0.6)',
          boxShadow: `0 0 80px rgba(157,162,230,${glow})`,
        }}
      >
        <div style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${SCALE})`, transformOrigin: '0 0'}}>
          <FrameSize.Provider value={{width: 1920, height: 1080}}>
            <Clip story={story} />
          </FrameSize.Provider>
        </div>
      </div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 190}}>
        <div dir="rtl" style={{display: 'flex', gap: 18, fontFamily: fonts.ar, fontSize: 34, color: '#fff', opacity: interpolate(frame, [20, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          <span>فضاء</span>
          <span style={{opacity: 0.5}}>·</span>
          <span>بيانات جيومكانية</span>
        </div>
        <div style={{fontFamily: fonts.en, fontSize: 20, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)', marginTop: 8}}>SPACE · GEOSPATIAL DATA</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
