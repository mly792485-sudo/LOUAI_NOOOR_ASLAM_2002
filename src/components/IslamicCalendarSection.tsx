import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Moon, Star } from 'lucide-react';

const HIJRI_MONTHS_AR = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const EVENTS: Record<number, string[]> = { 1: ['رأس السنة الهجرية'], 9: ['شهر رمضان المبارك', 'ليلة القدر في العشر الأواخر'], 10: ['عيد الفطر المبارك'], 12: ['يوم عرفة', 'عيد الأضحى المبارك'] };

function getHijri(date: Date) {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(date);
    return { day: Number(parts.find((p) => p.type === 'day')?.value || 1), month: Number(parts.find((p) => p.type === 'month')?.value || 1), year: Number(parts.find((p) => p.type === 'year')?.value || 1446) };
  } catch { return { day: 1, month: 1, year: 1446 }; }
}

export default function IslamicCalendarSection({ isEn = false }: { isEn?: boolean }) {
  const [date, setDate] = useState(new Date());
  const hijri = useMemo(() => getHijri(date), [date]);
  const gregorian = new Intl.DateTimeFormat(isEn ? 'en-US' : 'ar-BH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  const eventList = EVENTS[hijri.month] || [];
  const shift = (amount: number) => setDate((current) => { const next = new Date(current); next.setDate(next.getDate() + amount); return next; });

  return <section className="w-full rounded-3xl border border-amber-500/20 bg-white p-4 shadow-xl dark:bg-[#091B1F] sm:p-6" dir={isEn ? 'ltr' : 'rtl'}>
    <div className="rounded-2xl bg-gradient-to-br from-[#172554] via-[#123B52] to-emerald-900 p-5 text-white"><div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-300/15 p-3 text-amber-300"><CalendarDays className="h-7 w-7" /></div><div><h2 className="font-kufi text-xl font-black">{isEn ? 'Hijri Calendar & Islamic Occasions' : 'التقويم الهجري والمناسبات الإسلامية'}</h2><p className="mt-1 text-xs leading-6 text-sky-100">{isEn ? 'A local calendar that follows your device date and shows the Hijri date.' : 'تقويم محلي يتبع تاريخ جهازك ويعرض التاريخ الهجري والمناسبات العامة.'}</p></div></div></div>
    <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40"><button onClick={() => shift(-1)} className="rounded-xl p-2 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300" aria-label={isEn ? 'Previous day' : 'اليوم السابق'}><ChevronRight className="h-5 w-5" /></button><div className="text-center"><p className="text-sm font-black text-slate-800 dark:text-slate-100">{gregorian}</p><p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-300">{hijri.day} {isEn ? hijri.month : HIJRI_MONTHS_AR[hijri.month - 1]} {hijri.year} هـ</p></div><button onClick={() => shift(1)} className="rounded-xl p-2 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300" aria-label={isEn ? 'Next day' : 'اليوم التالي'}><ChevronLeft className="h-5 w-5" /></button></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-emerald-500/20 bg-emerald-50 p-4 dark:bg-emerald-950/20"><div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200"><Moon className="h-5 w-5" /><strong>{isEn ? 'Hijri month' : 'الشهر الهجري'}</strong></div><p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">{isEn ? `Month ${hijri.month} — ${hijri.day} days passed` : `${HIJRI_MONTHS_AR[hijri.month - 1]} — اليوم ${hijri.day}`}</p></div><div className="rounded-2xl border border-amber-500/20 bg-amber-50 p-4 dark:bg-amber-950/20"><div className="flex items-center gap-2 text-amber-800 dark:text-amber-200"><Star className="h-5 w-5" /><strong>{isEn ? 'Occasions' : 'المناسبات'}</strong></div>{eventList.length ? eventList.map((event) => <p key={event} className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">{event}</p>) : <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{isEn ? 'No fixed occasion recorded for this month.' : 'لا توجد مناسبة ثابتة مسجلة لهذا الشهر.'}</p>}</div></div>
    <p className="mt-4 text-[11px] leading-6 text-slate-500 dark:text-slate-400">{isEn ? 'The Hijri date can differ by one day from local moon-sighting announcements. For Ramadan and the two Eids, follow your country’s official announcement.' : 'قد يختلف التاريخ الهجري يومًا عن إعلان الرؤية المحلي. في رمضان والعيدين يُرجى اتباع إعلان الجهة الرسمية في بلدك.'}</p>
  </section>;
}
