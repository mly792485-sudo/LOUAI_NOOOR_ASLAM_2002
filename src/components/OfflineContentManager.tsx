import { useEffect, useState } from 'react';
import { Download, HardDrive, Loader2, Trash2, WifiOff } from 'lucide-react';
import {
  downloadTafsir,
  getTafsirStatus,
  removeDownloadedTafsir,
  TAFSIR_SOURCES,
  type TafsirDownloadStatus,
  type TafsirSourceId,
} from '../services/tafsirOfflineManager';

interface Props { isEn: boolean; }

const INITIAL: Record<TafsirSourceId, TafsirDownloadStatus> = {
  saadi: { source: 'saadi', completed: 0, total: 114, downloaded: false },
  'ibn-kathir': { source: 'ibn-kathir', completed: 0, total: 114, downloaded: false },
};

export default function OfflineContentManager({ isEn }: Props) {
  const [status, setStatus] = useState(INITIAL);
  const [active, setActive] = useState<TafsirSourceId | 'all' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void Promise.all((Object.keys(TAFSIR_SOURCES) as TafsirSourceId[]).map(async (source) => {
      const next = await getTafsirStatus(source);
      setStatus((previous) => ({ ...previous, [source]: next }));
    }));
  }, []);

  const download = async (source: TafsirSourceId, keepActive = false) => {
    if (!keepActive) setActive(source);
    setMessage('');
    try {
      await downloadTafsir(source, (next) => setStatus((previous) => ({ ...previous, [source]: next })));
      setMessage(isEn ? `${TAFSIR_SOURCES[source].label} is ready offline.` : `تم تنزيل ${TAFSIR_SOURCES[source].label} للعمل دون إنترنت.`);
    } catch {
      setMessage(isEn ? 'Download stopped. Check your connection and try again.' : 'توقف التنزيل. تحقق من الاتصال وحاول مرة أخرى؛ سيُستكمل من آخر سورة محفوظة.');
    } finally {
      if (!keepActive) setActive(null);
    }
  };

  const downloadAll = async () => {
    setActive('all');
    setMessage('');
    try {
      await download('saadi', true);
      await download('ibn-kathir', true);
    } finally {
      setActive(null);
    }
  };

  const remove = async (source: TafsirSourceId) => {
    await removeDownloadedTafsir(source);
    setStatus((previous) => ({ ...previous, [source]: INITIAL[source] }));
    setMessage(isEn ? 'Downloaded content deleted.' : 'تم حذف التفسير المحفوظ من الجهاز.');
  };

  return (
    <section className="space-y-3 rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-900/10 via-amber-500/5 to-teal-900/10 p-4 dark:from-emerald-950/50 dark:to-slate-950/50" aria-labelledby="offline-content-title">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-emerald-600 p-2.5 text-white"><HardDrive className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <h5 id="offline-content-title" className="font-kufi text-sm font-black text-emerald-900 dark:text-emerald-200">{isEn ? 'Offline content management' : 'إدارة المحتوى دون إنترنت'}</h5>
          <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-400">{isEn ? 'Download verified tafsir while connected. It is then read locally without inventing content.' : 'نزّل التفسير الموثق عند توفر الإنترنت، ثم اقرأه محلياً دون اختلاق أي نص.'}</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(TAFSIR_SOURCES) as TafsirSourceId[]).map((source) => {
          const item = status[source];
          const percent = Math.round((item.completed / item.total) * 100);
          return (
            <div key={source} className="rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-slate-800 dark:text-slate-200">{TAFSIR_SOURCES[source].label}</span><span className="text-[10px] text-emerald-700 dark:text-emerald-300">{item.completed}/{item.total}</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} /></div>
              <div className="mt-2 flex gap-2">
                <button type="button" disabled={active !== null} onClick={() => void download(source)} className="flex min-h-9 flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-2 text-[11px] font-bold text-white disabled:opacity-50">{active === source ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}{item.downloaded ? (isEn ? 'Update' : 'تحديث') : (isEn ? 'Download' : 'تنزيل')}</button>
                <button type="button" disabled={active !== null || item.completed === 0} onClick={() => void remove(source)} className="rounded-xl border border-rose-300/30 px-2.5 text-rose-700 dark:text-rose-300 disabled:opacity-40" aria-label={isEn ? 'Delete download' : 'حذف التنزيل'}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" disabled={active !== null} onClick={() => void downloadAll()} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/15 px-4 py-2.5 text-xs font-black text-amber-800 dark:text-amber-200 disabled:opacity-50"><WifiOff className="h-4 w-4" />{active === 'all' ? (isEn ? 'Downloading both tafsir books…' : 'جارٍ تنزيل التفسيرين…') : (isEn ? 'Download both books automatically' : 'تنزيل التفسيرين تلقائياً')}</button>
      {message && <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[11px] leading-5 text-emerald-800 dark:text-emerald-200" role="status">{message}</p>}
    </section>
  );
}
