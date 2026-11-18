import React, { useState } from 'react';
import { Shield, Check, Copy, X, ExternalLink, Mail, Lock, Smartphone, Globe } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
}

export const PRIVACY_POLICY_TEXT_AR = `سياسة الخصوصية لتطبيق "نور الإسلام"
آخر تحديث: 14 نوفمبر 2026

مقدمة:
نُولي في تطبيق "نور الإسلام" اهتماماً بالغاً بخصوصية المستخدمين. توضح هذه السياسة كيف نتعامل مع البيانات والمعلومات عند استخدامك لتطبيقنا.

جمع البيانات:
لا يتطلب التطبيق إنشاء حساب، ولا يطلب الاسم أو رقم الهاتف أو البريد الإلكتروني لتشغيل الميزات الأساسية. عند استخدام المستشار، يُرسل السؤال الذي تكتبه إلى خادم التطبيق ومزود الذكاء الاصطناعي لمعالجة الرد؛ لذلك لا تكتب معلومات شخصية أو سرية في السؤال. لا نبيع بيانات المستخدمين ولا نستخدمها للإعلانات.

أذونات الجهاز:
قد يطلب التطبيق إذن الموقع لتحديد المدينة وحساب مواقيت الصلاة واتجاه القبلة، وإذن الإشعارات للتنبيهات. عند تفعيل تحديد الموقع، قد تُرسل الإحداثيات إلى خدمة AlAdhan لحساب المواقيت وإلى OpenStreetMap Nominatim لتحويل الإحداثيات إلى اسم مدينة؛ يمكنك رفض الإذن واختيار المدينة يدوياً.

خدمات الأطراف الثالثة:
يعتمد التطبيق على AlAdhan لمواقيت الصلاة، وOpenStreetMap Nominatim للتحويل العكسي للموقع، ومزود ذكاء اصطناعي لمعالجة أسئلة المستشار. قد يتلقى كل مزود البيانات اللازمة لتقديم خدمته وفق سياسته الخاصة. لا ترسل معلومات حساسة أو تعريفية داخل أسئلة المستشار.

التعديلات على السياسة:
قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لمواكبة التحديثات التقنية، وسيتم نشر أي تغييرات داخل هذه الصفحة في التطبيق مباشرة.

التواصل معنا:
إذا كانت لديك أي استفسارات أو ملاحظات حول سياسة الخصوصية، تواصل معنا عبر البريد: lwya0721@gmail.com`;

export const PRIVACY_POLICY_TEXT_EN = `Privacy Policy for "Noor Al-Islam"
Last updated: November 14, 2026

Introduction:
At "Noor Al-Islam", we prioritize and strictly respect the privacy of our users. This policy outlines how we handle data and information when you use our application.

Data Collection:
No account is required for core features, and we do not sell user data or use it for advertising. Questions entered into the optional assistant are sent to our backend and an AI provider for processing; do not include personal or confidential information.

Device Permissions:
The app may request location for city detection, prayer times, and Qibla, and notifications for alerts. When location is enabled, coordinates may be sent to AlAdhan for prayer calculations and OpenStreetMap Nominatim for reverse geocoding. You may deny access and choose a city manually.

Third-Party Services:
The app uses AlAdhan, OpenStreetMap Nominatim, and an AI provider for the assistant. These providers may receive the data required for their services under their own privacy policies. Do not submit sensitive information.

Policy Updates:
We may update this Privacy Policy periodically to reflect technical enhancements. Any updates will be displayed directly within this page in the application.

Contact Us:
If you have any questions or feedback, contact: lwya0721@gmail.com`;

export const APPLE_REVIEW_NOTE_EN = `Noor Al-Islam does not require an account. Location may be sent to AlAdhan and OpenStreetMap Nominatim when location-based features are enabled. Questions submitted to the optional assistant are sent to the app backend and an AI provider. Users should not submit sensitive personal information. Contact: lwya0721@gmail.com`;

export function PrivacyPolicyModal({ isOpen, onClose, isEn = false }: PrivacyPolicyModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans pt-[max(calc(env(safe-area-inset-top,0px)+6px),12px)] pb-[max(calc(env(safe-area-inset-bottom,0px)+6px),12px)]">
      <div 
        id="privacy-policy-modal"
        className="w-full max-w-2xl bg-[#FCFAF6] dark:bg-[#070D0E] border border-[#EBE7DF] dark:border-[#142225] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 max-h-[92vh] flex flex-col"
        dir={isEn ? "ltr" : "rtl"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE7DF] dark:border-[#142225] bg-gradient-to-r from-emerald-800 to-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-kufi">
                {isEn ? "Privacy Policy" : "سياسة الخصوصية"}
              </h3>
              <p className="text-[11px] text-emerald-100/80">
                {isEn ? "Noor Al-Islam Application" : "تطبيق نور الإسلام"}
              </p>
            </div>
          </div>
          <button
            id="close-privacy-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Quick Summary Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-emerald-950 dark:text-emerald-300">{isEn ? "No account required" : "لا يتطلب حساباً"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "For core features" : "للميزات الأساسية"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-amber-950 dark:text-amber-300">{isEn ? "Permission based" : "حسب الإذن"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Location & notifications" : "الموقع والإشعارات"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
              <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-teal-950 dark:text-teal-300">{isEn ? "No Ads / No Trackers" : "بدون إعلانات أو تتبع"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Clean Experience" : "تجربة إسلامية نقية"}</p>
              </div>
            </div>
          </div>

          {/* 1. Main Privacy Policy (Arabic) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-300 font-kufi flex items-center gap-2">
                <span>نص سياسة الخصوصية (باللغة العربية)</span>
              </h4>
              <button
                id="copy-privacy-ar-btn"
                type="button"
                onClick={() => handleCopy(PRIVACY_POLICY_TEXT_AR, 'ar')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {copiedSection === 'ar' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ النص كاملاً</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-2xl text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-2.5 font-medium whitespace-pre-line shadow-xs">
              {PRIVACY_POLICY_TEXT_AR}
            </div>
          </div>

          {/* 2. Third-party disclosure summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 font-kufi flex items-center gap-2">
                <span>بيان مشاركة البيانات مع الخدمات الخارجية</span>
              </h4>
              <button
                id="copy-apple-note-btn"
                type="button"
                onClick={() => handleCopy(APPLE_REVIEW_NOTE_EN, 'apple')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {copiedSection === 'apple' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ البيان (English)</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-400/30 rounded-2xl text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-mono space-y-2" dir="ltr">
                <p className="font-bold text-amber-700 dark:text-amber-400 font-sans">
                يوضح النص التالي الخدمات الخارجية التي قد تعالج بيانات لازمة لتشغيل الميزات:
              </p>
              <div className="p-3 bg-white dark:bg-black/40 rounded-xl border border-amber-500/20 whitespace-pre-line">
                {APPLE_REVIEW_NOTE_EN}
              </div>
            </div>
          </div>

          {/* 3. Direct URL access note */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 to-[#041215] text-white rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-black text-amber-300">رابط صفحة سياسة الخصوصية المباشر</h5>
              <p className="text-[11px] text-slate-300">متاح مباشرة عبر الرابط الثابت في الخادم: <code className="font-mono text-emerald-400">/privacy-policy</code></p>
            </div>
            <a
              id="open-web-privacy-link"
              href="/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <span>فتح الرابط</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EBE7DF] dark:border-[#142225] bg-[#FAF8F5] dark:bg-[#050A0B] flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>تطبيق نور الإسلام — للاستفسارات: lwya0721@gmail.com</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
