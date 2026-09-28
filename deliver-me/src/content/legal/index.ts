import type { Locale } from "@/config/site";

/**
 * Website legal copy (marketing site only — the app has its own terms).
 * Written to align with the Saudi Personal Data Protection Law (PDPL).
 * ⚠️ Must be reviewed by Deliver Me's legal counsel before launch, and the
 * controller details (legal name, CR number, contact) filled via env vars.
 */
export type LegalDoc = "privacy" | "terms" | "cookies";
type Section = { h: string; p: string[] };
type Doc = { title: string; description: string; updated: string; sections: Section[] };

const UPDATED = "2026-09-28";

export const legal: Record<Locale, Record<LegalDoc, Doc>> = {
  en: {
    privacy: {
      title: "Privacy Policy",
      description: "How Deliver Me collects, uses and protects personal data on this website.",
      updated: UPDATED,
      sections: [
        { h: "Who we are", p: ["This website is operated by Deliver Me (وصّل لي), the data controller for personal data collected through it. You can reach us about privacy through the contact page."] },
        { h: "What we collect", p: [
          "Partner applications: business name and type, city, number of branches, an optional order-volume estimate, contact name, mobile number and email.",
          "Contact messages: name, email, optional mobile number, topic, optional order number and your message.",
          "Usage data: if you accept analytics cookies, pages viewed and interactions, collected through Google Tag Manager / Google Analytics. We also keep an anonymous session ID and campaign (UTM) parameters in your browser session to understand which campaigns bring visitors.",
          "WhatsApp: when you tap a WhatsApp button we log an anonymous reference number, the page and the campaign so our team can recognise your chat. What you then send on WhatsApp is governed by WhatsApp's own terms.",
        ] },
        { h: "Why we use it", p: ["To respond to your request, evaluate and onboard partners, provide support, and improve the website. We rely on your consent (forms and analytics) and on our legitimate interest in operating a secure website. We do not sell personal data."] },
        { h: "Sharing", p: ["We share data only with service providers who process it for us under contract — for example hosting, our CRM and email tools — and with authorities where the law requires it."] },
        { h: "Retention", p: ["Partner leads that don't become partners are deleted or anonymised within 24 months. Contact messages are kept for up to 12 months after the conversation ends. Analytics data is retained for 14 months."] },
        { h: "Security", p: ["Data is transmitted over HTTPS, access is restricted by role, and form submissions are validated and rate-limited on our servers."] },
        { h: "Your rights", p: ["Under the Personal Data Protection Law you can ask to be informed about, access, correct or delete your personal data, and withdraw consent at any time. Contact us and we'll respond within the period the law requires."] },
        { h: "Changes", p: ["We'll update this page when our practices change and show the date of the latest version below the title."] },
      ],
    },
    terms: {
      title: "Terms of Use",
      description: "Terms for using the Deliver Me website.",
      updated: UPDATED,
      sections: [
        { h: "About these terms", p: ["These terms cover your use of this website. Ordering through the Deliver Me app is covered by the terms shown in the app."] },
        { h: "Using the site", p: ["Use the site lawfully and don't attempt to disrupt it, access it by automated means that overload it, or submit false information through its forms."] },
        { h: "Content", p: ["The Deliver Me name, logo, text and design are owned by Deliver Me or used with permission. Food and grocery photography may be licensed from third parties. Partner names and logos belong to their owners."] },
        { h: "Partner applications", p: ["Submitting a partner application doesn't create a contract. Partnership terms, including commission, are agreed separately in writing."] },
        { h: "Liability", p: ["We work to keep the information here accurate and up to date, but availability, coverage and offers can change. Check the app for what's available at your address."] },
        { h: "Governing law", p: ["These terms are governed by the laws of the Kingdom of Saudi Arabia."] },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      description: "Which cookies and similar storage the Deliver Me website uses.",
      updated: UPDATED,
      sections: [
        { h: "Essential", p: ["NEXT_LOCALE remembers your language (1 year). dm_consent remembers your cookie choice. dm_attr (session storage) holds an anonymous session ID and campaign parameters for the current visit only."] },
        { h: "Analytics (only with your consent)", p: ["If you choose “Accept analytics”, Google Tag Manager loads Google Analytics, which sets cookies such as _ga to measure visits. Advertising storage stays off."] },
        { h: "Changing your choice", p: ["Use “Cookie settings” in the footer at any time to change your choice."] },
      ],
    },
  },
  ar: {
    privacy: {
      title: "سياسة الخصوصية",
      description: "كيف يجمع وصّل لي البيانات الشخصية في هذا الموقع ويستخدمها ويحميها.",
      updated: UPDATED,
      sections: [
        { h: "من نحن", p: ["يُدار هذا الموقع بواسطة وصّل لي (Deliver Me)، وهي الجهة المسؤولة عن البيانات الشخصية التي تُجمع من خلاله. تقدر تتواصل معنا بخصوص الخصوصية من صفحة التواصل."] },
        { h: "وش نجمع", p: [
          "طلبات الشراكة: اسم النشاط ونوعه، المدينة، عدد الفروع، تقدير اختياري لعدد الطلبات، اسم المسؤول، رقم الجوال والبريد الإلكتروني.",
          "رسائل التواصل: الاسم، البريد الإلكتروني، رقم الجوال (اختياري)، الموضوع، رقم الطلب (اختياري) ونص رسالتك.",
          "بيانات الاستخدام: إذا وافقت على كوكيز التحليلات، نجمع الصفحات اللي زرتها وتفاعلك معها عن طريق Google Tag Manager و Google Analytics. ونحفظ كذلك معرّف جلسة مجهول ومعايير الحملات (UTM) في جلسة المتصفح عشان نعرف أي الحملات تجيب الزوار.",
          "واتساب: لما تضغط زر واتساب نسجّل رقم مرجعي مجهول والصفحة والحملة عشان يتعرف فريقنا على محادثتك. وأي شي ترسله بعدها في واتساب تحكمه شروط واتساب.",
        ] },
        { h: "ليش نستخدمها", p: ["للرد على طلبك، وتقييم الشركاء وتجهيزهم، وتقديم الدعم، وتحسين الموقع. نعتمد على موافقتك (في النماذج والتحليلات) وعلى مصلحتنا المشروعة في تشغيل موقع آمن. وما نبيع البيانات الشخصية."] },
        { h: "المشاركة", p: ["نشارك البيانات فقط مع مزودي خدمات يعالجونها لصالحنا بموجب عقود — مثل الاستضافة ونظام إدارة العملاء وأدوات البريد — ومع الجهات الرسمية إذا تطلّب النظام ذلك."] },
        { h: "مدة الاحتفاظ", p: ["طلبات الشراكة اللي ما تتحول لشراكة تُحذف أو تُجهّل خلال ٢٤ شهر. رسائل التواصل نحتفظ فيها لمدة أقصاها ١٢ شهر بعد انتهاء المحادثة. وبيانات التحليلات تُحفظ ١٤ شهر."] },
        { h: "الأمان", p: ["تنتقل البيانات عبر HTTPS، والوصول لها محصور حسب الصلاحيات، والنماذج يتم التحقق منها وتحديد عدد محاولاتها على خوادمنا."] },
        { h: "حقوقك", p: ["بموجب نظام حماية البيانات الشخصية، لك الحق تعرف عن بياناتك، وتطّلع عليها، وتصححها، أو تطلب حذفها، وتسحب موافقتك في أي وقت. تواصل معنا وبنرد عليك خلال المدة النظامية."] },
        { h: "التحديثات", p: ["بنحدّث هذي الصفحة إذا تغيّرت ممارساتنا، وتاريخ آخر تحديث موضّح تحت العنوان."] },
      ],
    },
    terms: {
      title: "شروط الاستخدام",
      description: "شروط استخدام موقع وصّل لي.",
      updated: UPDATED,
      sections: [
        { h: "عن هذي الشروط", p: ["هذي الشروط تخص استخدامك لهذا الموقع. أما الطلب من تطبيق وصّل لي فتحكمه الشروط الموضحة داخل التطبيق."] },
        { h: "استخدام الموقع", p: ["استخدم الموقع بشكل نظامي، ولا تحاول تعطيله أو الوصول له بطرق آلية تثقل عليه، ولا ترسل معلومات غير صحيحة في النماذج."] },
        { h: "المحتوى", p: ["اسم وصّل لي وشعاره ونصوصه وتصميمه مملوكة لوصّل لي أو مستخدمة بإذن. وقد تكون بعض صور الأكل والبقالة مرخّصة من أطراف أخرى. وأسماء الشركاء وشعاراتهم ملك لأصحابها."] },
        { h: "طلبات الشراكة", p: ["إرسال طلب الشراكة ما يعني وجود عقد. شروط الشراكة، ومنها العمولة، يُتفق عليها كتابيًا بشكل منفصل."] },
        { h: "المسؤولية", p: ["نحرص إن المعلومات هنا دقيقة ومحدّثة، لكن التوفر والتغطية والعروض ممكن تتغير. شوف التطبيق عشان تعرف وش المتوفر لعنوانك."] },
        { h: "النظام المطبّق", p: ["تخضع هذي الشروط لأنظمة المملكة العربية السعودية."] },
      ],
    },
    cookies: {
      title: "سياسة ملفات تعريف الارتباط",
      description: "ملفات تعريف الارتباط والتخزين المشابه اللي يستخدمها موقع وصّل لي.",
      updated: UPDATED,
      sections: [
        { h: "الأساسية", p: ["NEXT_LOCALE يحفظ لغتك (سنة). و dm_consent يحفظ اختيارك للكوكيز. و dm_attr (تخزين الجلسة) فيه معرّف جلسة مجهول ومعايير الحملة للزيارة الحالية فقط."] },
        { h: "التحليلات (بموافقتك فقط)", p: ["إذا اخترت «أوافق على التحليلات»، يتم تحميل Google Tag Manager و Google Analytics، ويضيف كوكيز مثل _ga لقياس الزيارات. وتخزين الإعلانات يبقى مقفل."] },
        { h: "تغيير اختيارك", p: ["استخدم «إعدادات الكوكيز» في أسفل الصفحة متى ما حبيت تغيّر اختيارك."] },
      ],
    },
  },
};
