# مشروع نور الإسلام — Android

هذا المشروع يحتوي على كود التطبيق المشترك ومشروع Capacitor/Android الخاص بـ Android Studio.

## المتطلبات

- Android Studio حديث.
- Android SDK وJDK المتوافقان مع إصدار Capacitor.
- حساب Google Play Console عند النشر.
- إعداد خادم ChatGPT ووضع `OPENAI_API_KEY` في الخادم فقط.

## البناء

من مجلد المشروع:

```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

افتح مجلد:

```text
android/
```

من Android Studio اختر جهازًا أو محاكيًا للاختبار. للنشر أنشئ ملف Android App Bundle بصيغة `AAB` من قائمة Build، واضبط Keystore خاصًا وآمنًا لا ترفعه إلى GitHub.

## إنشاء APK من GitHub

يوجد ملف Workflow جاهز في:

```text
.github/workflows/build-android.yml
```

بعد رفع المشروع إلى GitHub:

1. افتح تبويب **Actions**.
2. اختر **Build Android APK and AAB**.
3. اضغط **Run workflow** أو ادفع Commit إلى فرع `main`.
4. بعد انتهاء البناء افتح صفحة التشغيل الناجح.
5. من أسفل الصفحة نزّل Artifact باسم `noor-al-islam-debug-apk`.
6. فك ضغط Artifact وستجد `app-debug.apk`.

ملف Debug APK مناسب للتجربة على الهاتف. أما Google Play فيحتاج AAB موقّعًا بمفتاح Keystore خاص؛ الملف الناتج من Workflow غير موقّع ولا يُرفع مباشرة إلى المتجر.

## تثبيت APK على الهاتف

للتجربة نزّل Artifact باسم `noor-al-islam-debug-apk` ثم فك الضغط وثبّت `app-debug.apk`. لا تثبّت `app-release-unsigned.apk`؛ لأنه غير موقّع وسيعرض Android رسالة أن الحزمة غير صالحة. إذا كان إصدار قديم من التطبيق مثبتًا، احذفه أولًا أو استخدم نفس توقيع الإصدار السابق.

## ملاحظات

ملفات `android/app/src/main/assets/public` ناتجة عن البناء ويمكن إعادة إنشائها بواسطة `npm run build` ثم `npx cap sync android`. صوت الإشعار القصير موجود في `android/app/src/main/res/raw/adhan_notification.wav`. لا تضع مفتاح OpenAI داخل التطبيق.
