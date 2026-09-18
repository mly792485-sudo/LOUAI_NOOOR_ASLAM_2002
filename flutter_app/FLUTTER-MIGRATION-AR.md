# مشروع نور الإسلام Flutter

هذا مجلد مستقل لإعادة بناء تطبيق نور الإسلام بلغة Dart/Flutter بدلاً من React/Capacitor.

## الهوية والمنصات

- Bundle ID iOS: `com.noor.alislam.noorApp`
- Android application ID: `com.noor.alislam.noorApp`
- Team ID: `2Z7U3H9ZDR`
- المنصات المفعلة: Android، iOS، Web، Windows، macOS، Linux.

## الهيكل الحالي

```text
lib/
├── app.dart
├── main.dart
├── core/
│   ├── constants/
│   ├── theme/
│   ├── routing/
│   └── services/
└── features/
    └── home/
        ├── data/
        ├── domain/
        └── presentation/
            └── home_page.dart
```

تم إنشاء الهيكل الأولي والواجهة الرئيسية فقط. الخطوة التالية هي نقل الميزات بالتدريج: المصحف، الصلاة، الأذكار، الإذاعات، الإشعارات، الذكاء الاصطناعي، الإعدادات، ثم التوقيع والنشر لكل منصة.

## أوامر التشغيل

```bash
flutter pub get
flutter analyze
flutter run -d chrome
```

يجب عدم حذف مشروع React الحالي حتى تكتمل الهجرة واختبار Flutter على الأجهزة الحقيقية.
