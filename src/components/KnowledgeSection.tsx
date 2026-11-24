import React, { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ExternalLink, LockKeyhole, Search, ShieldCheck } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export type KnowledgeSectionId =
  | 'prophets'
  | 'seerah'
  | 'companions'
  | 'islamic-stories'
  | 'fiqh'
  | 'names-of-allah'
  | 'afterlife'
  | 'challenges'
  | 'admin-dashboard';

interface KnowledgeSectionProps {
  id: KnowledgeSectionId;
  isEn?: boolean;
}

type Card = { title: string; description: string; source?: string; url?: string };

const CONTENT: Record<KnowledgeSectionId, { ar: string; en: string; introAr: string; introEn: string; cards: Card[]; protected?: boolean }> = {
  prophets: {
    ar: 'قصص الأنبياء والرسل', en: 'Prophets and Messengers',
    introAr: 'قسم مستقل لقصص الأنبياء المذكورين في القرآن، مع ربط القصة بمواضع الآيات ومصادرها.', introEn: 'A dedicated section for Quranic prophet stories linked to their verses and sources.',
    cards: [
      { title: 'فهرس الأنبياء المذكورين في القرآن', description: 'فهرس تمهيدي لا يعرض قصة غير موثقة؛ عند اختيار الاسم تُربط الآيات والمراجع قبل النشر.', source: 'القرآن الكريم' },
      { title: 'الدروس والعبر', description: 'تُعرض بعد مراجعة المادة من مصدر تفسيري أو سيرة معتمد، ولا تُنسب للشرع من غير توثيق.', source: 'التفسير الموثق' },
      { title: 'الاستماع إلى القصص', description: 'الصوتيات ستُضاف من مصدر مرخص ومطابقة للنص، ولن نستخدم صوتاً مولداً للمحتوى الديني.' },
    ],
  },
  seerah: {
    ar: 'السيرة النبوية', en: 'Prophetic Seerah',
    introAr: 'قسم مستقل للسيرة النبوية وأحداثها ومواقفها وأخلاق النبي ﷺ، مع إظهار المصدر لكل مادة.', introEn: 'A dedicated seerah section with sources shown for every item.',
    cards: [
      { title: 'من المولد إلى البعثة', description: 'خط زمني للسيرة يحتاج إدخالاً موثقاً قبل اعتماده داخل التطبيق.', source: 'كتب السيرة المعتمدة' },
      { title: 'الهجرة والغزوات', description: 'أحداث مرتبة زمنياً مع التفريق بين الروايات الثابتة وما يحتاج إلى بيان.', source: 'مصادر السيرة والتاريخ' },
      { title: 'الأخلاق والمواقف', description: 'مواقف صحيحة مع تخريج الروايات، دون اختصار يغير المعنى.', source: 'الصحيح من السنة' },
    ],
  },
  companions: {
    ar: 'الصحابة والتابعون', en: 'Companions and Followers',
    introAr: 'قسم مستقل للتعريف بالصحابة والصحابيات والخلفاء الراشدين والتابعين من مصادر التراجم الموثوقة.', introEn: 'A dedicated biographies section based on reliable biographical sources.',
    cards: [
      { title: 'الخلفاء الراشدون', description: 'بطاقات تعريفية ومواقف موثقة، مع مراجعة المصادر قبل نشر التفاصيل.', source: 'كتب التراجم والتاريخ المعتبرة' },
      { title: 'الصحابة والصحابيات', description: 'بحث وفهرس للأسماء والمواقف، دون قصص شعبية بلا سند واضح.', source: 'مصادر الحديث والتراجم' },
      { title: 'التابعون والعلماء', description: 'تصنيف زمني ومجالات العلم مع إحالة للمراجع.', source: 'كتب التراجم' },
    ],
  },
  'islamic-stories': {
    ar: 'قصص إسلامية متنوعة', en: 'Islamic Stories',
    introAr: 'قسم مستقل للقصص القرآنية وقصص الصالحين والتاريخ الإسلامي، مع بيان درجة الرواية ومصدرها.', introEn: 'A dedicated stories section with source and narration status.',
    cards: [
      { title: 'قصص القرآن', description: 'ربط القصة بمواضعها في المصحف، وعدم إضافة تفاصيل لم ترد في النص أو التفسير الموثق.', source: 'القرآن الكريم والتفسير' },
      { title: 'قصص الصبر والتوبة', description: 'لا تُعرض القصة كحديث أو أثر إلا بعد التحقق من مصدرها ودرجتها.', source: 'مصادر الحديث والتاريخ' },
      { title: 'التاريخ الإسلامي', description: 'مادة تعليمية مع فصل الخبر التاريخي عن النص الشرعي.', source: 'مراجع التاريخ الإسلامي' },
    ],
  },
  fiqh: {
    ar: 'العبادات والفقه', en: 'Worship and Fiqh',
    introAr: 'قسم مستقل للعبادات والفقه، مع تنبيه أن المسائل الكبرى تحتاج سؤال عالم موثوق ولا يقدم التطبيق فتوى شخصية.', introEn: 'A dedicated worship and fiqh section with clear scholarly limitations.',
    cards: [
      { title: 'الصلاة والطهارة', description: 'أدلة تعليمية مرتبة من مصادر الفقه المعتبرة، مع بيان اختلاف المذاهب عند الحاجة.', source: 'كتب الفقه المعتمدة' },
      { title: 'الصيام والزكاة والحج', description: 'محتوى تعليمي موثق، وليس بديلاً عن الفتوى الخاصة بالحالة.', source: 'مصادر الفقه الرسمية' },
      { title: 'الأسئلة الفقهية', description: 'الأسئلة الحساسة مثل الطلاق والمواريث تُحال إلى عالم أو جهة إفتاء موثوقة.', source: 'إرشاد شرعي' },
    ],
  },
  'names-of-allah': {
    ar: 'أسماء الله الحسنى', en: 'Names of Allah',
    introAr: 'قسم مستقل لأسماء الله الحسنى مع ضبط النص والمعنى والإحالة إلى مصادر العقيدة والتفسير.', introEn: 'A dedicated section for the beautiful names with source references.',
    cards: [
      { title: 'فهرس الأسماء', description: 'يعرض الاسم كما ورد في النصوص، ولا يثبت اسماً بلا دليل.', source: 'القرآن والسنة الصحيحة' },
      { title: 'المعاني والشروح', description: 'شرح موجز من كتب أهل العلم، مع تجنب التفسيرات الإنشائية غير المنقولة.', source: 'كتب العقيدة والتفسير' },
      { title: 'التدبر والدعاء', description: 'ربط المعنى بالدعاء المشروع دون اختراع صيغ أو فضائل غير ثابتة.', source: 'الأدعية المأثورة' },
    ],
  },
  afterlife: {
    ar: 'الجنة والنار والآخرة', en: 'Afterlife',
    introAr: 'قسم مستقل لموضوعات الآخرة كما وردت في القرآن والسنة الصحيحة، مع توضيح درجة الروايات.', introEn: 'A dedicated section for the afterlife based on Quran and authentic Sunnah.',
    cards: [
      { title: 'اليوم الآخر والحساب', description: 'عرض الآيات والأحاديث الصحيحة مع المصدر، دون قصص مرعبة أو تفاصيل بلا دليل.', source: 'القرآن والسنة الصحيحة' },
      { title: 'الجنة والنار', description: 'موضوعات موثقة مع التفريق بين النص الصحيح والرواية الضعيفة.', source: 'كتب العقيدة والتفسير' },
      { title: 'القبر والبرزخ', description: 'يُعرض من النصوص الثابتة فقط مع بيان درجة الحديث عند الحاجة.', source: 'مصادر الحديث' },
    ],
  },
  challenges: {
    ar: 'التحديات والمعلومات الإسلامية', en: 'Islamic Challenges',
    introAr: 'قسم مستقل للمعلومات والمسابقات والتحديات، مع ربط كل إجابة بمصدر وعدم تحويل الدين إلى تخمين.', introEn: 'A dedicated quiz and challenge section with references for answers.',
    cards: [
      { title: 'السؤال اليومي', description: 'سؤال قصير وإجابة موثقة، مع حفظ النتيجة محلياً عند تفعيل المسابقة.' },
      { title: 'اختبارات القرآن والأنبياء', description: 'اختبارات من بيانات موثقة، وستظهر الإجابة مع مصدرها لا بمجرد احتساب النقاط.' },
      { title: 'الإنجازات والتقدم', description: 'نظام نقاط للتعلم والمتابعة، لا يقرر صحة العبادة ولا يقيس صلاح المستخدم.' },
    ],
  },
  'admin-dashboard': {
    ar: 'لوحة تحكم الإدارة', en: 'Administration Dashboard',
    introAr: 'قسم منفصل للإدارة فقط. لن تظهر أدوات التحرير للمستخدم العادي قبل تفعيل مصادقة وصلاحيات Firebase حقيقية.', introEn: 'Admin-only section. Editing tools remain unavailable until real Firebase auth and roles are configured.',
    protected: true,
    cards: [
      { title: 'إدارة المحتوى', description: 'إضافة وتعديل وحذف القصص والأحاديث والمقالات بعد ربط قاعدة البيانات والصلاحيات.' },
      { title: 'رفع الصوتيات والإشعارات', description: 'يحتاج تخزيناً سحابياً وصلاحيات مدير واختباراً قبل نشر أي ملف للمستخدمين.' },
      { title: 'إدارة المستخدمين والأقسام', description: 'لن يتم تفعيلها من الواجهة فقط؛ يلزم Firebase Rules وسجل تدقيق للعمليات.' },
    ],
  },
};

