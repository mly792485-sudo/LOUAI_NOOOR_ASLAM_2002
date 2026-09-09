import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NoorNotificationService {
  NoorNotificationService()
    : _notifications = FlutterLocalNotificationsPlugin();
  final FlutterLocalNotificationsPlugin _notifications;

  Future<void> initialize() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings();
    await _notifications.initialize(
      const InitializationSettings(android: android, iOS: ios),
    );
  }

  Future<bool> requestPermissions() async {
    final android = await _notifications
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.requestNotificationsPermission();
    final ios = await _notifications
        .resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin
        >()
        ?.requestPermissions(alert: true, badge: true, sound: true);
    return android == true || ios == true;
  }
}
