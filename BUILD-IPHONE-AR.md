# مشروع نور الإسلام — iPhone

هذا المشروع يحتوي على كود التطبيق المشترك ومشروع Capacitor/iOS الخاص بـ Xcode.

## المتطلبات

- جهاز Mac.
- Xcode حديث.
- حساب Apple Developer.
- Bundle ID مطابق في Apple Developer: `com.noor.alislam`.
- إعداد خادم ChatGPT ووضع `OPENAI_API_KEY` في الخادم فقط.

## البناء

من مجلد المشروع:

```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

افتح المشروع:

```text
ios/App/App.xcodeproj
```

داخل Xcode اختر Team وحساب التوقيع، ثم نفّذ Archive من جهاز iPhone حقيقي أو جهاز Mac مناسب، وبعدها ارفع النسخة من Organizer إلى App Store Connect.

## ملاحظات

ملفات `ios/App/App/public` ناتجة عن البناء ويمكن إعادة إنشائها بواسطة `npm run build` ثم `npx cap sync ios`. لا تضع مفتاح OpenAI داخل التطبيق.
