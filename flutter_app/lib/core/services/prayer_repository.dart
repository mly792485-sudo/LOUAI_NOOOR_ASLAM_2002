import 'dart:convert';

import 'package:http/http.dart' as http;

import 'prayer_times_service.dart';

class PrayerRepository {
  PrayerRepository({http.Client? client, this.officialBahrainFeed})
    : _client = client ?? http.Client();
  final http.Client _client;
  final Uri? officialBahrainFeed;

  Future<List<PrayerTime>> fetch({
    required String city,
    required String country,
    DateTime? date,
  }) async {
    final day = date ?? DateTime.now();
    if (country.toLowerCase() == 'bahrain' && officialBahrainFeed != null) {
      final official = await _fetchOfficial(officialBahrainFeed!, day);
      if (official.isNotEmpty) return official;
    }

    final uri = Uri.https(
      'api.aladhan.com',
      '/v1/timingsByCity/${_date(day)}',
      {'city': city, 'country': country, 'method': '4', 'school': '0'},
    );
    final response = await _client.get(uri);
    if (response.statusCode != 200) {
      throw Exception('تعذر تحديث مواقيت الصلاة من المصدر الشبكي');
    }
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final timings =
        ((json['data'] as Map<String, dynamic>)['timings']
            as Map<String, dynamic>);
    return _fromMap(timings);
  }

  Future<List<PrayerTime>> _fetchOfficial(Uri uri, DateTime day) async {
    final response = await _client.get(
      uri.replace(queryParameters: {'date': _date(day)}),
    );
    if (response.statusCode != 200) return const [];
    final json = jsonDecode(response.body);
    final map = json is Map<String, dynamic> ? json['timings'] : null;
    return map is Map<String, dynamic> ? _fromMap(map) : const [];
  }

  List<PrayerTime> _fromMap(Map<String, dynamic> timings) {
    const names = {
      'Fajr': 'الفجر',
      'Sunrise': 'الشروق',
      'Dhuhr': 'الظهر',
      'Asr': 'العصر',
      'Maghrib': 'المغرب',
      'Isha': 'العشاء',
    };
    return names.entries
        .map((entry) {
          final raw = (timings[entry.key] ?? '').toString().split(' ').first;
          return PrayerTime(
            name: entry.key,
            arabicName: entry.value,
            time: raw,
          );
        })
        .where((item) => item.time.contains(':'))
        .toList();
  }

  String _date(DateTime date) =>
      '${date.day.toString().padLeft(2, '0')}-${date.month.toString().padLeft(2, '0')}-${date.year}';

  void dispose() => _client.close();
}
