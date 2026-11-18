import React, { useState } from 'react';
import { Check, ChevronLeft, Globe2, LocateFixed, Loader2, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { AppLanguage, AppSettings } from '../types';
import { safeStorage } from '../utils/safeStorage';
import EmailAuthSection from './EmailAuthSection';
import appLogo from '../assets/images/noor-al-islam-logo-square.png';

interface Props {
  settings: AppSettings;
  onComplete: (patch: Partial<AppSettings>) => void;
}

type Language = { code: AppLanguage; label: string; native: string; rtl?: boolean };

const LANGUAGES: Language[] = [
  { code: 'ar', label: 'العربية', native: 'العربية', rtl: true },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'id', label: 'Indonesia', native: 'Bahasa Indonesia' },
  { code: 'fr', label: 'Français', native: 'Français' },
  { code: 'ru', label: 'Русский', native: 'Русский' },
  { code: 'fa', label: 'فارسی', native: 'فارسی', rtl: true },
  { code: 'tr', label: 'Türkçe', native: 'Türkçe' },
  { code: 'es', label: 'Español', native: 'Español' },
  { code: 'de', label: 'Deutsch', native: 'Deutsch' },
  { code: 'ur', label: 'اردو', native: 'اردو', rtl: true },
];

export default function OriginalOnboardingWizard({ settings, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const stored = safeStorage.getItem('noor_onboarding_language');
    return (LANGUAGES.some((item) => item.code === stored) ? (stored as AppLanguage) : settings.language) || 'ar';
  });
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [location, setLocation] = useState<{ city: string; country: string; region: string; latitude: number; longitude: number } | null>(null);

  const finish = (patch: Partial<AppSettings> = {}) => {
    safeStorage.setItem('noor_original_onboarding_complete', 'true');
    onComplete({
      language,
      ...(gender ? { gender } : {}),
      ...(location ? { latitude: location.latitude, longitude: location.longitude, city: location.city, country: location.country || settings.country, region: location.region } : {}),
      ...(location?.region ? { region: location.region } : {}),
      ...patch,
    });
  };

  const locate = async () => {
    setLocating(true);
    setLocationError('');
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'denied') throw new Error('تم رفض صلاحية الموقع. يمكنك السماح بها من إعدادات الجهاز.');
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 });
      const { latitude, longitude } = position.coords;
      let city = 'موقعك الحالي';
      let country = '';
      let region = '';
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ar`, { headers: { Accept: 'application/json' } });
        if (response.ok) {
          const data = await response.json();
          const address = data.address || {};
          city = address.city || address.town || address.village || address.municipality || city;
          country = address.country || '';
          region = address.state || address.province || address.region || '';
        }
      } catch {
        // Coordinates remain valid even if reverse geocoding is unavailable.
      }
      setLocation({ city, country, region, latitude, longitude });
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'تعذر تحديد الموقع. حاول مرة أخرى أو تابع بدون موقع.');
    } finally {
      setLocating(false);
    }
  };

  const next = () => {
    if (step === 0) {
      safeStorage.setItem('noor_onboarding_language', language);
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      finish();
    }
  };

  const dir = LANGUAGES.find(item => item.code === language)?.rtl ? 'rtl' : 'ltr';
  const title = ['اختر لغة التطبيق', 'حدد موقعك', 'اختر ما يناسبك', 'مرحبًا بك في نور الإسلام'][step];
  const subtitle = ['يمكنك تغيير اللغة لاحقًا من الإعدادات.', 'يساعدنا موقعك على حساب مواقيت الصلاة وتحديد اتجاه القبلة بدقة.', 'هذا الاختيار اختياري ولا يمنع استخدام الوظائف الأساسية.', 'استخدم التطبيق كزائر، أو أنشئ حسابًا للدخول الآمن.'][step];

  return (
    <div className="noor-onboarding fixed inset-0 z-[100] overflow-y-auto px-3 pb-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-slate-100 sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+2rem)]" dir={dir}>
      <div className="noor-onboarding__ornament noor-onboarding__ornament--left" aria-hidden="true" />
      <div className="noor-onboarding__ornament noor-onboarding__ornament--right" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-env(safe-area-inset-top)-1.25rem)] w-full max-w-[720px] flex-col rounded-[2rem] border border-emerald-300/20 bg-[#071918]/95 px-4 py-4 shadow-[0_0_80px_rgba(16,185,129,0.12)] backdrop-blur-xl sm:min-h-0 sm:px-9 sm:py-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button type="button" onClick={() => step > 0 && setStep(step - 1)} className={`rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:border-emerald-300/50 hover:bg-emerald-400/10 ${step === 0 ? 'invisible' : ''}`} aria-label="رجوع"><ChevronLeft className="h-5 w-5" /></button>
          <div className="text-center"><div className="font-kufi text-xl font-black tracking-wide text-emerald-300">نور الإسلام</div><div className="mt-0.5 text-[11px] text-slate-400">الإعداد الأول · {step + 1} من 4</div></div>
          <div className="w-9" />
        </div>
        <div className="mb-5 flex gap-2">{[0, 1, 2, 3].map(item => <div key={item} className={`h-1.5 flex-1 rounded-full transition-colors ${item <= step ? 'bg-gradient-to-r from-emerald-500 to-lime-300 shadow-[0_0_12px_rgba(52,211,153,0.65)]' : 'bg-white/10'}`} />)}</div>
        <div className="mx-auto w-full max-w-xl text-center">
          <div className="mx-auto mb-3 flex h-[84px] w-[84px] items-center justify-center rounded-full border border-amber-300/50 bg-[radial-gradient(circle_at_35%_30%,rgba(253,230,138,0.45),rgba(16,185,129,0.16)_45%,rgba(3,20,18,0.9)_72%)] p-2 shadow-[0_0_32px_rgba(250,204,21,0.25)]"><img src={appLogo} alt="شعار نور الإسلام" className="h-full w-full rounded-full object-cover" /></div>
          <h1 className="font-kufi text-[clamp(1.55rem,5vw,2.15rem)] font-black text-white">{title}</h1>
          <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
        </div>

        {step === 0 && <div className="mx-auto mt-5 grid w-full max-w-xl grid-cols-2 gap-2.5">{LANGUAGES.map(item => <button type="button" key={item.code} onClick={() => setLanguage(item.code)} className={`group flex min-h-[66px] items-center gap-2 rounded-2xl border px-3 py-2.5 text-start transition-all ${language === item.code ? 'border-emerald-300 bg-gradient-to-r from-emerald-500/20 to-amber-300/10 text-amber-200 shadow-[0_0_20px_rgba(16,185,129,0.16)]' : 'border-white/15 bg-white/[0.035] text-slate-200 hover:border-emerald-300/40 hover:bg-white/[0.07]'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${language === item.code ? 'border-amber-200/60 bg-emerald-900/80' : 'border-white/10 bg-white/10'}`}>{language === item.code ? <img src={appLogo} alt="" className="h-7 w-7 rounded-full object-cover" /> : <Globe2 className="h-4 w-4 text-emerald-300" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{item.label}</span><span className="block truncate text-[10px] text-slate-400">{item.native}</span></span>{language === item.code && <Check className="h-4 w-4 shrink-0 text-amber-300" />}</button>)}</div>}

        {step === 1 && <div className="mx-auto mt-6 w-full max-w-xl"><div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-center"><MapPin className="mx-auto mb-2 h-9 w-9 text-emerald-300" /><p className="text-sm leading-6 text-slate-300">سيستخدم موقعك لحساب المواقيت واتجاه القبلة بدقة، ويمكنك تغيير الموقع لاحقًا.</p></div><button type="button" onClick={locate} disabled={locating} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-300/40 bg-gradient-to-r from-emerald-600 to-emerald-400 px-5 py-4 font-kufi font-black text-[#061011] shadow-[0_0_24px_rgba(16,185,129,0.22)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70">{locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}{locating ? 'جاري تحديد الموقع...' : 'السماح بتحديد الموقع'}</button>{location && <div className="mt-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-right"><div className="font-kufi font-black text-emerald-200">تم تحديد موقعك بنجاح</div><div className="mt-1 text-sm text-slate-200">{location.city}{location.region ? `، ${location.region}` : ''}</div><div className="text-xs text-slate-400">{location.country || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}</div></div>}{locationError && <div className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm leading-6 text-red-200">{locationError}</div>}<button type="button" onClick={next} className="mt-4 w-full text-sm text-slate-400 underline decoration-white/20 underline-offset-4 hover:text-white">المتابعة بدون موقع الآن</button></div>}

        {step === 2 && <div className="mx-auto mt-6 grid w-full max-w-xl gap-3"><button type="button" onClick={() => setGender('male')} className={`flex items-center gap-3 rounded-2xl border p-5 text-start transition-all ${gender === 'male' ? 'border-emerald-300 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.14)]' : 'border-white/15 bg-white/[0.035] hover:border-emerald-300/40'}`}><span className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/30 bg-emerald-900/60"><UserRound className="text-amber-200" /></span><span className="flex-1 font-kufi font-bold">مسلم</span>{gender === 'male' && <Check className="text-emerald-300" />}</button><button type="button" onClick={() => setGender('female')} className={`flex items-center gap-3 rounded-2xl border p-5 text-start transition-all ${gender === 'female' ? 'border-emerald-300 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.14)]' : 'border-white/15 bg-white/[0.035] hover:border-emerald-300/40'}`}><span className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/30 bg-emerald-900/60"><UserRound className="text-amber-200" /></span><span className="flex-1 font-kufi font-bold">مسلمة</span>{gender === 'female' && <Check className="text-emerald-300" />}</button><button type="button" onClick={next} className="mt-1 text-sm text-slate-400 underline underline-offset-4 hover:text-white">تخطي</button></div>}

        {step === 3 && <EmailAuthSection onSuccess={() => finish()} onGuest={() => finish()} />}

        {step < 3 && <button type="button" onClick={next} className="mx-auto mt-5 block w-full max-w-xl rounded-2xl border border-emerald-300/35 bg-gradient-to-r from-emerald-600 to-emerald-400 px-5 py-3.5 font-kufi font-black text-[#061011] shadow-[0_0_24px_rgba(16,185,129,0.2)] transition hover:brightness-110">متابعة</button>}
      </div>
    </div>
  );
}
