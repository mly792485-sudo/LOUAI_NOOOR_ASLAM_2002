from pathlib import Path

p = Path('src/components/QuranSection.tsx')
s = p.read_text()
start = s.index('          {/* Verses Content */}')
end = s.index('          </div>\n        </div>\n      )}', start)
new = '''          {/* Compact Mushaf-style text page: verses flow together instead of separate cards. */}
          <div className="quran-mushaf-page rounded-[1.5rem] border border-amber-200/20 bg-[#fffdf7] dark:bg-[#111b1a] text-[#17211d] dark:text-[#f5eddc] shadow-lg overflow-hidden">
            <div className="px-4 sm:px-7 py-4 border-b border-amber-900/15 dark:border-emerald-400/15 text-center">
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">صفحة قراءة المصحف</p>
              <h3 className="mt-1 text-xl sm:text-2xl font-black text-emerald-950 dark:text-amber-200">سورة {selectedSurah.name}</h3>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{selectedSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {selectedSurah.numberOfAyahs} آيات • رواية حفص عن عاصم</p>
            </div>

            <div className="px-4 sm:px-8 py-5 sm:py-8 text-center">
              {isLoadingSurahText ? (
                <div className="py-10 flex items-center justify-center gap-3 text-emerald-700 dark:text-emerald-300">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-xs font-bold">جاري تحميل النص القرآني الشريف...</p>
                </div>
              ) : selectedSurah.ayahs && selectedSurah.ayahs.length > 0 ? (
                <>
                  {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                    <p className={`mb-5 text-xl sm:text-2xl ${activeFontClass} text-amber-700 dark:text-amber-300`}>
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  )}
                  <p
                    className={`${activeFontClass} text-center leading-[2.35] sm:leading-[2.45] text-emerald-950 dark:text-slate-100 select-text`}
                    style={{ fontSize: `${Math.max(20, Math.min(fontSize, 30))}px` }}
                  >
                    {selectedSurah.ayahs.map((ayah) => (
                      <React.Fragment key={ayah.number}>
                        <span id={`ayah-${ayah.number}`} className="inline">{ayah.text}</span>{' '}
                        <span className="inline-flex align-middle items-center justify-center w-6 h-6 sm:w-7 sm:h-7 mx-1 rounded-full border border-emerald-700/40 dark:border-amber-300/40 text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-amber-200">{ayah.number}</span>{' '}
                      </React.Fragment>
                    ))}
                  </p>
                </>
              ) : (
                <div className="py-8 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-bold">تعذر تحميل نص السورة حاليًا</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 px-4 sm:px-7 py-3 border-t border-amber-900/15 dark:border-emerald-400/15 bg-amber-50/60 dark:bg-emerald-950/30">
              <button type="button" onClick={() => handleFetchSurahTafsir(selectedSurah.number, selectedSurah.name)} className="px-3 py-2 rounded-xl bg-emerald-800 text-white text-[11px] font-bold inline-flex items-center gap-1.5"><BookOpenCheck className="w-3.5 h-3.5 text-amber-300" />تفسير السورة</button>
              <button type="button" onClick={() => selectedSurah.ayahs?.[0] && handleSaveBookmark(selectedSurah.number, selectedSurah.ayahs[0].number, selectedSurah.name)} className="px-3 py-2 rounded-xl border border-emerald-700/30 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold inline-flex items-center gap-1.5"><Bookmark className="w-3.5 h-3.5" />حفظ موضع القراءة</button>
              <button type="button" onClick={() => setIsMushafOpen(true)} className="px-3 py-2 rounded-xl border border-amber-600/30 text-amber-800 dark:text-amber-200 text-[11px] font-bold inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />صفحات المصحف الكاملة</button>
            </div>
          </div>
'''
s = s[:start] + new + s[end:]
p.write_text(s)
