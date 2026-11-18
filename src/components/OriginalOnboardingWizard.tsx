import React, { useState } from 'react';
import { Check, ChevronLeft, Globe2, LocateFixed, Loader2, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { AppLanguage, AppSettings } from '../types';
import { safeStorage } from '../utils/safeStorage';
import EmailAuthSection from './EmailAuthSection';

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
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#061011] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+2.75rem)] text-slate-100" dir={dir}>
      <div className="my-2 flex w-full max-w-2xl flex-col rounded-[2rem] border border-emerald-400/20 bg-[#0B1719] p-5 shadow-2xl shadow-black/60 sm:my-4 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button type="button" onClick={() => step > 0 && setStep(step - 1)} className={`rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 ${step === 0 ? 'invisible' : ''}`} aria-label="رجوع"><ChevronLeft className="h-5 w-5" /></button>
          <div className="text-center"><div className="font-kufi text-lg font-black text-emerald-300">نور الإسلام</div><div className="mt-1 text-xs text-slate-400">الإعداد الأول · {step + 1} من 4</div></div>
          <div className="w-9" />
        </div>
        <div className="mb-8 flex gap-1.5">{[0, 1, 2, 3].map(item => <div key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-emerald-400' : 'bg-white/10'}`} />)}</div>
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">{step === 0 ? <Globe2 /> : step === 1 ? <MapPin /> : step === 2 ? <UserRound /> : <ShieldCheck />}</div>
          <h1 className="font-kufi text-2xl font-black text-white">{title}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-400">{subtitle}</p>
        </div>

        {step === 0 && <div className="mx-auto mt-7 grid max-w-xl grid-cols-2 gap-2.5">{LANGUAGES.map(item => <button type="button" key={item.code} onClick={() => setLanguage(item.code)} className={`flex items-center gap-2 rounded-2xl border p-3 text-start transition ${language === item.code ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]'}`}><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10"><Globe2 className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{item.label}</span><span className="block text-[10px] text-slate-500">{item.native}</span></span>{language === item.code && <Check className="h-4 w-4 shrink-0" />}</button>)}</div>}

        {step === 1 && <div className="mx-auto mt-8 max-w-xl"><button type="button" onClick={locate} disabled={locating} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-5 py-4 font-kufi font-black text-[#061011] transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70">{locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}{locating ? 'جاري تحديد الموقع...' : 'السماح بتحديد الموقع'}</button>{location && <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-right"><div className="font-kufi font-black text-emerald-200">تم تحديد موقعك بنجاح</div><div className="mt-1 text-sm text-slate-200">{location.city}{location.region ? `، ${location.region}` : ''}</div><div className="text-xs text-slate-400">{location.country || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}</div></div>}{locationError && <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm leading-6 text-red-200">{locationError}</div>}<button type="button" onClick={next} className="mt-4 w-full text-sm text-slate-400 underline decoration-white/20 underline-offset-4 hover:text-white">المتابعة بدون موقع الآن</button></div>}

        {step === 2 && <div className="mx-auto mt-8 grid max-w-xl gap-3"><button type="button" onClick={() => setGender('male')} className={`flex items-center gap-3 rounded-2xl border p-5 text-start transition ${gender === 'male' ? 'border-emerald-400 bg-emerald-500/15' : 'border-white/10 bg-white/[0.03]'}`}><UserRound className="text-emerald-300" /><span className="flex-1 font-kufi font-bold">مسلم</span>{gender === 'male' && <Check className="text-emerald-300" />}</button><button type="button" onClick={() => setGender('female')} className={`flex items-center gap-3 rounded-2xl border p-5 text-start transition ${gender === 'female' ? 'border-emerald-400 bg-emerald-500/15' : 'border-white/10 bg-white/[0.03]'}`}><UserRound className="text-emerald-300" /><span className="flex-1 font-kufi font-bold">مسلمة</span>{gender === 'female' && <Check className="text-emerald-300" />}</button><button type="button" onClick={next} className="mt-1 text-sm text-slate-400 underline underline-offset-4 hover:text-white">تخطي</button></div>}

        {step === 3 && <EmailAuthSection onSuccess={() => finish()} onGuest={() => finish()} />}

        {step < 3 && <button type="button" onClick={next} className="mx-auto mt-8 block w-full max-w-xl rounded-2xl bg-emerald-500 px-5 py-4 font-kufi font-black text-[#061011] transition hover:bg-emerald-400">متابعة</button>}
      </div>
    </div>
  );
}
