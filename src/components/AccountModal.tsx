import { useEffect, useState } from 'react';
import { CircleUserRound, LogIn, LogOut, Mail, ShieldCheck, UserRound, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import EmailAuthSection from './EmailAuthSection';
import { auth, initAuth, logout } from '../utils/firebase';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
}

export default function AccountModal({ isOpen, onClose, isEn = false }: AccountModalProps) {
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = initAuth(setUser, () => setUser(null));
    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      setUser(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label={isEn ? 'Account' : 'الحساب'}>
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-emerald-400/25 bg-[#071719] text-white shadow-2xl shadow-black/60" dir={isEn ? 'ltr' : 'rtl'}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-300/60 bg-gradient-to-br from-emerald-500/30 to-amber-300/20 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.2)]"><CircleUserRound className="h-7 w-7" /></div>
            <div><h2 className="font-kufi text-lg font-black text-emerald-200">{isEn ? 'My Account' : 'حسابي'}</h2><p className="text-xs text-slate-400">{isEn ? 'Login, logout and account settings' : 'تسجيل الدخول والخروج وإعدادات الحساب'}</p></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/10" aria-label={isEn ? 'Close' : 'إغلاق'}><X className="h-5 w-5" /></button>
        </div>

        {user ? (
          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200"><UserRound /></div><div className="min-w-0"><p className="font-kufi font-black text-emerald-100">{user.displayName || (isEn ? 'Signed in' : 'تم تسجيل الدخول')}</p><p className="flex items-center gap-1 truncate text-sm text-slate-300"><Mail className="h-3.5 w-3.5 shrink-0" />{user.email}</p></div></div>
            </div>
            <div className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-6 text-slate-300"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />{isEn ? 'Your password is managed securely by Firebase Authentication.' : 'تتم إدارة كلمة المرور بأمان عبر Firebase Authentication ولا تُحفظ داخل التطبيق.'}</div>
            <button type="button" onClick={handleLogout} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 font-kufi font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-60"><LogOut className="h-5 w-5" />{busy ? (isEn ? 'Signing out…' : 'جارٍ تسجيل الخروج…') : (isEn ? 'Sign out' : 'تسجيل الخروج')}</button>
          </div>
        ) : (
          <div className="p-5"><div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-6 text-amber-100"><LogIn className="h-4 w-4 shrink-0" />{isEn ? 'Login is optional; you can continue as a guest.' : 'تسجيل الدخول اختياري، ويمكنك متابعة استخدام التطبيق كزائر.'}</div><EmailAuthSection onSuccess={() => setUser(auth?.currentUser ?? null)} onGuest={onClose} /></div>
        )}
      </div>
    </div>
  );
}
