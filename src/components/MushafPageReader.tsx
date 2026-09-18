import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Loader2, Minus, Plus, RotateCcw, Search, X } from 'lucide-react';
import { quranMetadata } from '../data/quran_metadata';

type MushafMetadata = { juz_number?: number; hizb_number?: number; chapter_id?: number };
interface MushafPageReaderProps { isEn?: boolean; onClose: () => void; }

const PAGE_COUNT = 604;
const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master';
const METADATA_BASE = 'https://api.quran.com/api/v4/verses/by_page';
const CHAPTER_BASE = 'https://api.quran.com/api/v4/verses/by_chapter';

export default function MushafPageReader({ isEn = false, onClose }: MushafPageReaderProps) {
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState<MushafMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [retry, setRetry] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayah, setAyah] = useState('1');
  const [jumping, setJumping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);
  const imageUrl = `${IMAGE_BASE}/${String(page).padStart(3, '0')}.png`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setImageError(false);
    fetch(`${METADATA_BASE}/${page}?language=ar&words=false&fields=text_uthmani`)
      .then((response) => response.ok ? response.json() as Promise<{ verses?: MushafMetadata[] }> : Promise.reject(new Error('metadata request failed')))
      .then((data) => { if (!cancelled) setMetadata(data.verses?.[0] || null); })
      .catch(() => { if (!cancelled) setMetadata(null); });
    return () => { cancelled = true; };
  }, [page]);

  // Preload adjacent pages so the iPhone-like swipe does not wait on the network.
  useEffect(() => {
    [page - 1, page + 1].filter((value) => value >= 1 && value <= PAGE_COUNT).forEach((value) => {
      const image = new Image();
      image.src = `${IMAGE_BASE}/${String(value).padStart(3, '0')}.png`;
    });
  }, [page]);

  const go = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(PAGE_COUNT, Math.round(nextPage)));
    if (safePage === page) { setRetry((value) => value + 1); return; }
    setPage(safePage);
    setZoom(1);
  };

  const jumpToAyah = async () => {
    const verse = Math.max(1, Number.parseInt(ayah, 10) || 1);
    setJumping(true);
    try {
      const response = await fetch(`${CHAPTER_BASE}/${selectedSurah}?language=ar&per_page=300&fields=text_uthmani`);
      if (!response.ok) throw new Error('verse lookup failed');
      const data = await response.json() as { verses?: Array<{ verse_number?: number; page_number?: number }> };
      const target = data.verses?.find((item) => item.verse_number === verse);
      if (target?.page_number) { go(target.page_number); setShowPicker(false); }
    } catch (_) {
      // Keep the reader usable if verse metadata is offline.
    } finally { setJumping(false); }
  };

  const distance = (a: React.Touch, b: React.Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  const surah = metadata?.chapter_id ? quranMetadata.find((item) => item.number === metadata.chapter_id) : null;

  return (
    <section className="fixed inset-0 z-[1200] bg-[#0b1716] text-white flex flex-col" dir="rtl"
      onTouchStart={(event) => {
        if (event.touches.length === 2) { pinchStartDistance.current = distance(event.touches[0], event.touches[1]); pinchStartZoom.current = zoom; touchStartX.current = null; }
        else touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchMove={(event) => {
        if (event.touches.length === 2 && pinchStartDistance.current) {
          const next = pinchStartZoom.current * (distance(event.touches[0], event.touches[1]) / pinchStartDistance.current);
          setZoom(Math.max(1, Math.min(3, next)));
        }
      }}
      onTouchEnd={(event) => {
        if (pinchStartDistance.current) { pinchStartDistance.current = null; return; }
        if (zoom !== 1 || touchStartX.current == null) return;
        const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        if (Math.abs(delta) > 55) go(page + (delta < 0 ? 1 : -1));
        touchStartX.current = null;
      }}>
      <header className="shrink-0 flex items-center justify-between gap-2 px-3 pt-[max(10px,env(safe-area-inset-top))] pb-2 bg-emerald-950 shadow-lg">
        <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white/10" aria-label="إغلاق المصحف"><X className="w-5 h-5" /></button>
        <div className="text-center min-w-0"><h2 className="font-black text-amber-300 text-sm sm:text-base">المصحف الشريف</h2><p className="text-[10px] text-emerald-200 truncate">{surah ? `سورة ${surah.name} · ` : ''}صفحة {page} من {PAGE_COUNT}</p></div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setZoom((value) => Math.min(3, value + .25))} className="p-2 rounded-lg bg-white/10" aria-label="تكبير"><Plus className="w-4 h-4" /></button>
          <button type="button" onClick={() => setZoom((value) => Math.max(1, value - .25))} className="p-2 rounded-lg bg-white/10" aria-label="تصغير"><Minus className="w-4 h-4" /></button>
          <button type="button" onClick={() => setZoom(1)} className="p-2 rounded-lg bg-white/10" aria-label="إعادة التكبير"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="shrink-0 flex justify-center gap-2 px-3 py-2 bg-emerald-950/95 border-t border-white/10">
        <button type="button" onClick={() => setShowPicker((value) => !value)} className="px-3 py-2 rounded-xl bg-amber-300 text-emerald-950 font-bold text-xs flex items-center gap-1"><BookOpen className="w-4 h-4" />اختيار السورة والآية</button>
        <button type="button" onClick={() => go(page - 1)} disabled={page === 1} className="p-2 rounded-xl bg-white/10 disabled:opacity-30" aria-label="السابق"><ArrowRight className="w-5 h-5" /></button>
        <button type="button" onClick={() => go(page + 1)} disabled={page === PAGE_COUNT} className="p-2 rounded-xl bg-white/10 disabled:opacity-30" aria-label="التالي"><ArrowLeft className="w-5 h-5" /></button>
      </div>

      {showPicker && <div className="shrink-0 p-3 bg-[#102421] border-b border-amber-300/20 flex flex-wrap gap-2 items-center">
        <select value={selectedSurah} onChange={(event) => setSelectedSurah(Number(event.target.value))} className="flex-1 min-w-[170px] rounded-xl bg-white text-slate-900 p-2 text-sm" aria-label="اختيار السورة">
          {quranMetadata.map((item) => <option key={item.number} value={item.number}>{item.number}. {item.name}</option>)}
        </select>
        <input value={ayah} onChange={(event) => setAyah(event.target.value.replace(/\D/g, ''))} inputMode="numeric" min="1" className="w-20 rounded-xl bg-white text-slate-900 p-2 text-sm" placeholder="الآية" aria-label="رقم الآية" />
        <button type="button" onClick={jumpToAyah} disabled={jumping} className="rounded-xl bg-emerald-500 px-3 py-2 font-bold text-sm">{jumping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 inline" />} انتقال</button>
      </div>}

      <main className="flex-1 min-h-0 overflow-auto p-2 sm:p-4 flex items-start justify-center overscroll-contain">
        <div className="relative shrink-0 flex justify-center" style={{ width: `${zoom * 100}%`, minWidth: zoom > 1 ? `${zoom * 100}%` : undefined }}>
          {loading && <div className="absolute z-10 top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-950/90 text-white px-3 py-2"><Loader2 className="w-5 h-5 animate-spin" /></div>}
          {imageError ? <div className="w-full min-h-[78vh] flex flex-col items-center justify-center gap-3 rounded-lg bg-[#fffdf7] text-slate-900 text-center p-8 shadow-2xl"><p className="font-bold">تعذر تحميل صفحة المصحف الكاملة.</p><button type="button" onClick={() => { setImageError(false); setLoading(true); setRetry((value) => value + 1); }} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">إعادة المحاولة</button></div> : <img key={`${imageUrl}-${retry}`} src={imageUrl} alt={`صفحة المصحف رقم ${page}`} className="block w-full h-auto object-contain rounded-sm shadow-2xl bg-white select-none" draggable={false} onLoad={() => setLoading(false)} onError={() => { setLoading(false); setImageError(true); }} />}
        </div>
      </main>

      <footer className="shrink-0 flex items-center justify-center gap-4 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 bg-emerald-950"><button type="button" disabled={page === 1} onClick={() => go(page - 1)} className="p-3 rounded-2xl bg-white/10 disabled:opacity-30"><ArrowRight className="w-5 h-5" /></button><div className="text-center"><span className="font-bold text-amber-300 text-lg">{page} / {PAGE_COUNT}</span><p className="text-[10px] text-emerald-200">{metadata ? `الجزء ${metadata.juz_number ?? '—'} · الحزب ${metadata.hizb_number ?? '—'}` : ''} · {Math.round(zoom * 100)}%</p></div><button type="button" disabled={page === PAGE_COUNT} onClick={() => go(page + 1)} className="p-3 rounded-2xl bg-white/10 disabled:opacity-30"><ArrowLeft className="w-5 h-5" /></button></footer>
    </section>
  );
}
