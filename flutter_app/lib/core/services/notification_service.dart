import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

class PrayerNotification {
  const PrayerNotification({
    required this.name,
    required this.arabicName,
    required this.prayerAt,
    required this.iqamaAt,
  });
  final String name;
  final String arabicName;
  final DateTime prayerAt;
  final DateTime iqamaAt;
}

class NoorNotificationService {
  NoorNotificationService()
    : _notifications = FlutterLocalNotificationsPlugin();
  final FlutterLocalNotificationsPlugin _notifications;

  static const prayerChannelId = 'noor_prayer_audio_v1';
  static const iqamaChannelId = 'noor_iqama_audio_v1';
  static const prayerIds = <int>{101, 102, 103, 104, 105};

  Future<void> initialize() async {
    tzdata.initializeTimeZones();
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings();
    await _notifications.initialize(
      const InitializationSettings(android: android, iOS: ios),
    );
    final androidPlugin = _notifications
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >();
    await androidPlugin?.createNotificationChannel(
      const AndroidNotificationChannel(
        prayerChannelId,
        'أذان الصلوات الخمس',
        description:
            'تنبيه واحد عند دخول وقت صلاة الفجر والظهر والعصر والمغرب والعشاء',
        importance: Importance.max,
        playSound: true,
        sound: RawResourceAndroidNotificationSound('adhan_notification'),
      ),
    );
    await androidPlugin?.createNotificationChannel(
      const AndroidNotificationChannel(
        iqamaChannelId,
        'الإقامة',
        description: 'تنبيه واحد للإقامة بعد وقت الصلاة',
        importance: Importance.max,
        playSound: true,
        sound: RawResourceAndroidNotificationSound('adhan_notification'),
      ),
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

  Future<void> replacePrayerSchedule(
    Iterable<PrayerNotification> prayers,
  ) async {
    await initialize();
    await _cancelPrayerNotifications();
    for (final prayer in prayers.where(
      (item) => _isFiveDailyPrayer(item.name),
    )) {
      await _schedule(prayer, isIqama: false);
      await _schedule(prayer, isIqama: true);
    }
  }

  Future<void> scheduleAzkarReminder({
    required int id,
    required String title,
    required DateTime at,
  }) async {
    await initialize();
    await _notifications.cancel(id);
    await _notifications.zonedSchedule(
      id,
      title,
      'حان وقت الذكر',
      _tzDate(at),
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'noor_azkar_reminders_v1',
          'تذكيرات الأذكار',
          channelDescription: 'تذكير هادئ بأوقات الأذكار بدون أذان',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
          playSound: false,
          enableVibration: false,
          autoCancel: true,
          timeoutAfter: 5000,
        ),
        iOS: DarwinNotificationDetails(presentSound: false),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  }

  Future<void> scheduleDailyAzkarReminders({
    required DateTime morning,
    required DateTime evening,
    required DateTime sleep,
    required DateTime witr,
    DateTime? kahf,
  }) async {
    await scheduleAzkarReminder(
      id: 201,
      title: 'حان وقت أذكار الصباح',
      at: morning,
    );
    await scheduleAzkarReminder(
      id: 202,
      title: 'حان وقت أذكار المساء',
      at: evening,
    );
    await scheduleAzkarReminder(
      id: 203,
      title: 'حان وقت أذكار النوم',
      at: sleep,
    );
    await scheduleAzkarReminder(
      id: 204,
      title: 'حان وقت الوتر وقيام الليل',
      at: witr,
    );
    if (kahf != null) {
      await scheduleAzkarReminder(
        id: 205,
        title: 'تذكير قراءة سورة الكهف',
        at: kahf,
      );
    }
  }

  Future<void> cancelAzkarReminders() async {
    for (final id in [201, 202, 203, 204, 205]) {
      await _notifications.cancel(id);
    }
  }

  bool _isFiveDailyPrayer(String name) =>
      const {'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'}.contains(name);

  Future<void> _schedule(
    PrayerNotification prayer, {
    required bool isIqama,
  }) async {
    final at = isIqama ? prayer.iqamaAt : prayer.prayerAt;
    if (!at.isAfter(DateTime.now())) return;
    await _notifications.zonedSchedule(
      _idFor(prayer.name, isIqama),
      isIqama
          ? 'حان وقت إقامة صلاة ${prayer.arabicName}'
          : 'حان الآن وقت أذان ${prayer.arabicName}',
      isIqama ? 'استعد للصلاة' : 'حي على الصلاة، حي على الفلاح',
      _tzDate(at),
      NotificationDetails(
        android: AndroidNotificationDetails(
          isIqama ? iqamaChannelId : prayerChannelId,
          isIqama ? 'الإقامة' : 'أذان الصلوات الخمس',
          importance: Importance.max,
          priority: Priority.max,
          playSound: true,
          sound: const RawResourceAndroidNotificationSound(
            'adhan_notification',
          ),
        ),
        iOS: const DarwinNotificationDetails(
          sound: 'adhan_notification.wav',
          presentSound: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  }

  Future<void> _cancelPrayerNotifications() async {
    for (final id in prayerIds) {
      await _notifications.cancel(id);
      await _notifications.cancel(id + 1000);
    }
  }

  int _idFor(String name, bool iqama) {
    const ids = {
      'Fajr': 101,
      'Dhuhr': 102,
      'Asr': 103,
      'Maghrib': 104,
      'Isha': 105,
    };
    return (ids[name] ?? 199) + (iqama ? 1000 : 0);
  }

  // Kept in one place so a timezone database can be introduced without changing callers.
  tz.TZDateTime _tzDate(DateTime date) => tz.TZDateTime.from(date, tz.local);
}
