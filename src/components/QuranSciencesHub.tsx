import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  CircleHelp,
  FileText,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { offlineSurahs } from '../data/quran_text';
import { quranMetadata } from '../data/quran_metadata';
import { safeStorage } from '../utils/safeStorage';

interface QuranSciencesHubProps {
  isEn?: boolean;
  onOpenSurah: (surahNumber: number) => void;
}

type HubTab = 'search' | 'sciences' | 'reflection' | 'memorization' | 'sources';

const SCIENCE_TOPICS = [
  { id: 'revelation', ar: 'نزول القرآن والوحي', en: 'Revelation and Wahi', note: 'عرض تعريفي يحتاج إلى مادة مرجعية موثقة قبل نشره.' },
  { id: 'collection', ar: 'جمع القرآن وكتابته', en: 'Collection and Writing', note: 'يُربط بمراجع علوم القرآن المعتمدة مع توثيق كل فقرة.' },
  { id: 'meccan-medinan', ar: 'المكي والمدني', en: 'Makki and Madani', note: 'تعريف وتصنيف مع بيان مصدر التصنيف عند العرض.' },
  { id: 'reasons', ar: 'أسباب النزول', en: 'Reasons for Revelation', note: 'لا تُعرض رواية إلا مع مصدرها ودرجة ثبوتها.' },
  { id: 'readings', ar: 'القراءات القرآنية', en: 'Quranic Readings', note: 'تحتاج بيانات القراءات وضبطاً متخصصاً قبل تفعيلها.' },
  { id: 'miracles', ar: 'إعجاز القرآن', en: 'Quranic Miracles', note: 'لن تُضاف ادعاءات علمية غير موثقة أو إسقاطات معاصرة.' },
];

const TOPICS = [
  { ar: 'الصبر', en: 'Patience', keywords: ['صبر', 'اصبر'] },
  { ar: 'التوبة والمغفرة', en: 'Repentance and Forgiveness', keywords: ['توب', 'غفر', 'رحم'] },
  { ar: 'الدعاء', en: 'Supplication', keywords: ['ادع', 'دعاء', 'ربنا'] },
  { ar: 'بر الوالدين', en: 'Kindness to Parents', keywords: ['والدين', 'والدي'] },
  { ar: 'الجنة والنار', en: 'Paradise and Hellfire', keywords: ['جنة', 'نار', 'جحيم'] },
  { ar: 'الأنبياء والقصص', en: 'Prophets and Stories', keywords: ['موسى', 'إبراهيم', 'نوح', 'يوسف', 'مريم'] },
];

const TAB_LABELS: Array<{ id: HubTab; ar: string; en: string; icon: React.ReactNode }> = [
  { id: 'search', ar: 'بحث الآيات', en: 'Ayah search', icon: <Search className="w-4 h-4" /> },
  { id: 'sciences', ar: 'علوم القرآن', en: 'Quran sciences', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'reflection', ar: 'التدبر والموضوعات', en: 'Reflection & topics', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'memorization', ar: 'خطة الحفظ', en: 'Memorization', icon: <Target className="w-4 h-4" /> },
  { id: 'sources', ar: 'المصادر', en: 'Sources', icon: <ShieldCheck className="w-4 h-4" /> },
];

function getSurahText(surahNumber: number): Array<{ number: number; text: string }> {
  const record = (offlineSurahs as Record<number, any>)[surahNumber];
  return Array.isArray(record?.ayahs) ? record.ayahs : [];
}

