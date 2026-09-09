import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { quranMetadata } from '../data/quran_metadata';

type MushafMetadata = {
  juz_number?: number;
  hizb_number?: number;
  chapter_id?: number;
};

interface MushafPageReaderProps {
  isEn?: boolean;
  onClose: () => void;
}

const PAGE_COUNT = 604;
// These are complete Madinah Mushaf page images generated from the King Fahd
// Quran Printing Complex Uthmanic source; no AI or retyped Quran text is used.
const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master';
const METADATA_BASE = 'https://api.quran.com/api/v4/verses/by_page';

export default function MushafPageReader({ isEn = false, onClose }: MushafPageReaderProps) {
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState<MushafMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);
  const imageUrl = `${IMAGE_BASE}/${String(page).padStart(3, '0')}.png`;
  const surahNumber = metadata?.chapter_id;
  const surah = surahNumber ? quranMetadata.find((item) => item.number === surahNumber) : null;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setImageError(false);
    setZoom(1);
    fetch(`${METADATA_BASE}/${page}?language=ar&words=false&fields=text_uthmani`)
      .then((response) => response.ok ? response.json() as Promise<{ verses?: MushafMetadata[] }> : Promise.reject(new Error('metadata request failed')))
      .then((data) => {
        if (!cancelled) setMetadata(data.verses?.[0] || null);
      })
      .catch(() => {
        if (!cancelled) setMetadata(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page]);

  const go = (nextPage: number) => setPage(Math.max(1, Math.min(PAGE_COUNT, nextPage)));
  const distance = (a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  return (
    <section
      className="fixed inset-0 z-[1200] bg-[#e8dfcc] dark:bg-[#101817] flex flex-col"
      dir="rtl"
      onTouchStart={(event) => {
        if (event.touches.length === 2) {
          pinchStartDistance.current = distance(event.touches[0], event.touches[1]);
          pinchStartZoom.current = zoom;
          touchStartX.current = null;
        } else {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
        }
      }}
      onTouchMove={(event) => {
        if (event.touches.length === 2 && pinchStartDistance.current) {
          const next = pinchStartZoom.current * (distance(event.touches[0], event.touches[1]) / pinchStartDistance.current);
          setZoom(Math.max(1, Math.min(2.5, next)));
        }
      }}
      onTouchEnd={(event) => {
        if (pinchStartDistance.current) {
          pinchStartDistance.current = null;
          return;
        }
        if (touchStartX.current == null) return;
        const delta = event.changedTouches[0]?.clientX - touchStartX.current;
        if (Math.abs(delta) > 55) go(page + (delta < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      <header className="shrink-0 flex items-center justify-between gap-2 px-3 pt-[max(10px,env(safe-area-inset-top))] pb-2 bg-emerald-950 text-white shadow-lg">
        <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white/10" aria-label={isEn ? 'Close Mushaf' : 'إغلاق المصحف'}><X className="w-5 h-5" /></button>
        <div className="text-center min-w-0"><h2 className="font-black text-amber-300 text-sm sm:text-base truncate">{isEn ? 'Mushaf — Full Page' : 'المصحف الشريف'}</h2><p className="text-[10px] text-emerald-200 truncate">{surah ? `${isEn ? 'Surah' : 'سورة'} ${surah.name} · ` : ''}{isEn ? `Page ${page} of ${PAGE_COUNT}` : `صفحة ${page} من ${PAGE_COUNT}`}</p></div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))} className="p-2 rounded-lg bg-white/10" aria-label={isEn ? 'Zoom in' : 'تكبير'}><Plus className="w-4 h-4" /></button>
          <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} className="p-2 rounded-lg bg-white/10" aria-label={isEn ? 'Zoom out' : 'تصغير'}><Minus className="w-4 h-4" /></button>
          <button type="button" onClick={() => setZoom(1)} className="p-2 rounded-lg bg-white/10" aria-label={isEn ? 'Reset zoom' : 'إعادة التكبير'}><RotateCcw className="w-4 h-4" /></button>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-auto p-2 sm:p-4 flex items-start justify-center overscroll-contain">
        <div className="relative shrink-0 flex justify-center" style={{ width: `${zoom * 100}%`, minWidth: zoom > 1 ? `${zoom * 100}%` : undefined }}>
          {loading && <div className="absolute z-10 top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-950/90 text-white px-3 py-2"><Loader2 className="w-5 h-5 animate-spin" /></div>}
          {imageError ? (
            <div className="w-full min-h-[78vh] flex flex-col items-center justify-center gap-3 rounded-lg bg-[#fffdf7] dark:bg-[#182422] text-center p-8 shadow-2xl">
              <p className="font-bold">{isEn ? 'The full Mushaf page could not be loaded.' : 'تعذر تحميل صفحة المصحف الكاملة.'}</p>
              <button type="button" onClick={() => { setImageError(false); setPage((current) => current); }} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">{isEn ? 'Retry' : 'إعادة المحاولة'}</button>
            </div>
          ) : (
            <img
              key={imageUrl}
              src={imageUrl}
              alt={isEn ? `Mushaf page ${page}` : `صفحة المصحف رقم ${page}`}
              className="block w-full h-auto object-contain rounded-sm shadow-2xl bg-white select-none"
              draggable={false}
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setImageError(true); }}
            />
          )}
        </div>
      </main>

      <footer className="shrink-0 flex items-center justify-center gap-4 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 bg-emerald-950 text-white">
        <button type="button" disabled={page === PAGE_COUNT} onClick={() => go(page + 1)} className="p-2.5 rounded-2xl bg-white/10 disabled:opacity-30" aria-label={isEn ? 'Next page' : 'الصفحة التالية'}><ArrowRight className="w-5 h-5" /></button>
        <div className="text-center"><span className="font-bold text-amber-300 text-sm">{page} / {PAGE_COUNT}</span><p className="text-[10px] text-emerald-200">{metadata ? `${isEn ? 'Juz' : 'الجزء'} ${metadata.juz_number ?? '—'} · ${isEn ? 'Hizb' : 'الحزب'} ${metadata.hizb_number ?? '—'}` : ''} · {Math.round(zoom * 100)}%</p></div>
        <button type="button" disabled={page === 1} onClick={() => go(page - 1)} className="p-2.5 rounded-2xl bg-white/10 disabled:opacity-30" aria-label={isEn ? 'Previous page' : 'الصفحة السابقة'}><ArrowLeft className="w-5 h-5" /></button>
      </footer>
    </section>
  );
}
