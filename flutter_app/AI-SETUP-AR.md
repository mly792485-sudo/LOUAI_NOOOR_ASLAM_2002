# تشغيل مستشار نور الإسلام في Flutter

## 1. نشر server.ts

يجب نشر `server.ts` على استضافة HTTPS مثل Render أو Railway أو Fly.io. لا تضع `OPENAI_API_KEY` داخل تطبيق Flutter.

في إعدادات الاستضافة أضف:

```text
OPENAI_API_KEY=مفتاحك السري
OPENAI_MODEL=gpt-4o-mini
PORT=10000
```

أمر التشغيل:

```bash
npm ci
npm run build
npm start
```

اختبر الخادم أولاً:

```bash
curl https://YOUR_DOMAIN/health
```

يجب أن تحصل على:

```json
{"ok":true,"service":"noor-al-islam-assistant"}
```

ثم اختبر المسار:

```bash
curl -X POST https://YOUR_DOMAIN/api/ai/qa \
  -H 'Content-Type: application/json' \
  -d '{"question":"ما فضل صلة الرحم؟"}'
```

## 2. بناء Flutter مع رابط الخادم

استبدل `https://YOUR_DOMAIN` بالرابط الحقيقي:

```bash
flutter pub get
flutter build apk --release --dart-define=ASSISTANT_BASE_URL=https://YOUR_DOMAIN
flutter build ipa --release --dart-define=ASSISTANT_BASE_URL=https://YOUR_DOMAIN
```

أو للتجربة:

```bash
flutter run --dart-define=ASSISTANT_BASE_URL=https://YOUR_DOMAIN
```

لا تستخدم `VITE_API_BASE_URL` في Flutter؛ ذلك المتغير خاص بنسخة React/Vite. في Flutter اسم المتغير هو:

```text
ASSISTANT_BASE_URL
```

## 3. سبب ظهور الخطأ

إذا بنيت التطبيق بدون `--dart-define` فسيظهر أن الرابط غير مهيأ، وهذا مقصود لحماية التطبيق من الاتصال بعنوان غير معروف. بعد وضع رابط HTTPS الحقيقي وإعادة البناء ستعمل شاشة «مستشار نور الإسلام».

## 4. حماية الخادم

- لا تضع مفتاح OpenAI داخل Flutter أو GitHub كمحتوى في المشروع.
- ضع المفتاح في Environment Variables في الاستضافة.
- لا تستخدم رابط `http://`؛ يجب استخدام `https://` في النسخة النهائية.
- اجعل الخادم يعالج الأخطاء ويرفض السؤال الفارغ.
