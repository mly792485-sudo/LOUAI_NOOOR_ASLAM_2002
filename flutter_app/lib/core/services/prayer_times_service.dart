import 'dart:async';

class PrayerTime {
  const PrayerTime({
    required this.name,
    required this.arabicName,
    required this.time,
  });
  final String name;
  final String arabicName;
  final String time;
}

class PrayerTimesService {
  PrayerTimesService({this.city = 'الرفاع'});
  final String city;

  // Official Bahrain calendar baseline used by the existing app.
  List<PrayerTime> today() {
    final riffa = city == 'الرفاع';
    return [
      PrayerTime(
        name: 'Fajr',
        arabicName: 'الفجر',
        time: riffa ? '03:49' : '03:48',
      ),
      PrayerTime(
        name: 'Sunrise',
        arabicName: 'الشروق',
        time: riffa ? '05:11' : '05:10',
      ),
      const PrayerTime(name: 'Dhuhr', arabicName: 'الظهر', time: '11:46'),
      const PrayerTime(name: 'Asr', arabicName: 'العصر', time: '15:12'),
      const PrayerTime(name: 'Maghrib', arabicName: 'المغرب', time: '18:23'),
      const PrayerTime(name: 'Isha', arabicName: 'العشاء', time: '19:53'),
    ];
  }

  PrayerTime next(DateTime now) {
    final seconds = now.hour * 3600 + now.minute * 60 + now.second;
    for (final prayer in today()) {
      final parts = prayer.time.split(':').map(int.parse).toList();
      if (parts[0] * 3600 + parts[1] * 60 >= seconds) return prayer;
    }
    return today().first;
  }

  Duration remaining(DateTime now) {
    final prayer = next(now);
    final parts = prayer.time.split(':').map(int.parse).toList();
    var target = DateTime(now.year, now.month, now.day, parts[0], parts[1]);
    if (!target.isAfter(now)) target = target.add(const Duration(days: 1));
    return target.difference(now);
  }

  Stream<DateTime> clock() => Stream<DateTime>.periodic(
    const Duration(seconds: 1),
    (_) => DateTime.now(),
  );
}