export default function KnowledgeSection({ id, isEn = false }: KnowledgeSectionProps) {
  const content = CONTENT[id];
  const [query, setQuery] = useState('');
  const [openedCard, setOpenedCard] = useState<string | null>(null);
  const visibleCards = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return content.cards;
    return content.cards.filter((card) => `${card.title} ${card.description} ${card.source || ''}`.toLocaleLowerCase().includes(normalized));
  }, [content.cards, query]);
  const openSource = async (url: string) => {
    if (Capacitor.isNativePlatform()) await Browser.open({ url });
    else window.open(url, '_blank', 'noopener,noreferrer');
  };
  return (
    <section data-knowledge-section={id} className="rounded-3xl border border-emerald-500/20 bg-[#061214] p-4 sm:p-6 text-right text-white shadow-xl" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-start gap-3 border-b border-emerald-500/15 pb-4">
        <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300"><BookOpen className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1"><h3 className="text-lg font-black text-emerald-300">{isEn ? content.en : content.ar}</h3><p className="mt-1 text-xs leading-relaxed text-slate-300">{isEn ? content.introEn : content.introAr}</p></div>
        {content.protected ? <LockKeyhole className="h-5 w-5 shrink-0 text-amber-300" /> : <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />}
      </div>
      <div className="mt-4 relative">
        <Search className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 ${isEn ? 'left-3' : 'right-3'}`} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isEn ? 'Search within this section...' : 'ابحث داخل هذا القسم...'}
          aria-label={isEn ? 'Search within section' : 'البحث داخل القسم'}
          className={`w-full rounded-2xl border border-emerald-500/20 bg-[#091b1f] py-2.5 text-xs text-white outline-none transition focus:border-amber-400 ${isEn ? 'pl-9 pr-3 text-left' : 'pr-9 pl-3 text-right'}`}
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCards.length === 0 ? (
          <p className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-emerald-500/20 p-5 text-center text-xs text-slate-400">{isEn ? 'No matching items in this section.' : 'لا توجد عناصر مطابقة داخل هذا القسم.'}</p>
        ) : visibleCards.map((card) => {
          const isOpen = openedCard === card.title;
          return (
            <article key={card.title} className="rounded-2xl border border-emerald-500/15 bg-[#091b1f] p-4 transition hover:border-amber-400/40">
              <button type="button" onClick={() => setOpenedCard(isOpen ? null : card.title)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 text-right">
                <h4 className="text-sm font-black text-amber-300">{card.title}</h4>
                <ChevronDown className={`h-4 w-4 shrink-0 text-emerald-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && <div className="mt-2 border-t border-emerald-500/10 pt-2"><p className="text-xs leading-relaxed text-slate-300">{card.description}</p>{card.source && <p className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-400"><ShieldCheck className="h-3.5 w-3.5" />{isEn ? 'Source:' : 'المصدر:'} {card.source}</p>}{card.url && <button type="button" onClick={() => void openSource(card.url!)} className="mt-3 inline-flex items-center gap-1 rounded-xl border border-emerald-500/25 px-3 py-1.5 text-[10px] font-bold text-emerald-300">{isEn ? 'Open source' : 'فتح المصدر'} <ExternalLink className="h-3.5 w-3.5" /></button>}</div>}
            </article>
          );
        })}
      </div>
      <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3 text-[11px] leading-relaxed text-amber-100">هذا القسم مستقل داخل نور الإسلام. لا تُعرض مادة دينية تفصيلية على أنها مكتملة إلا بعد إدخال مصدرها ومراجعتها؛ التطبيق لا يولّد الآيات أو الأحاديث أو الفتاوى بالذكاء الاصطناعي.</div>
    </section>
  );
}
