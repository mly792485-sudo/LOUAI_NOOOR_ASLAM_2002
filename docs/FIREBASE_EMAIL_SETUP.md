# ربط Firebase بالبريد الإلكتروني

تم تجهيز التطبيق ليستعمل Firebase Authentication الحقيقي عبر Email/Password. لا يضع التطبيق كلمات المرور في التخزين المحلي، ولا يفعّل المصادقة إذا كانت الإعدادات ناقصة.

## إعداد Firebase

1. افتح Firebase Console وأنشئ مشروعًا أو افتح مشروع نور الإسلام.
2. من **Authentication → Sign-in method** فعّل **Email/Password**.
3. أضف Web App من إعدادات المشروع.
4. انسخ القيم الستة من Firebase Config.
5. أضفها إلى GitHub Actions Secrets بالأسماء التالية:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

هذه قيم إعداد Web عامة وليست كلمة مرور. لا ترسل `OPENAI_API_KEY` داخل التطبيق.

## التشغيل المحلي

انسخ `.env.example` إلى `.env.local`، ثم املأ قيم Firebase. بعد ذلك شغّل:

```bash
npm ci
npm run build
```

## الوظائف المفعلة في الكود

- إنشاء حساب بالبريد والاسم وكلمة المرور.
- تسجيل الدخول بالبريد وكلمة المرور.
- استعادة كلمة المرور برسالة بريد Firebase.
- حفظ جلسة Firebase في التخزين المحلي الرسمي للمصادقة.
- رسائل عربية لأخطاء البريد، كلمة المرور، الحساب المكرر، انقطاع الشبكة والمحاولات الكثيرة.
- خيار الزائر إذا لم يرد المستخدم إنشاء حساب.

## ملاحظة مهمة

لن يعمل تسجيل البريد في IPA/APK المنشور حتى تُضاف Secrets إلى GitHub ثم يُعاد تشغيل Workflow للبناء. إذا بقيت القيم فارغة، يعرض التطبيق رسالة إعداد واضحة ولا ينشئ حسابًا وهميًا.
