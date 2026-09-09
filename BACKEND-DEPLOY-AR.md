# نشر خادم مستشار نور الإسلام

أصبح المشروع يحتوي على `Dockerfile` و`render.yaml` ومسار فحص صحة الخادم `/health`. النشر يحتاج حساب استضافة خارجي؛ لا يمكن إنشاء الخدمة أو إدخال مفتاح OpenAI نيابةً عنك دون تسجيل الدخول إلى حساب الاستضافة.

## النشر عبر Render

1. افتح https://dashboard.render.com وسجّل الدخول بحساب GitHub.
2. اختر **New +** ثم **Blueprint**.
3. اختر مستودع `mly792485-sudo/LOUAI_NOOOR_ASLAM_2002` وفرع `main`.
4. سيقرأ Render ملف `render.yaml` وينشئ خدمة `noor-al-islam-assistant`.
5. افتح إعدادات الخدمة ثم **Environment** وأضف:
   - `OPENAI_API_KEY`: مفتاح OpenAI الخاص بك، ولا تضعه داخل التطبيق أو GitHub كنص عادي.
   - `OPENAI_MODEL`: `gpt-4o-mini`.
   - `APP_URL`: اتركه مؤقتاً فارغاً أثناء أول نشر، أو ضع رابط الخدمة إذا أردت تقييد CORS.
6. اضغط **Deploy** وانتظر نجاح البناء.
7. اختبر الرابط التالي، مع استبدال النطاق:

```text
https://YOUR-SERVICE.onrender.com/health
```

يجب أن تظهر نتيجة شبيهة بـ:

```json
{"ok":true,"service":"noor-al-islam-assistant"}
```

## ربط التطبيق

بعد الحصول على رابط Render، أضف في إعدادات GitHub Actions للمستودع متغيراً باسم:

```text
VITE_API_BASE_URL=https://YOUR-SERVICE.onrender.com
```

يمكن ضبطه من **Repository → Settings → Secrets and variables → Actions → New repository secret**. بعد ذلك شغّل workflow الخاص بـ iOS وAndroid من جديد، لأن `VITE_API_BASE_URL` يُضمَّن أثناء البناء.

## ملاحظات أمنية

لا تضع `OPENAI_API_KEY` في `VITE_*` ولا داخل ملفات `src/` أو داخل الهاتف. التطبيق يرسل السؤال إلى الخادم، والخادم وحده يتصل بـ OpenAI. إذا كان الخادم على خطة مجانية فقد يتوقف بعد فترة خمول ويحتاج ثواني إضافية عند أول طلب.

## التواصل داخل التطبيق

تم ضبط بيانات المطور في التطبيق إلى:

- واتساب: `+97366903171`
- البريد: `lwya0721@gmail.com`
- سناب شات: https://snapchat.com/t/Zqgsr5Cz

## اختبار الصوت

بعد تثبيت النسخة الجديدة احذف النسخة القديمة من الهاتف أو احذف قنوات الإشعارات القديمة من إعدادات النظام. تم رفع معرفات القنوات إلى إصدار جديد، وتم ضبط أسماء ملفات الصوت بحيث تستخدم iOS الامتداد `.wav` وAndroid اسم المورد بدون امتداد.
