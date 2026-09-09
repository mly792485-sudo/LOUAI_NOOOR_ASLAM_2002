import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocationService {
  Future<Position?> currentPosition() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      return null;
    }
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      return null;
    }
    return Geolocator.getCurrentPosition();
  }
}

class SettingsStore {
  Future<SharedPreferences> get _prefs => SharedPreferences.getInstance();

  Future<void> setString(String key, String value) async =>
      (await _prefs).setString(key, value);
  Future<String?> getString(String key) async => (await _prefs).getString(key);
  Future<void> setBool(String key, bool value) async =>
      (await _prefs).setBool(key, value);
  Future<bool> getBool(String key, {bool fallback = false}) async =>
      (await _prefs).getBool(key) ?? fallback;
}
