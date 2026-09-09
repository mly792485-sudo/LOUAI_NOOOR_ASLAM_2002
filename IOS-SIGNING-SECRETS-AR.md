# إعداد توقيع iOS ورفع IPA إلى App Store

تم اعتماد Bundle ID التالي في المشروع:

```text
com.noor.alislam.noorApp
```

وتمت مطابقة ملف `Noor_Al_Islam_Distribution.mobileprovision` بنجاح:

- Team ID: `2Z7U3H9ZDR`
- UUID: `0681afbf-5708-44e7-937d-8a24d75af0d8`
- النوع: App Store Distribution
- تاريخ الانتهاء: 13 يونيو 2027
- `get-task-allow`: `false`

## الأسرار المطلوبة

من صفحة المستودع على GitHub:

`Settings → Secrets and variables → Actions → New repository secret`

أضف الأسرار التالية:

| الاسم | القيمة |
|---|---|
| `IOS_PROFILE_BASE64` | محتوى ملف Provisioning Profile بعد تحويله إلى Base64 |
| `IOS_CERTIFICATE_BASE64` | محتوى شهادة Apple Distribution بصيغة `.p12` بعد تحويلها إلى Base64 |
| `IOS_CERTIFICATE_PASSWORD` | كلمة مرور ملف `.p12` |
| `KEYCHAIN_PASSWORD` | كلمة مرور مؤقتة من اختيارك لسلسلة مفاتيح GitHub Actions |
| `VITE_API_BASE_URL` | رابط HTTPS لخادم مستشار نور الإسلام |

## تحويل الملفات إلى Base64

على macOS أو Linux نفّذ:

```bash
base64 -i Noor_Al_Islam_Distribution.mobileprovision | pbcopy
```

ثم الصق الناتج في Secret باسم `IOS_PROFILE_BASE64`.

وبالنسبة للشهادة:

```bash
base64 -i Noor_Al_Islam_Distribution.p12 | pbcopy
```

ثم الصق الناتج في Secret باسم `IOS_CERTIFICATE_BASE64`.

على Windows PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("Noor_Al_Islam_Distribution.mobileprovision"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("Noor_Al_Islam_Distribution.p12"))
```

## تشغيل Workflow

بعد حفظ الأسرار:

1. افتح تبويب **Actions** في GitHub.
2. اختر **Build signed iOS IPA - Noor Al-Islam**.
3. اضغط **Run workflow**.
4. بعد نجاح البناء حمّل Artifact باسم:

```text
noor-al-islam-ios-app-store-ipa
```

## ملاحظة مهمة

ملف `.mobileprovision` وحده لا يكفي للتوقيع. يجب أن يكون لديك ملف شهادة Apple Distribution بصيغة `.p12` ومعه كلمة المرور. لا ترفع الشهادة أو المفتاح الخاص إلى المستودع، ولا ترسل كلمة المرور في رسالة عامة؛ ضعها فقط في GitHub Secrets.

الـ Workflow القديم يبني IPA غير موقع للاختبار فقط، أما Workflow الجديد `build-ios-signed.yml` فهو المخصص لإنشاء IPA موقع بطريقة App Store.
