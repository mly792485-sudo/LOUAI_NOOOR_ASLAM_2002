import { useState } from 'react';
import { Loader2, Mail, ShieldCheck } from 'lucide-react';
import {
  firebaseSetupMessage,
  isFirebaseConfigured,
  loginWithEmail,
  registerWithEmail,
  resetEmailPassword,
} from '../utils/firebase';

interface Props {
  onSuccess: () => void;
  onGuest: () => void;
}

function arabicAuthError(error: unknown): string {
  const code = String((error as { code?: string })?.code || '');
  if (error instanceof Error && error.message === firebaseSetupMessage) return firebaseSetupMessage;
  if (code.includes('invalid-email')) return 'البريد الإلكتروني غير صحيح.';
  if (code.includes('email-already-in-use')) return 'هذا البريد مستخدم مسبقًا. جرّب تسجيل الدخول.';
  if (code.includes('weak-password')) return 'كلمة المرور ضعيفة. استخدم 6 أحرف أو أكثر.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  if (code.includes('network-request-failed')) return 'تعذر الاتصال بالإنترنت. حاول مرة أخرى.';
  if (code.includes('too-many-requests')) return 'تم إيقاف المحاولات مؤقتًا. حاول لاحقًا.';
  return 'تعذر إكمال العملية الآن. تحقق من الاتصال وإعدادات Firebase.';
}

export default function EmailAuthSection({ onSuccess, onGuest }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    setMessage('');
    if (!isFirebaseConfigured) {
      setMessage(firebaseSetupMessage);
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setMessage('أدخل بريدًا إلكترونيًا صحيحًا.');
      return;
    }
    if (password.length < 6) {
      setMessage('كلمة المرور يجب أن تكون 6 أحرف أو أكثر.');
      return;
    }
    if (mode === 'register' && password !== confirm) {
      setMessage('كلمتا المرور غير متطابقتين.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'register') await registerWithEmail(name, email, password);
      else await loginWithEmail(email, password);
      onSuccess();
    } catch (error) {
      setMessage(arabicAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setMessage('');
    if (!isFirebaseConfigured) {
      setMessage(firebaseSetupMessage);
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setMessage('أدخل بريدك الإلكتروني أولًا.');
      return;
    }
    setBusy(true);
    try {
      await resetEmailPassword(email);
      setMessage('أرسلنا رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
    } catch (error) {
      setMessage(arabicAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-300"><Mail className="h-5 w-5" /></div>
        <div><h2 className="font-kufi font-black text-white">حساب البريد الإلكتروني</h2><p className="text-xs text-slate-400">حساب حقيقي لحفظ إعداداتك ومزامنتها</p></div>
      </div>
      {mode === 'register' && <input value={name} onChange={(event) => setName(event.target.value)} placeholder="الاسم" autoComplete="name" className="mb-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-emerald-400" />}
      <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="البريد الإلكتروني" type="email" autoComplete="email" dir="ltr" className="mb-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-emerald-400" />
      <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="كلمة المرور" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} dir="ltr" className="mb-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-emerald-400" />
      {mode === 'register' && <input value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="تأكيد كلمة المرور" type="password" autoComplete="new-password" dir="ltr" className="mb-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-emerald-400" />}
      {message && <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs leading-6 text-amber-100">{message}</div>}
      <button type="button" disabled={busy} onClick={() => void submit()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-kufi font-black text-[#061011] disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mode === 'register' ? 'إنشاء الحساب' : 'تسجيل الدخول'}</button>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); }} className="underline underline-offset-4">{mode === 'login' ? 'إنشاء حساب جديد' : 'لدي حساب بالفعل'}</button>
        {mode === 'login' && <button type="button" onClick={() => void reset()} className="underline underline-offset-4">نسيت كلمة المرور؟</button>}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11px] leading-5 text-slate-500"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />لا تُخزّن كلمات المرور داخل التطبيق؛ تتم المصادقة عبر Firebase.</div>
      <button type="button" onClick={onGuest} className="mt-4 w-full text-xs text-slate-400 underline underline-offset-4">المتابعة كزائر</button>
    </div>
  );
}
