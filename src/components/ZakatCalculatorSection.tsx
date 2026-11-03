import React, { useMemo, useState } from 'react';
import { Calculator, Info, RotateCcw } from 'lucide-react';

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

export default function ZakatCalculatorSection({ isEn = false }: { isEn?: boolean }) {
  const [cash, setCash] = useState('');
  const [gold, setGold] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [debts, setDebts] = useState('');
  const [nisabMode, setNisabMode] = useState<'gold' | 'silver'>('gold');
  const [nisabPrice, setNisabPrice] = useState('');

  const values = [cash, gold, goldPrice, debts, nisabPrice].map((value) => Number(value) || 0);
  const [cashValue, goldWeight, goldGramPrice, debtsValue, nisabGramPrice] = values;
  const goldValue = goldWeight * goldGramPrice;
  const netWealth = Math.max(0, cashValue + goldValue - debtsValue);
  const nisab = (nisabMode === 'gold' ? GOLD_NISAB_GRAMS : SILVER_NISAB_GRAMS) * nisabGramPrice;
  const eligible = nisab > 0 && netWealth >= nisab;
  const zakat = eligible ? netWealth * 0.025 : 0;
  const currency = isEn ? 'your currency' : 'من عملتك';
  const formatted = useMemo(() => new Intl.NumberFormat(isEn ? 'en-US' : 'ar-BH', { maximumFractionDigits: 2 }).format(zakat), [isEn, zakat]);
  const clear = () => { setCash(''); setGold(''); setGoldPrice(''); setDebts(''); setNisabPrice(''); };

  const field = (label: string, value: string, setter: (value: string) => void, hint: string) => <label className="block"><span className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">{label}</span><input inputMode="decimal" value={value} onChange={(event) => setter(event.target.value)} placeholder={hint} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white" /></label>;

  return <section className="w-full rounded-3xl border border-emerald-500/20 bg-white p-4 shadow-xl dark:bg-[#091B1F] sm:p-6" dir={isEn ? 'ltr' : 'rtl'}>
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-800 p-5 text-white"><div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-300/15 p-3 text-amber-300"><Calculator className="h-7 w-7" /></div><div><h2 className="font-kufi text-xl font-black">{isEn ? 'Zakat Calculator' : 'حاسبة الزكاة'}</h2><p className="mt-1 text-xs leading-6 text-emerald-100">{isEn ? 'Estimate 2.5% zakat on eligible net wealth.' : 'احسب تقديريًا نسبة ٢٫٥٪ من المال الزكوي بعد خصم الديون المستحقة.'}</p></div></div><button onClick={clear} className="rounded-xl p-2 text-emerald-100 hover:bg-white/10" title={isEn ? 'Clear' : 'مسح'}><RotateCcw className="h-4 w-4" /></button></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{field(isEn ? 'Cash and savings' : 'النقد والمدخرات', cash, setCash, '0')}{field(isEn ? 'Gold weight in grams' : 'وزن الذهب بالجرام', gold, setGold, '0')}{field(isEn ? 'Gold price per gram' : 'سعر جرام الذهب', goldPrice, setGoldPrice, '0')}{field(isEn ? 'Due debts' : 'الديون المستحقة', debts, setDebts, '0')}</div>
    <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">{isEn ? 'Nisab basis' : 'أساس النصاب'}</span><select value={nisabMode} onChange={(event) => setNisabMode(event.target.value as 'gold' | 'silver')} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="gold">{isEn ? 'Gold — 85g' : 'الذهب — ٨٥ جرامًا'}</option><option value="silver">{isEn ? 'Silver — 595g' : 'الفضة — ٥٩٥ جرامًا'}</option></select></label>{field(isEn ? 'Price per gram for nisab' : 'سعر الجرام لحساب النصاب', nisabPrice, setNisabPrice, '0')}</div>
    <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-50 p-5 text-center dark:bg-amber-950/20"><p className="text-xs font-bold text-amber-900 dark:text-amber-200">{eligible ? (isEn ? 'Estimated zakat due' : 'الزكاة التقديرية المستحقة') : (isEn ? 'Enter current nisab price and values' : 'أدخل سعر النصاب والقيم الحالية')}</p><p className="mt-2 text-3xl font-black text-emerald-800 dark:text-emerald-200">{formatted} <span className="text-sm">{currency}</span></p><p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{isEn ? `Net wealth: ${netWealth.toFixed(2)} • Nisab: ${nisab.toFixed(2)}` : `صافي المال: ${netWealth.toFixed(2)} • النصاب: ${nisab.toFixed(2)}`}</p></div>
    <div className="mt-4 flex gap-2 rounded-2xl bg-sky-50 p-3 text-xs leading-6 text-sky-900 dark:bg-sky-950/20 dark:text-sky-200"><Info className="mt-1 h-4 w-4 shrink-0" /><p>{isEn ? 'This is an educational estimate. Zakat rules differ by asset, debt, ownership and hawl; consult a qualified scholar for your situation.' : 'هذه حاسبة تعليمية تقديرية. قد تختلف أحكام الزكاة بحسب نوع المال والديون والملكية وحولان الحول؛ استشر عالمًا موثوقًا لحالتك.'}</p></div>
  </section>;
}
