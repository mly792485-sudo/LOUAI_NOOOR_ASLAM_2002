import 'package:intl/intl.dart';

class PrayerTime {
  const PrayerTime({required this.name, required this.arabicName, required this.time, required this.date});
  final String name;
  final String arabicName;
  final String time;
  final DateTime date;

  DateTime asDateTime() {
    final parts = time.split(':').map(int.parse).toList();
    return DateTime(date.year, date.month, date.day, parts[0], parts[1]);
  }
}

class PrayerTimesResult {
  const PrayerTimesResult({required this.prayers, required this.date, required this.latitude, required this.longitude, required this.timezone, required this.method, required this.school, required this.source, required this.cached});
  final List<PrayerTime> prayers;
  final DateTime date;
  final double latitude;
  final double longitude;
  final String timezone;
  final int method;
  final int school;
  final String source;
  final bool cached;

  bool get isForToday {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  Map<String, dynamic> toJson() => {
        'date': DateFormat('yyyy-MM-dd').format(date),
        'latitude': latitude,
        'longitude': longitude,
        'timezone': timezone,
        'method': method,
        'school': school,
        'source': source,
        'cached': cached,
        'prayers': prayers.map((p) => {'name': p.name, 'arabicName': p.arabicName, 'time': p.time}).toList(),
      };
}

class PrayerCalculationProfile {
  const PrayerCalculationProfile({required this.method, required this.name, this.school = 0, this.highLatitudeRule = 'AngleBased'});
  final int method;
  final String name;
  final int school;
  final String highLatitudeRule;

  static const profiles = <PrayerCalculationProfile>[
    PrayerCalculationProfile(method: 3, name: 'رابطة العالم الإسلامي'),
    PrayerCalculationProfile(method: 4, name: 'الهيئة المصرية العامة للمساحة'),
    PrayerCalculationProfile(method: 2, name: 'ISNA'),
    PrayerCalculationProfile(method: 1, name: 'جامعة العلوم الإسلامية - كراتشي'),
    PrayerCalculationProfile(method: 5, name: 'أم القرى'),
    PrayerCalculationProfile(method: 7, name: 'منطقة الخليج'),
    PrayerCalculationProfile(method: 8, name: 'الكويت'),
    PrayerCalculationProfile(method: 9, name: 'قطر'),
    PrayerCalculationProfile(method: 10, name: 'سنغافورة'),
    PrayerCalculationProfile(method: 13, name: 'تركيا'),
    PrayerCalculationProfile(method: 14, name: 'طهران / جعفري'),
  ];
}

String prayerDateKey(DateTime date) => DateFormat('yyyy-MM-dd').format(date);
String normalizePrayerTime(String value) => value.split(' ').first.trim();

List<PrayerTime> prayerTimesFromApi(Map<String, dynamic> timings, DateTime date) {
  const names = <String, String>{'Fajr': 'الفجر', 'Sunrise': 'الشروق', 'Dhuhr': 'الظهر', 'Asr': 'العصر', 'Maghrib': 'المغرب', 'Isha': 'العشاء'};
  return names.entries.map((entry) => PrayerTime(name: entry.key, arabicName: entry.value, time: normalizePrayerTime((timings[entry.key] ?? '').toString()), date: DateTime(date.year, date.month, date.day))).where((item) => RegExp(r'^\d{1,2}:\d{2}$').hasMatch(item.time)).toList(growable: false);
}
