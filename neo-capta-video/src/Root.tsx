import React from 'react';
import { Composition } from 'remotion';
import { NeoCapta, DURATION, FPS } from './NeoCapta';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="NeoCapta-AR"
      component={NeoCapta}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ lang: 'ar' as const }}
    />
    <Composition
      id="NeoCapta-EN"
      component={NeoCapta}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ lang: 'en' as const }}
    />
  </>
);
