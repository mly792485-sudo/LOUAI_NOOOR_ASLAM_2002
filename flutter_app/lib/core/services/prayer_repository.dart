import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'prayer_times_service.dart';

class PrayerLocation {
  const PrayerLocation({required this.latitude, required this.longitude, this.city, this.country, this.countryCode, this.timezone});
  final double latitude;
  final double longitude;
  final String? city;
  final String? country;
  final String? countryCode;
  final String? timezone;
}

class PrayerRepository {
  PrayerRepository({http.Client? client, SharedPreferences? preferences, this.officialBahrainFeed}) : _client = client ?? http.Client(), _preferences = preferences;
  final http.Client _client;
  final SharedPreferences? _preferences;
  final Uri? officialBahrainFeed;

  Future<PrayerTimesResult> fetchForLocation({required PrayerLocation location, DateTime? date, int? method, int? school}) async {
    final day = _dateOnly(date ?? DateTime.now());
    final selectedMethod = method ?? _methodForCountry(location.countryCode);
    final selectedSchool = school ?? 0;
    final cacheKey = _cacheKey(location, day, selectedMethod, selectedSchool);
    try {
      final result = await _fetchNetwork(location: location, date: day, method: selectedMethod, school: selectedSchool);
      await _saveCache(cacheKey, result);
      return result;
    } catch (_) {
      final cached = await _readCache(cacheKey, location: location, date: day, method: selectedMethod, school: selectedSchool);
      if (cached != null) return cached;
      rethrow;
    }
  }

  Future<PrayerTimesResult> fetchForCity({required String city, required String country, DateTime? date, int? method, int? school}) async {
    final day = _dateOnly(date ?? DateTime.now());
    final selectedMethod = method ?? _methodForCountry(null, country: country);
    final selectedSchool = school ?? 0;
    final uri = Uri.https('api.aladhan.com', '/v1/timingsByCity/${_apiDate(day)}', {'city': city, 'country': country, 'method': '$selectedMethod', 'school': '$selectedSchool'});
    final response = await _client.get(uri).timeout(const Duration(seconds: 15));
    final result = _decode(response, day, latitude: 0, longitude: 0, method: selectedMethod, school: selectedSchool, source: 'AlAdhan API / city');
    return result;
  }

  Future<PrayerTimesResult> _fetchNetwork({required PrayerLocation location, required DateTime date, required int method, required int school}) async {
    if (_isBahrain(location) && officialBahrainFeed != null) {
      final official = await _fetchOfficial(officialBahrainFeed!, date, location: location, method: method, school: school);
      if (official != null) return official;
    }
    final uri = Uri.https('api.aladhan.com', '/v1/timings/${_apiDate(date)}', {'latitude': '${location.latitude}', 'longitude': '${location.longitude}', 'method': '$method', 'school': '$school', 'latitudeAdjustmentMethod': 'angleBased'});
    return _decode(await _client.get(uri).timeout(const Duration(seconds: 15)), date, latitude: location.latitude, longitude: location.longitude, method: method, school: school, source: 'AlAdhan API / coordinates');
  }

  Future<PrayerTimesResult?> _fetchOfficial(Uri base, DateTime day, {required PrayerLocation location, required int method, required int school}) async {
    final response = await _client.get(base.replace(queryParameters: {...base.queryParameters, 'date': _apiDate(day)})).timeout(const Duration(seconds: 10));
    if (response.statusCode < 200 || response.statusCode >= 300) return null;
    final decoded = jsonDecode(response.body);
    final timings = decoded is Map<String, dynamic> ? decoded['timings'] : null;
    if (timings is! Map<String, dynamic>) return null;
    return PrayerTimesResult(prayers: prayerTimesFromApi(timings, day), date: day, latitude: location.latitude, longitude: location.longitude, timezone: location.timezone ?? 'Asia/Bahrain', method: method, school: school, source: 'Official local feed', cached: false);
  }

  PrayerTimesResult _decode(http.Response response, DateTime day, {required double latitude, required double longitude, required int method, required int school, required String source}) {
    if (response.statusCode != 200) throw Exception('تعذر تحديث مواقيت الصلاة (${response.statusCode})');
    final json = jsonDecode(response.body);
    if (json is! Map<String, dynamic> || json['code'] != 200) throw Exception('مصدر المواقيت أعاد بيانات غير صالحة');
    final data = json['data'];
    if (data is! Map<String, dynamic> || data['timings'] is! Map<String, dynamic>) throw Exception('بيانات المواقيت ناقصة');
    final meta = data['meta'];
    final timezone = meta is Map<String, dynamic> ? (meta['timezone']?.toString() ?? 'UTC') : 'UTC';
    final prayers = prayerTimesFromApi(data['timings'] as Map<String, dynamic>, day);
    if (prayers.length < 6) throw Exception('لم تصل جميع أوقات الصلاة');
    return PrayerTimesResult(prayers: prayers, date: day, latitude: latitude, longitude: longitude, timezone: timezone, method: method, school: school, source: source, cached: false);
  }

  Future<void> _saveCache(String key, PrayerTimesResult result) async {
    final prefs = _preferences ?? await SharedPreferences.getInstance();
    await prefs.setString(key, jsonEncode(result.toJson()));
  }

  Future<PrayerTimesResult?> _readCache(String key, {required PrayerLocation location, required DateTime date, required int method, required int school}) async {
    final prefs = _preferences ?? await SharedPreferences.getInstance();
    final raw = prefs.getString(key);
    if (raw == null) return null;
    final json = jsonDecode(raw);
    if (json is! Map<String, dynamic> || json['date'] != prayerDateKey(date)) return null;
    final prayers = (json['prayers'] as List<dynamic>? ?? const []).whereType<Map<String, dynamic>>().map((p) => PrayerTime(name: p['name'].toString(), arabicName: p['arabicName'].toString(), time: p['time'].toString(), date: date)).toList(growable: false);
    if (prayers.length < 6) return null;
    return PrayerTimesResult(prayers: prayers, date: date, latitude: (json['latitude'] as num?)?.toDouble() ?? location.latitude, longitude: (json['longitude'] as num?)?.toDouble() ?? location.longitude, timezone: json['timezone']?.toString() ?? location.timezone ?? 'UTC', method: method, school: school, source: '${json['source'] ?? 'cached'} / offline cache', cached: true);
  }

  String _cacheKey(PrayerLocation location, DateTime date, int method, int school) => 'prayer_times_v2_${location.latitude.toStringAsFixed(3)}_${location.longitude.toStringAsFixed(3)}_${prayerDateKey(date)}_${method}_$school';
  bool _isBahrain(PrayerLocation location) => location.countryCode?.toUpperCase() == 'BH' || (location.latitude > 25 && location.latitude < 27.5 && location.longitude > 49.5 && location.longitude < 51.5);
  int _methodForCountry(String? code, {String? country}) { final value = (code ?? country ?? '').toLowerCase(); if (value.contains('sa') || value.contains('السعود')) return 4; if (value.contains('eg') || value.contains('مصر')) return 5; if (value.contains('bh') || value.contains('بحرين')) return 7; if (value.contains('kw') || value.contains('كويت')) return 9; if (value.contains('qa') || value.contains('قطر')) return 10; return 3; }
  DateTime _dateOnly(DateTime date) => DateTime(date.year, date.month, date.day);
  String _apiDate(DateTime date) => '${date.day.toString().padLeft(2, '0')}-${date.month.toString().padLeft(2, '0')}-${date.year}';
  void dispose() => _client.close();
}
