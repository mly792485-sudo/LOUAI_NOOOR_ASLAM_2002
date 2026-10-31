import React, { useMemo, useState } from 'react';
import { Award, BookOpen, CheckCircle2, Heart, Moon, Sparkles, Sunrise, Target } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

type Goal = { id: string; ar: string; en: string; icon: React.ReactNode };

const GOALS: Goal[] = [
  { id: 'prayers', ar: 'أديت الصلوات المفروضة', en: 'Completed the obligatory prayers', icon: <Moon className="h-5 w-5" /> },
  { id: 'morning', ar: 'قرأت أذكار الصباح', en: 'Read morning adhkar', icon: <Sunrise className="h-5 w-5" /> },
  { id: 'evening', ar: 'قرأت أذكار المساء', en: 'Read evening adhkar', icon: <Sparkles className="h-5 w-5" /> },
  { id: 'quran', ar: 'قرأت وردًا من القرآن', en: 'Read a Quran portion', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'dhikr', ar: 'أتممت ورد التسبيح', en: 'Completed a dhikr portion', icon: <Heart className="h-5 w-5" /> },
  { id: 'charity', ar: 'قدمت صدقة أو عملًا صالحًا', en: 'Gave charity or did a good deed', icon: <Award className="h-5 w-5" /> },
];

const dayKey = () => new Date().toISOString().slice(0, 10);

export default function DailyWorshipSection({ isEn = false }: { isEn?: boolean }) {
  const storageKey = `noor-daily-worship:${dayKey()}`;
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(safeStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });
  const [note, setNote] = useState(() => safeStorage.getItem(`${storageKey}:note`) || '');
  const progress = Math.round((completed.length / GOALS.length) * 100);

  const toggle = (id: string) => {
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(next);
    safeStorage.setItem(storageKey, JSON.stringify(next));
  };
  const saveNote = (value: string) => { setNote(value); safeStorage.setItem(`${storageKey}:note`, value); };
  const message = useMemo(() => progress === 100 ? (isEn ? 'Excellent — you completed today’s path.' : 'ما شاء الله، أتممت مسار اليوم كاملًا.') : progress >= 50 ? (isEn ? 'Keep going — you are halfway there.' : 'أحسنت، قطعت أكثر من نصف المسار.') : (isEn ? 'Start with one small act and build your day.' : 'ابدأ بعمل واحد يسير، وابنِ يومك خطوة خطوة.'), [isEn, progress]);

  return <section className="w-full rounded-3xl border border-emerald-500/20 bg-white p-4 shadow-xl dark:bg-[#091B1F] sm:p-6" dir={isEn ? 'ltr' : 'rtl'}>
    <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-[#0A2828] to-teal-900 p-5 text-white">
      <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300"><Target className="h-7 w-7" /></div><div><h2 className="font-kufi text-xl font-black">{isEn ? 'Daily Worship Center' : 'مركز العبادات اليومي'}</h2><p className="mt-1 text-xs leading-6 text-emerald-100">{message}</p></div></div><span className="text-2xl font-black text-amber-300">{progress}%</span></div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-l from-amber-300 to-emerald-300 transition-all" style={{ width: `${progress}%` }} /></div>
    </div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{GOALS.map((goal) => { const done = completed.includes(goal.id); return <button key={goal.id} onClick={() => toggle(goal.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-right transition ${done ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200'}`}><span className={`rounded-xl p-2 ${done ? 'bg-emerald-600 text-white' : 'bg-emerald-700/10 text-emerald-700 dark:text-emerald-300'}`}>{done ? <CheckCircle2 className="h-5 w-5" /> : goal.icon}</span><span className="flex-1 text-xs font-bold">{isEn ? goal.en : goal.ar}</span><span className="text-[10px] font-black">{done ? '✓' : '○'}</span></button>; })}</div>
    <label className="mt-4 block text-xs font-bold text-slate-600 dark:text-slate-300">{isEn ? 'A private reflection for today' : 'ملاحظة خاصة لهذا اليوم'}</label>
    <textarea value={note} onChange={(event) => saveNote(event.target.value)} placeholder={isEn ? 'Write a short reflection...' : 'اكتب فائدة أو نية أو ملاحظة قصيرة...'} className="mt-2 min-h-20 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white" />
  </section>;
}
