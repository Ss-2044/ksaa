import {AbsoluteFill} from 'remotion';
import {Card} from '../components/Card';
import {GeoGrid, NavTarget, SignalRings} from '../components/Graphics';
import {ArabicText, EnglishText} from '../components/Text';

export const Sectors: React.FC<{duration: number}> = ({duration}) => {
  const step = Math.min(45, (duration - 90) / 3);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50}}>
      <div>
        <ArabicText text="ثلاث ركائز… منظومة واحدة" delay={4} size={70} />
        <EnglishText text="Three pillars · One ecosystem" delay={10} size={28} />
      </div>
      <div dir="rtl" style={{display: 'flex', gap: 44}}>
        <Card
          delay={24}
          ar="الاتصالات عبر الأقمار الصناعية"
          en="Satellite Communications"
          descAr="اتصال موثوق في كل مكان"
          icon={<SignalRings size={200} />}
        />
        <Card
          delay={24 + step}
          ar="البيانات الجغرافية المكانية"
          en="Geospatial Data"
          descAr="رؤية أوضح للأرض من المدار"
          icon={
            <div style={{width: 300, height: 170, overflow: 'hidden'}}>
              <GeoGrid width={300} height={170} tilt={0} />
            </div>
          }
        />
        <Card
          delay={24 + step * 2}
          ar="تحديد المواقع والملاحة والتوقيت"
          en="PNT · Positioning, Navigation & Timing"
          descAr="دقة تقود الحركة والقرار"
          icon={<NavTarget size={200} />}
        />
      </div>
    </AbsoluteFill>
  );
};
