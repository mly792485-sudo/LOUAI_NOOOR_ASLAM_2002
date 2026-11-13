import 'dart:convert';

import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LocationSnapshot {
  const LocationSnapshot({
    required this.position,
    this.city,
    this.region,
    this.country,
    this.countryCode,
  });

  final Position position;
  final String? city;
  final String? region;
  final String? country;
  final String? countryCode;

  String get displayName => [city, region, country]
      .whereType<String>()
      .where((value) => value.trim().isNotEmpty)
      .toSet()
      .join('، ');
}

class LocationException implements Exception {
  const LocationException(this.message);
  final String message;
  @override
  String toString() => message;
}

class LocationService {
  Future<LocationSnapshot> currentLocation() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw const LocationException('خدمات الموقع متوقفة. فعّل الموقع من إعدادات الجهاز ثم حاول مرة أخرى.');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied) {
      throw const LocationException('تم رفض إذن الموقع. يمكنك المتابعة بدون موقع أو السماح به من إعدادات الجهاز.');
    }
    if (permission == LocationPermission.deniedForever) {
      throw const LocationException('تم رفض إذن الموقع نهائيًا. افتح إعدادات التطبيق للسماح بالموقع.');
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 20),
        ),
      );
      final place = await _reverseGeocode(position.latitude, position.longitude);
      return LocationSnapshot(
        position: position,
        city: place.city,
        region: place.region,
        country: place.country,
        countryCode: place.countryCode,
      );
    } on LocationException {
      rethrow;
    } catch (_) {
      throw const LocationException('تعذر تحديد موقعك الآن. تحقق من GPS والإنترنت ثم أعد المحاولة.');
    }
  }

  Future<_Place> _reverseGeocode(double latitude, double longitude) async {
    try {
      final uri = Uri.https('nominatim.openstreetmap.org', '/reverse', {
        'lat': '$latitude',
        'lon': '$longitude',
        'format': 'jsonv2',
        'zoom': '10',
        'accept-language': 'ar',
      });
      final response = await http.get(
        uri,
        headers: {'User-Agent': 'NoorAlIslam/1.0 (contact@noor-al-islam.app)'},
      ).timeout(const Duration(seconds: 10));
      if (response.statusCode != 200) return const _Place();
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final address = (json['address'] as Map<String, dynamic>?) ?? const {};
      return _Place(
        city: (address['city'] ?? address['town'] ?? address['village'] ?? address['municipality']) as String?,
        region: (address['state'] ?? address['region']) as String?,
        country: address['country'] as String?,
        countryCode: (address['country_code'] as String?)?.toUpperCase(),
      );
    } catch (_) {
      return const _Place();
    }
  }

  Future<Position?> currentPosition() async {
    try {
      return (await currentLocation()).position;
    } on LocationException {
      return null;
    }
  }
}

class _Place {
  const _Place({this.city, this.region, this.country, this.countryCode});
  final String? city;
  final String? region;
  final String? country;
  final String? countryCode;
}

class SettingsStore {
  Future<SharedPreferences> get _prefs => SharedPreferences.getInstance();

  Future<void> setString(String key, String value) async => (await _prefs).setString(key, value);
  Future<String?> getString(String key) async => (await _prefs).getString(key);
  Future<void> setDouble(String key, double value) async => (await _prefs).setDouble(key, value);
  Future<double?> getDouble(String key) async => (await _prefs).getDouble(key);
  Future<void> setBool(String key, bool value) async => (await _prefs).setBool(key, value);
  Future<bool> getBool(String key, {bool fallback = false}) async => (await _prefs).getBool(key) ?? fallback;
}
