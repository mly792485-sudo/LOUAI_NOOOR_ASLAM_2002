import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/services/noor_audio_service.dart';
import '../../../core/services/prayer_times_service.dart';
import '../../quran/presentation/mushaf_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _prayers = PrayerTimesService();
  final _audio = NoorAudioService();
  late DateTime _now;
  Timer? _timer;
  bool _playing = false;

  static const sections = <({IconData icon, String title, String subtitle})>[
    (
      icon: Icons.menu_book_rounded,
      title: 'القرآن الكريم',
      subtitle: 'مصحف كامل وتلاوات وتفسير',
    ),
    (
      icon: Icons.access_time_rounded,
      title: 'مواقيت الصلاة',
      subtitle: 'مواقيت دقيقة واتجاه القبلة',
    ),
    (
      icon: Icons.wb_sunny_outlined,
      title: 'الأذكار',
      subtitle: 'أذكار الصباح والمساء والنوم',
    ),
    (
      icon: Icons.auto_stories_rounded,
      title: 'الأحاديث النبوية',
      subtitle: 'مختارات موثوقة من السنة',
    ),
    (
      icon: Icons.local_library_outlined,
      title: 'المكتبة الإسلامية',
      subtitle: 'كتب ودروس وإذاعات نافعة',
    ),
    (
      icon: Icons.smart_toy_outlined,
      title: 'مستشار نور الإسلام',
      subtitle: 'مساعد بحثي مع مصادر وتنبيهات',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _now = DateTime.now();
    _timer = Timer.periodic(
      const Duration(seconds: 1),
      (_) => setState(() => _now = DateTime.now()),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _audio.dispose();
    super.dispose();
  }

  String _countdown(Duration duration) {
    final hours = duration.inHours.toString().padLeft(2, '0');
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  Future<void> _toggleAdhan() async {
    if (_playing) {
      await _audio.stop();
      setState(() => _playing = false);
      return;
    }
    try {
      await _audio.playAsset('assets/audio/adhan.mp3');
      if (mounted) setState(() => _playing = true);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('تعذر تشغيل صوت الأذان')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final nextPrayer = _prayers.next(_now);
    final remaining = _prayers.remaining(_now);
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text(
            'نور الإسلام',
            style: TextStyle(fontWeight: FontWeight.w800),
          ),
          actions: [
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.settings_outlined),
              tooltip: 'الإعدادات',
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
          children: [
            Card(
              elevation: 0,
              color: colors.primaryContainer,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'أهلاً بك في نور الإسلام',
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'مشروع Flutter موحد لنظامي iPhone وAndroid وبقية المنصات.',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            Card(
              elevation: 0,
              color: const Color(0xFF0B2420),
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'العد التنازلي للصلاة القادمة',
                      style: TextStyle(
                        color: Colors.white70,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'صلاة ${nextPrayer.arabicName}',
                      style: const TextStyle(
                        color: Color(0xFFFFD166),
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _countdown(remaining),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 34,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 3,
                      ),
                    ),
                    Text(
                      'وقت الأذان ${nextPrayer.time}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white70),
                    ),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: _toggleAdhan,
                      icon: Icon(_playing ? Icons.stop : Icons.volume_up),
                      label: Text(
                        _playing ? 'إيقاف الأذان' : 'تجربة صوت الأذان',
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'أقسام التطبيق',
              style: Theme.of(context).textTheme.titleLarge
                  ?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 10),
            ...sections.map(
              (section) => Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: colors.primaryContainer,
                    child: Icon(section.icon, color: colors.primary),
                  ),
                  title: Text(
                    section.title,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  subtitle: Text(section.subtitle),
                  trailing: const Icon(Icons.chevron_left_rounded),
                  onTap: () {
                    if (section.title == 'القرآن الكريم') {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const MushafPage(),
                        ),
                      );
                    }
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