export default function QuranSciencesHub({ isEn = false, onOpenSurah }: QuranSciencesHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>('search');
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [planDays, setPlanDays] = useState(() => Number(safeStorage.getItem('noor_quran_hifz_days') || 365));
  const [completedSurahs, setCompletedSurahs] = useState<number[]>(() => {
    try { return JSON.parse(safeStorage.getItem('noor_quran_hifz_completed') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    safeStorage.setItem('noor_quran_hifz_days', String(planDays));
  }, [planDays]);

  useEffect(() => {
    safeStorage.setItem('noor_quran_hifz_completed', JSON.stringify(completedSurahs));
  }, [completedSurahs]);

  const searchResults = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return [] as Array<{ surahNumber: number; surahName: string; ayahNumber: number; text: string }>;
    const results: Array<{ surahNumber: number; surahName: string; ayahNumber: number; text: string }> = [];
    quranMetadata.forEach((surah) => {
      getSurahText(surah.number).forEach((ayah) => {
        if (ayah.text?.includes(normalized) && results.length < 60) {
          results.push({ surahNumber: surah.number, surahName: surah.name, ayahNumber: ayah.number, text: ayah.text });
        }
      });
    });
    return results;
  }, [query]);

  const topicResults = useMemo(() => {
    const topic = TOPICS.find((item) => item.ar === selectedTopic);
    if (!topic) return [] as Array<{ surahNumber: number; surahName: string; ayahNumber: number; text: string }>;
    const results: Array<{ surahNumber: number; surahName: string; ayahNumber: number; text: string }> = [];
    quranMetadata.forEach((surah) => {
      getSurahText(surah.number).forEach((ayah) => {
        if (topic.keywords.some((keyword) => ayah.text?.includes(keyword)) && results.length < 80) {
          results.push({ surahNumber: surah.number, surahName: surah.name, ayahNumber: ayah.number, text: ayah.text });
        }
      });
    });
    return results;
  }, [selectedTopic]);

  const completedPercent = Math.round((completedSurahs.length / 114) * 100);
  const dailyTarget = Math.max(1, Math.ceil(114 / Math.max(1, planDays)));

  const renderResults = (results: Array<{ surahNumber: number; surahName: string; ayahNumber: number; text: string }>) => (
    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
      {results.length === 0 ? (
        <div className="rounded-2xl border border-emerald-500/15 bg-[#071214] p-5 text-center text-xs text-slate-400">
          {isEn ? 'No local matches found. Search the exact Arabic wording.' : 'لا توجد نتائج محلية. جرّب كلمة عربية من نص الآية.'}
        </div>
      ) : results.map((result) => (
        <button
          type="button"
          key={`${result.surahNumber}:${result.ayahNumber}`}
          onClick={() => onOpenSurah(result.surahNumber)}
          className="w-full rounded-2xl border border-emerald-500/15 bg-[#071214] p-3 text-right hover:border-amber-400/40 transition-colors"
        >
          <div className="flex items-center justify-between gap-2 text-[10px] text-amber-300 font-bold">
            <span>سورة {result.surahName} • الآية {result.ayahNumber}</span>
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <p className="mt-2 font-amiri text-base leading-loose text-slate-100">{result.text}</p>
          <p className="mt-1 text-[10px] text-emerald-400">اضغط لفتح السورة في قارئ القرآن</p>
        </button>
      ))}
    </div>
  );

  return (
    <section className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#0b2528] to-[#061214] p-4 sm:p-5 space-y-4 shadow-xl" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-amber-400/15 p-2.5 text-amber-300"><BookOpen className="w-5 h-5" /></div>
        <div>
          <h4 className="text-sm sm:text-base font-black text-amber-300">{isEn ? 'Quran and Quran Sciences' : 'قسم القرآن الكريم وعلومه الشامل'}</h4>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{isEn ? 'Verified Quran text, local search, topics, study index and memorization plan.' : 'مصحف موثق مع البحث المحلي وفهرس الموضوعات وعلوم القرآن وخطة الحفظ.'}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TAB_LABELS.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition-colors ${activeTab === tab.id ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-emerald-500/20 bg-[#071214] text-emerald-200 hover:border-amber-400/40'}`}>
            {tab.icon}<span>{isEn ? tab.en : tab.ar}</span>
          </button>
        ))}
      </div>

      {activeTab === 'search' && (
        <div className="space-y-3">
          <div className="relative"><Search className="absolute right-3 top-3 h-4 w-4 text-emerald-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث في نص الآيات المحفوظ داخل التطبيق..." className="w-full rounded-2xl border border-emerald-500/25 bg-[#030a0c] py-2.5 pr-10 pl-3 text-xs text-white outline-none focus:border-amber-400" /></div>
          <p className="text-[10px] text-slate-400">البحث هنا في النص القرآني المحلي فقط، ولا ينشئ تفسيراً أو فتوى.</p>
          {renderResults(searchResults)}
        </div>
      )}

      {activeTab === 'sciences' && (
        <div className="grid gap-2 sm:grid-cols-2">
          {SCIENCE_TOPICS.map((topic) => (
            <article key={topic.id} className="rounded-2xl border border-emerald-500/15 bg-[#071214] p-3">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-200"><FileText className="h-4 w-4 text-amber-300" />{isEn ? topic.en : topic.ar}</div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{topic.note}</p>
            </article>
          ))}
          <div className="sm:col-span-2 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3 text-[11px] leading-relaxed text-amber-100">
            لا نعرض مادة تفسيرية أو رواية في هذا الفهرس قبل ربطها بمصدر محدد ومراجعته؛ هذه حماية للمحتوى القرآني من الاختصار أو النقل غير الموثق.
          </div>
        </div>
      )}

      {activeTab === 'reflection' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">{TOPICS.map((topic) => <button key={topic.ar} type="button" onClick={() => setSelectedTopic(topic.ar)} className={`rounded-xl border px-3 py-2 text-[11px] font-bold ${selectedTopic === topic.ar ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-emerald-500/20 bg-[#071214] text-emerald-200'}`}>{isEn ? topic.en : topic.ar}</button>)}</div>
          <p className="text-[10px] text-slate-400">يعرض هذا الفهرس الآيات المطابقة للكلمات المفتاحية فقط؛ لا يقدّم استنباطاً أو تفسيراً آلياً.</p>
          {renderResults(topicResults)}
        </div>
      )}

      {activeTab === 'memorization' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-2xl bg-[#071214] p-3 text-center"><p className="text-lg font-black text-amber-300">{completedSurahs.length}</p><p className="text-[10px] text-slate-400">سورة مكتملة</p></div>
            <div className="rounded-2xl bg-[#071214] p-3 text-center"><p className="text-lg font-black text-emerald-300">{completedPercent}%</p><p className="text-[10px] text-slate-400">التقدم</p></div>
            <div className="rounded-2xl bg-[#071214] p-3 text-center"><p className="text-lg font-black text-sky-300">{dailyTarget}</p><p className="text-[10px] text-slate-400">سور يومياً</p></div>
            <div className="rounded-2xl bg-[#071214] p-3 text-center"><p className="text-lg font-black text-rose-300">{planDays}</p><p className="text-[10px] text-slate-400">يوم الخطة</p></div>
          </div>
          <label className="block text-xs font-bold text-slate-300">مدة الخطة بالأيام<input type="number" min="30" max="2000" value={planDays} onChange={(e) => setPlanDays(Math.max(30, Number(e.target.value) || 365))} className="mt-1 w-full rounded-xl border border-emerald-500/25 bg-[#030a0c] px-3 py-2 text-white" /></label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{quranMetadata.slice(0, 16).map((surah) => { const done = completedSurahs.includes(surah.number); return <button key={surah.number} type="button" onClick={() => setCompletedSurahs((current) => done ? current.filter((n) => n !== surah.number) : [...current, surah.number])} className={`rounded-xl border p-2 text-right text-[11px] font-bold ${done ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200' : 'border-emerald-500/15 bg-[#071214] text-slate-300'}`}><span className="flex items-center justify-between"><span>{surah.number}. {surah.name}</span>{done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}</span></button>; })}</div>
          <p className="text-[10px] text-slate-500">هذه بداية متابعة محلية للسور؛ اختبارات التسميع والتنبيهات تحتاج مرحلة مستقلة وإعدادات إشعارات فعلية.</p>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
          <div className="rounded-2xl border border-emerald-500/15 bg-[#071214] p-3"><strong className="text-emerald-200">النص القرآني:</strong> البيانات المدمجة داخل التطبيق هي النص المحلي المستخدم للقراءة والبحث، ولا يتم توليد الآيات بالذكاء الاصطناعي.</div>
          <div className="rounded-2xl border border-emerald-500/15 bg-[#071214] p-3"><strong className="text-emerald-200">التفسير المتاح حالياً:</strong> مدير التفسير الموجود في التطبيق يدعم السعدي وابن كثير عند توفر ملفهما أو التخزين المؤقت، مع إظهار المصدر.</div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3 text-amber-100"><CircleHelp className="mb-1 inline h-4 w-4" /> لا نعتبر أسباب النزول أو الأحكام أو المقارنات مكتملة حتى تُضاف ملفات موثقة ومراجعة؛ لذلك لا نعرضها كمحتوى جاهز وهمي.</div>
        </div>
      )}
    </section>
  );
}
