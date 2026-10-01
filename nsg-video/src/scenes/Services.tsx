import {AbsoluteFill} from 'remotion';
import {Card} from '../components/Card';
import {ArabicText, EnglishText} from '../components/Text';

export const Services: React.FC<{duration: number}> = ({duration}) => {
  const step = Math.min(30, (duration - 100) / 4);
  const items = [
    {ar: 'NSG Skywaves® (IFC)', en: 'In-flight connectivity', descAr: 'اتصال الطائرات أثناء الرحلة'},
    {ar: 'خدمات NSG الجغرافية المكانية', en: 'NSG Geospatial', descAr: 'حلول بيانات وتحليلات مكانية'},
    {ar: 'NSG UP42', en: 'Earth-observation platform', descAr: 'منصة بيانات رصد الأرض'},
    {ar: 'تأجير سعة الأقمار الصناعية', en: 'Satellite capacity leasing', descAr: 'سعة مدارية مرنة للقطاعات'},
  ];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50}}>
      <div>
        <ArabicText text="خدماتنا" delay={4} size={80} />
        <EnglishText text="Our Services" delay={10} size={28} />
      </div>
      <div dir="rtl" style={{display: 'flex', gap: 34}}>
        {items.map((it, i) => (
          <Card key={it.en} {...it} delay={26 + step * i} width={390} minHeight={250} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
