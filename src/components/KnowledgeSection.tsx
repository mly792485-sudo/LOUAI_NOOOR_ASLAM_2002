import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, LockKeyhole, Search, ShieldCheck, Star } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';
import { PROPHET_STORIES } from '../data/prophets_stories';
import { SEERAH_ENTRIES } from '../data/seerah';
import { COMPANIONS_ENTRIES } from '../data/companions';
import { ALLAH_NAMES_ENTRIES, AFTERLIFE_ENTRIES, FIQH_ENTRIES, ISLAMIC_STORIES } from '../data/knowledge_expanded';

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

type Card = { title: string; description: string; source?: string };

const CONTENT: Record<KnowledgeSectionId, { ar: string; en: string; introAr: string; introEn: string; cards: Card[]; protected?: boolean }> = {
  prophets: {
    ar: 'قصص الأنبياء والرسل', en: 'Prophets and Messengers',
    introAr: 'فهرس محلي للأنبياء والرسل المذكورين بأسمائهم في القرآن الكريم، مع مواضع القصة والدروس والمراجع الإسلامية داخل التطبيق.', introEn: 'An offline index of the prophets named in the Quran, with Quran references, lessons and Islamic references inside the app.',
    cards: PROPHET_STORIES,
  },
  seerah: {
    ar: 'السيرة النبوية', en: 'Prophetic Seerah',
    introAr: 'خط زمني داخلي واسع للسيرة من النشأة والبعثة إلى الهجرة والغزوات وحجة الوداع والوفاة، مع أبواب للأسرة والأخلاق والمراجع.', introEn: 'An offline timeline from early life and revelation through migration, expeditions, the Farewell Pilgrimage, passing, family and character.',
    cards: SEERAH_ENTRIES,
  },
  companions: {
    ar: 'الصحابة والتابعون', en: 'Companions and Followers',
    introAr: 'فهرس محلي موسع للصحابة والصحابيات والتابعين، مع تصنيف الاسم والمكانة العامة والمصدر. لا تُعرض الروايات المختلف فيها كحقائق قطعية.', introEn: 'An expanded offline index of Companions and Followers with source attribution and careful handling of disputed reports.',
    cards: COMPANIONS_ENTRIES,
  },
  'islamic-stories': {
    ar: 'قصص إسلامية متنوعة', en: 'Islamic Stories',
    introAr: 'قصص القرآن والابتلاء والتوبة والأمم السابقة، مع ربط كل قصة بموضعها وبيان ما يثبت وما لا يثبت.', introEn: 'Quranic stories, repentance, trials and earlier nations with source-aware presentation.',
    cards: ISLAMIC_STORIES,
  },
  fiqh: {
    ar: 'العبادات والفقه', en: 'Worship and Fiqh',
    introAr: 'موسوعة تعليمية لأبواب الطهارة والصلاة والصيام والزكاة والحج والمعاملات، مع بيان الخلاف وعدم تقديم فتوى شخصية.', introEn: 'Offline learning topics for purification, prayer, fasting, zakat, hajj and transactions, without personal fatwas.',
    cards: FIQH_ENTRIES,
  },
  'names-of-allah': {
    ar: 'أسماء الله الحسنى', en: 'Names of Allah',
    introAr: 'معانٍ مختصرة لأسماء وردت أدلتها، مع التنبيه أن حصر الأسماء يحتاج تحريرًا علميًا ولا يصح اعتماد قوائم غير موثقة.', introEn: 'Short sourced meanings for names established by revelation, with a clear methodology note.',
    cards: ALLAH_NAMES_ENTRIES,
  },
  afterlife: {
    ar: 'الجنة والنار والآخرة', en: 'Afterlife',
    introAr: 'أبواب اليوم الآخر من الموت والبرزخ والبعث والحساب إلى الجنة والنار، بالنصوص الثابتة دون قصص مرعبة أو إضافات.', introEn: 'Sourced topics from barzakh and resurrection to judgment, Paradise and Hell.',
    cards: AFTERLIFE_ENTRIES,
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
  const storageKey = `noor_knowledge_${id}`;
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(safeStorage.getItem(`${storageKey}_favorites`) || '[]'); } catch { return []; }
  });
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(safeStorage.getItem(`${storageKey}_completed`) || '[]'); } catch { return []; }
  });
  const visibleCards = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return content.cards;
    return content.cards.filter((card) => `${card.title} ${card.description} ${card.source || ''}`.toLocaleLowerCase().includes(normalized));
  }, [content.cards, query]);
  const toggleFavorite = (title: string) => {
    setFavorites((current) => {
      const next = current.includes(title) ? current.filter((item) => item !== title) : [...current, title];
      safeStorage.setItem(`${storageKey}_favorites`, JSON.stringify(next));
      return next;
    });
  };
  const toggleCompleted = (title: string) => {
    setCompleted((current) => {
      const next = current.includes(title) ? current.filter((item) => item !== title) : [...current, title];
      safeStorage.setItem(`${storageKey}_completed`, JSON.stringify(next));
      return next;
    });
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
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-400">
        <span>{isEn ? `${favorites.length} saved offline` : `${favorites.length} محفوظة دون إنترنت`}</span>
        <span>{isEn ? `${completed.length}/${content.cards.length} completed` : `${completed.length}/${content.cards.length} تمت مراجعتها`}</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              {isOpen && <div className="mt-2 border-t border-emerald-500/10 pt-2"><p className="text-xs leading-relaxed text-slate-300">{card.description}</p>{card.source && <p className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-400"><ShieldCheck className="h-3.5 w-3.5" />{isEn ? 'Verified reference:' : 'المرجع الموثق:'} {card.source}</p>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => toggleFavorite(card.title)} className="inline-flex items-center gap-1 rounded-xl border border-amber-400/25 px-3 py-1.5 text-[10px] font-bold text-amber-200"><Star className={`h-3.5 w-3.5 ${favorites.includes(card.title) ? 'fill-current' : ''}`} />{favorites.includes(card.title) ? (isEn ? 'Saved offline' : 'محفوظة') : (isEn ? 'Save offline' : 'حفظ دون إنترنت')}</button><button type="button" onClick={() => toggleCompleted(card.title)} className="inline-flex items-center gap-1 rounded-xl border border-emerald-400/25 px-3 py-1.5 text-[10px] font-bold text-emerald-200"><CheckCircle2 className={`h-3.5 w-3.5 ${completed.includes(card.title) ? 'fill-current text-emerald-400' : ''}`} />{completed.includes(card.title) ? (isEn ? 'Completed' : 'تمت المراجعة') : (isEn ? 'Mark reviewed' : 'تحديد كمراجعة')}</button></div></div>}
            </article>
          );
        })}
      </div>
      <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3 text-[11px] leading-relaxed text-amber-100">هذا القسم مستقل داخل نور الإسلام. لا تُعرض مادة دينية تفصيلية على أنها مكتملة إلا بعد إدخال مصدرها ومراجعتها؛ التطبيق لا يولّد الآيات أو الأحاديث أو الفتاوى بالذكاء الاصطناعي.</div>
    </section>
  );
}
