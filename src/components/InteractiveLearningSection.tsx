import React, { useMemo, useState } from 'react';
import { Award, BookOpenCheck, CheckCircle2, HelpCircle, Lightbulb, Lock, Medal, RotateCcw, Star, Target, Trophy } from 'lucide-react';
import { hadithsData } from '../data/hadith';
import { safeStorage } from '../utils/safeStorage';
import { localDateKey } from '../utils/localDateKey';

interface Props { isEn?: boolean; mode?: 'daily' | 'challenges'; }
type QuizQuestion = { id: string; category: string; question: string; options: string[]; answer: number; explanation: string; source: string };

const DAILY_VERSES = [
  { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', reference: 'سورة الشرح، الآية ٦' },
  { text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', reference: 'سورة الرعد، الآية ٢٨' },
  { text: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', reference: 'سورة البقرة، الآية ٤٥' },
  { text: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', reference: 'سورة البقرة، الآية ١٥٣' },
  { text: 'وَقُلْ رَبِّ زِدْنِي عِلْمًا', reference: 'سورة طه، الآية ١١٤' },
];

const QUESTIONS: QuizQuestion[] = [
  { id: 'quran-surahs', category: 'القرآن', question: 'كم عدد سور القرآن الكريم؟', options: ['١١٠', '١١٤', '١٢٠', '١٢٤'], answer: 1, explanation: 'عدد سور القرآن الكريم أربع عشرة ومائة سورة.', source: 'فهرس المصحف المحلي المدقق' },
  { id: 'pillars', category: 'الحديث', question: 'كم بُني الإسلام عليه كما في حديث ابن عمر رضي الله عنهما؟', options: ['ثلاثة', 'أربعة', 'خمسة', 'ستة'], answer: 2, explanation: 'ورد في الحديث: بُني الإسلام على خمس.', source: 'صحيح البخاري، كتاب الإيمان' },
  { id: 'intentions', category: 'الحديث', question: 'من راوي حديث «إنما الأعمال بالنيات» في البيانات المحلية؟', options: ['عمر بن الخطاب', 'أبو هريرة', 'ابن عباس', 'أنس بن مالك'], answer: 0, explanation: 'الراوي المذكور في المصدر المحلي هو عمر بن الخطاب رضي الله عنه.', source: 'صحيح البخاري، كتاب بدء الوحي' },
  { id: 'fatiha', category: 'القرآن', question: 'كم عدد آيات سورة الفاتحة؟', options: ['٥', '٦', '٧', '٨'], answer: 2, explanation: 'سورة الفاتحة سبع آيات.', source: 'فهرس المصحف المحلي' },
  { id: 'good-speech', category: 'الحديث', question: 'ماذا أرشد حديث أبي هريرة إلى فعله عند الإيمان بالله واليوم الآخر؟', options: ['قول الخير أو الصمت', 'ترك الصلاة', 'كثرة النوم', 'ترك طلب العلم'], answer: 0, explanation: 'من نص الحديث: فليقل خيرًا أو ليصمت.', source: 'صحيح البخاري، كتاب الأدب' },
  { id: 'knowledge', category: 'الحديث', question: 'ما جزاء من سلك طريقًا يلتمس فيه علمًا؟', options: ['يُسهّل الله له طريقًا إلى الجنة', 'يُعفى من العمل', 'يُعطى مالًا', 'لا شيء'], answer: 0, explanation: 'هذا هو معنى الحديث الوارد في صحيح مسلم ضمن البيانات المحلية.', source: 'صحيح مسلم، كتاب الذكر والدعاء والتوبة والاستغفار' },
  { id: 'seerah', category: 'السيرة', question: 'إلى أي مدينة كانت الهجرة النبوية؟', options: ['الطائف', 'المدينة المنورة', 'بيت المقدس', 'اليمن'], answer: 1, explanation: 'كانت الهجرة من مكة إلى المدينة المنورة.', source: 'السيرة النبوية الموثقة' },
  { id: 'wudu', category: 'الفقه', question: 'ما العبادة التي يسبقها الوضوء غالبًا؟', options: ['الصلاة', 'البيع', 'النوم', 'السفر'], answer: 0, explanation: 'الوضوء طهارة مشروعة للصلاة، وتفاصيل الأحكام تُراجع في كتب الفقه المعتمدة.', source: 'آية الوضوء: سورة المائدة، الآية ٦' },
];

const dayNumber = () => Number(localDateKey().replaceAll('-', ''));
const dailyIndex = (length: number) => dayNumber() % length;

export default function InteractiveLearningSection({ isEn = false, mode = 'daily' }: Props) {
  const dailyHadith = hadithsData[dailyIndex(hadithsData.length)];
  const dailyVerse = DAILY_VERSES[dailyIndex(DAILY_VERSES.length)];
  const dailyQuestion = QUESTIONS[dailyIndex(QUESTIONS.length)];
  const dailyStory = [
    { title: 'أصحاب الكهف', text: 'قصة فتية آمنوا بربهم وزادهم الله هدى، كما أخبر القرآن الكريم.', source: 'سورة الكهف، الآيات ٩–٢٦' },
    { title: 'موسى عليه السلام', text: 'من قصص القرآن في مواجهة الظلم والثبات على الحق، مع العبرة من آيات القصة.', source: 'القرآن الكريم، مواضع متعددة' },
    { title: 'يوسف عليه السلام', text: 'قصة قرآنية في الصبر والعفة والعفو وحسن العاقبة، وتُقرأ من مواضعها في سورة يوسف.', source: 'سورة يوسف' },
  ][dailyIndex(3)];
  const dailyBenefit = ['اجعل لك وردًا ثابتًا ولو كان قليلًا، فالمداومة تعين على الاستمرار.', 'راجع نيتك قبل العمل، واطلب العلم من مصادره الموثوقة.', 'اجمع بين قراءة النص وفهم معناه وتطبيق ما تعلمته في يومك.'][dailyIndex(3)];

  const progressKey = `noor_learning_progress:${localDateKey()}`;
  const [dailyDone, setDailyDone] = useState<string[]>(() => { try { return JSON.parse(safeStorage.getItem(progressKey) || '[]'); } catch { return []; } });
  const [points, setPoints] = useState(() => Number(safeStorage.getItem('noor_quiz_points') || 0));
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [challengeDone, setChallengeDone] = useState<string[]>(() => { try { return JSON.parse(safeStorage.getItem('noor_challenges_done') || '[]'); } catch { return []; } });
  const [favorite, setFavorite] = useState(() => safeStorage.getItem(`noor_daily_favorite:${localDateKey()}`) === 'true');

  const markDaily = (id: string) => setDailyDone((current) => { const adding = !current.includes(id); const next = adding ? [...current, id] : current.filter((x) => x !== id); safeStorage.setItem(progressKey, JSON.stringify(next)); const nextPoints = Math.max(0, points + (adding ? 5 : -5)); setPoints(nextPoints); safeStorage.setItem('noor_quiz_points', String(nextPoints)); return next; });
  const toggleChallenge = (id: string) => setChallengeDone((current) => { const adding = !current.includes(id); const challenge = challenges.find((item) => item.id === id); const next = adding ? [...current, id] : current.filter((x) => x !== id); safeStorage.setItem('noor_challenges_done', JSON.stringify(next)); const nextPoints = Math.max(0, points + (adding ? (challenge?.points || 0) : -(challenge?.points || 0))); setPoints(nextPoints); safeStorage.setItem('noor_quiz_points', String(nextPoints)); return next; });
  const chooseAnswer = (index: number) => { if (selected !== null) return; setSelected(index); setAnswers((current) => [...current, index]); };
  const nextQuestion = () => { if (selected === QUESTIONS[quizIndex].answer) { const nextPoints = points + 10; setPoints(nextPoints); safeStorage.setItem('noor_quiz_points', String(nextPoints)); } if (quizIndex === QUESTIONS.length - 1) setFinished(true); else { setQuizIndex((value) => value + 1); setSelected(null); } };
  const resetQuiz = () => { setQuizIndex(0); setSelected(null); setAnswers([]); setFinished(false); };
  const score = useMemo(() => answers.reduce((sum, answer, index) => sum + (answer === QUESTIONS[index].answer ? 1 : 0), 0), [answers]);

  const dailyItems = [
    { id: 'verse', icon: <BookOpenCheck />, title: 'آية اليوم', body: `«${dailyVerse.text}»`, meta: dailyVerse.reference },
    { id: 'hadith', icon: <Medal />, title: 'حديث اليوم', body: dailyHadith.text, meta: `${dailyHadith.source} • ${dailyHadith.narrator}` },
    { id: 'story', icon: <BookOpenCheck />, title: 'قصة اليوم', body: dailyStory.text, meta: `${dailyStory.title} • ${dailyStory.source}` },
    { id: 'benefit', icon: <Lightbulb />, title: 'فائدة اليوم', body: dailyBenefit, meta: 'فائدة تربوية عامة وليست فتوى' },
  ];
  const challenges = [
    { id: 'quran', title: 'قراءة ورد من القرآن', points: 10 },
    { id: 'adhkar', title: 'قراءة أذكار الصباح أو المساء', points: 10 },
    { id: 'hadith', title: 'قراءة حديث مع مصدره', points: 10 },
    { id: 'review', title: 'مراجعة إجابة من الاختبار', points: 5 },
  ];

  return <section className="space-y-4 rounded-3xl border border-emerald-500/20 bg-white p-4 shadow-xl dark:bg-[#091B1F] sm:p-6" dir={isEn ? 'ltr' : 'rtl'}>
    <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-[#0A2828] to-teal-900 p-5 text-white">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-amber-300">{mode === 'daily' ? 'خدمات يومية محلية' : 'تعلم تفاعلي دون إنترنت'}</p><h2 className="mt-1 text-xl font-black">{mode === 'daily' ? 'مركز نور اليومي' : 'المسابقات والتحديات'}</h2><p className="mt-2 text-xs leading-6 text-emerald-100">المحتوى محفوظ داخل التطبيق، والنتائج والنقاط تُحفظ على جهازك دون اتصال.</p></div><Trophy className="h-9 w-9 text-amber-300" /></div>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black"><span className="rounded-xl bg-white/10 px-3 py-2"><Star className="mr-1 inline h-3.5 w-3.5 text-amber-300" />{points} نقطة</span><span className="rounded-xl bg-white/10 px-3 py-2"><Target className="mr-1 inline h-3.5 w-3.5 text-emerald-300" />{dailyDone.length}/4 يوميًا</span></div>
    </div>

    {mode === 'daily' ? <>
      <div className="grid gap-3 sm:grid-cols-2">{dailyItems.map((item) => <article key={item.id} className="rounded-2xl border border-emerald-500/15 bg-slate-50 p-4 dark:bg-slate-950/40"><div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-black text-emerald-800 dark:text-emerald-300">{item.icon}{item.title}</h3><button type="button" onClick={() => { setFavorite(!favorite); safeStorage.setItem(`noor_daily_favorite:${localDateKey()}`, String(!favorite)); }} className={`text-xs ${favorite ? 'text-rose-500' : 'text-slate-400'}`} aria-label="حفظ في المفضلة">♥</button></div><p className="mt-3 text-sm font-bold leading-8 text-slate-700 dark:text-slate-200">{item.body}</p><p className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{item.meta}</p><button type="button" onClick={() => markDaily(item.id)} className={`mt-3 flex items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-black ${dailyDone.includes(item.id) ? 'bg-emerald-600 text-white' : 'border border-emerald-500/20 text-emerald-700 dark:text-emerald-300'}`}>{dailyDone.includes(item.id) ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}{dailyDone.includes(item.id) ? 'تم الإنجاز' : 'تحديد كمقروء'}</button></article>)}</div>
      <div className="rounded-2xl border border-amber-400/20 bg-amber-50 p-4 dark:bg-amber-950/20"><p className="text-xs font-black text-amber-800 dark:text-amber-200">السؤال الإسلامي اليومي</p><p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">{dailyQuestion.question}</p><details className="mt-2 text-xs text-slate-600 dark:text-slate-300"><summary className="cursor-pointer font-black text-amber-700">إظهار الإجابة والتوضيح</summary><p className="mt-2 leading-6">الإجابة: {dailyQuestion.options[dailyQuestion.answer]} — {dailyQuestion.explanation}</p><p className="mt-1 font-bold text-emerald-700 dark:text-emerald-300">{dailyQuestion.source}</p></details></div>
    </> : <>
      <div className="rounded-2xl border border-emerald-500/15 bg-slate-50 p-4 dark:bg-slate-950/40">
        <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-black text-emerald-800 dark:text-emerald-300"><HelpCircle className="h-5 w-5" />اختبار محلي موثق</h3><span className="text-[10px] font-black text-slate-500">{Math.min(quizIndex + 1, QUESTIONS.length)}/{QUESTIONS.length}</span></div>
        {finished ? <div className="py-6 text-center"><Trophy className="mx-auto h-10 w-10 text-amber-500" /><p className="mt-2 text-lg font-black">نتيجتك {score} من {QUESTIONS.length}</p><p className="mt-1 text-xs text-slate-500">النقاط تُحفظ محليًا ولا تمثل حكمًا على صلاح المستخدم.</p><button type="button" onClick={resetQuiz} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black text-white"><RotateCcw className="h-4 w-4" />إعادة الاختبار</button></div> : <>
          <p className="mt-4 text-base font-black leading-8">{QUESTIONS[quizIndex].question}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{QUESTIONS[quizIndex].options.map((option, index) => <button key={option} type="button" onClick={() => chooseAnswer(index)} className={`rounded-xl border p-3 text-right text-xs font-bold ${selected === null ? 'border-slate-200 dark:border-slate-800' : index === QUESTIONS[quizIndex].answer ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : selected === index ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-200 opacity-60'}`}>{option}</button>)}</div>
          {selected !== null && <div className="mt-3 rounded-xl bg-white p-3 text-xs leading-6 dark:bg-slate-900"><p className="font-black">{selected === QUESTIONS[quizIndex].answer ? 'إجابة صحيحة' : `الإجابة الصحيحة: ${QUESTIONS[quizIndex].options[QUESTIONS[quizIndex].answer]}`}</p><p>{QUESTIONS[quizIndex].explanation}</p><p className="font-bold text-emerald-700 dark:text-emerald-300">المصدر: {QUESTIONS[quizIndex].source}</p><button type="button" onClick={nextQuestion} className="mt-2 rounded-xl bg-emerald-700 px-4 py-2 text-[11px] font-black text-white">{quizIndex === QUESTIONS.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'}</button></div>}
        </>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">{challenges.map((challenge) => <button key={challenge.id} type="button" onClick={() => toggleChallenge(challenge.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-right ${challengeDone.includes(challenge.id) ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-800'}`}><span className="rounded-xl bg-emerald-700/10 p-2 text-emerald-700 dark:text-emerald-300">{challengeDone.includes(challenge.id) ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-5 w-5" />}</span><span className="flex-1 text-xs font-black">{challenge.title}</span><span className="text-[10px] font-black text-amber-600">+{challenge.points}</span></button>)}</div>
    </>}
  </section>;
}
