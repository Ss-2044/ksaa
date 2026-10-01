import {staticFile} from 'remotion';

// The white logo PNG recoloured to any ink colour via CSS mask.
export const InkLogo: React.FC<{width: number; color?: string; style?: React.CSSProperties}> = ({width, color = '#16182F', style}) => (
  <div
    style={{
      width,
      height: (width * 336) / 732,
      backgroundColor: color,
      WebkitMaskImage: `url(${staticFile('nsg-logo.png')})`,
      WebkitMaskSize: '100% 100%',
      ...style,
    }}
  />
);
