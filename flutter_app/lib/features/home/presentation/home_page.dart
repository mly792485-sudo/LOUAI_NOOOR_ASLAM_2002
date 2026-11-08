import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/services/device_services.dart';
import '../../../core/services/noor_audio_service.dart';
import '../../../core/services/prayer_repository.dart';
import '../../../core/services/prayer_times_service.dart';
import '../../assistant/presentation/assistant_page.dart';
import '../../quran/presentation/mushaf_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _location = LocationService();
  final _repository = PrayerRepository();
  final _audio = NoorAudioService();
  Timer? _timer;
  DateTime _now = DateTime.now();
  PrayerTimesResult? _result;
  Object? _error;
  bool _loading = true;
  bool _playing = false;

  static const sections = <({IconData icon, String title, String subtitle})>[
    (icon: Icons.menu_book_rounded, title: 'القرآن الكريم', subtitle: 'مصحف كامل وتلاوات وتفسير'),
    (icon: Icons.access_time_rounded, title: 'مواقيت الصلاة', subtitle: 'مواقيت ديناميكية حسب الموقع والتاريخ'),
    (icon: Icons.wb_sunny_outlined, title: 'الأذكار', subtitle: 'أذكار الصباح والمساء والنوم'),
    (icon: Icons.auto_stories_rounded, title: 'الأحاديث النبوية', subtitle: 'مختارات موثوقة من السنة'),
    (icon: Icons.local_library_outlined, title: 'المكتبة الإسلامية', subtitle: 'كتب ودروس وإذاعات نافعة'),
    (icon: Icons.smart_toy_outlined, title: 'مستشار نور الإسلام', subtitle: 'مساعد بحثي مع مصادر وتنبيهات'),
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
    _loadPrayerTimes();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _repository.dispose();
    _audio.dispose();
    super.dispose();
  }

  Future<void> _loadPrayerTimes() async {
    setState(() { _loading = true; _error = null; });
    try {
      final position = await _location.currentPosition();
      final location = PrayerLocation(
        latitude: position?.latitude ?? 26.1300,
        longitude: position?.longitude ?? 50.5550,
        countryCode: position == null ? 'BH' : null,
        country: position == null ? 'البحرين' : null,
        city: position == null ? 'الرفاع' : null,
      );
      final result = await _repository.fetchForLocation(location: location);
      if (!mounted) return;
      setState(() { _result = result; _loading = false; });
    } catch (error) {
      if (!mounted) return;
      setState(() { _error = error; _loading = false; });
    }
  }

  PrayerTime? get _nextPrayer {
    final prayers = _result?.prayers.where((p) => p.name != 'Sunrise').toList() ?? const <PrayerTime>[];
    for (final prayer in prayers) {
      if (prayer.asDateTime().isAfter(_now)) return prayer;
    }
    return prayers.isEmpty ? null : prayers.first;
  }

  Duration get _remaining {
    final next = _nextPrayer;
    if (next == null) return Duration.zero;
    var target = next.asDateTime();
    if (!target.isAfter(_now)) target = target.add(const Duration(days: 1));
    return target.difference(_now);
  }

  String _countdown(Duration duration) => '${duration.inHours.toString().padLeft(2, '0')}:${duration.inMinutes.remainder(60).toString().padLeft(2, '0')}:${duration.inSeconds.remainder(60).toString().padLeft(2, '0')}';

  Future<void> _toggleAdhan() async {
    if (_playing) { await _audio.stop(); if (mounted) setState(() => _playing = false); return; }
    try { await _audio.playAsset('assets/audio/adhan.mp3'); if (mounted) setState(() => _playing = true); } catch (_) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذر تشغيل صوت الأذان'))); }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final next = _nextPrayer;
    return Directionality(textDirection: TextDirection.rtl, child: Scaffold(
      appBar: AppBar(title: const Text('نور الإسلام', style: TextStyle(fontWeight: FontWeight.w800)), actions: [IconButton(onPressed: _loadPrayerTimes, icon: const Icon(Icons.refresh_rounded), tooltip: 'تحديث المواقيت')]),
      body: ListView(padding: const EdgeInsets.fromLTRB(16, 12, 16, 28), children: [
        Card(elevation: 0, color: colors.primaryContainer, child: const Padding(padding: EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('أهلاً بك في نور الإسلام', style: TextStyle(fontSize: 23, fontWeight: FontWeight.w900)), SizedBox(height: 8), Text('مواقيت الصلاة تتحدث حسب موقعك وتاريخ اليوم، وليست أوقاتًا ثابتة.')]))),
        const SizedBox(height: 14),
        Card(elevation: 0, color: const Color(0xFF0B2420), child: Padding(padding: const EdgeInsets.all(18), child: _loading ? const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator(color: Colors.white))) : _error != null ? Column(children: [const Text('تعذر تحديث المواقيت', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)), const SizedBox(height: 8), Text('تحقق من الإنترنت أو اسمح بالموقع، ثم حاول مرة أخرى.', style: const TextStyle(color: Colors.white70), textAlign: TextAlign.center), const SizedBox(height: 12), FilledButton.icon(onPressed: _loadPrayerTimes, icon: const Icon(Icons.refresh), label: const Text('إعادة المحاولة'))]) : Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [const Text('الصلاة القادمة', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)), const SizedBox(height: 8), Text(next == null ? 'لا توجد بيانات بعد' : 'صلاة ${next.arabicName}', style: const TextStyle(color: Color(0xFFFFD166), fontSize: 24, fontWeight: FontWeight.w900)), const SizedBox(height: 8), Text(_countdown(_remaining), textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900, letterSpacing: 3)), if (next != null) Text('وقت الأذان ${next.time}', textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70)), const SizedBox(height: 8), Text(_result!.cached ? 'بيانات محفوظة من آخر تحديث — دون اتصال' : 'مصدر البيانات: ${_result!.source} | ${_result!.timezone}', textAlign: TextAlign.center, style: const TextStyle(color: Colors.white60, fontSize: 11)), const SizedBox(height: 12), FilledButton.icon(onPressed: _toggleAdhan, icon: Icon(_playing ? Icons.stop : Icons.volume_up), label: Text(_playing ? 'إيقاف الأذان' : 'تجربة صوت الأذان'))])),
        const SizedBox(height: 20),
        const Text('أوقات اليوم', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        if (_result != null) ..._result!.prayers.map((p) => Card(elevation: 0, child: ListTile(title: Text(p.arabicName, style: const TextStyle(fontWeight: FontWeight.w800)), trailing: Text(p.time, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)))),
        const SizedBox(height: 12), const Text('أقسام التطبيق', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)), const SizedBox(height: 8),
        ...sections.map((section) => Card(elevation: 0, margin: const EdgeInsets.only(bottom: 10), child: ListTile(leading: CircleAvatar(backgroundColor: colors.primaryContainer, child: Icon(section.icon, color: colors.primary)), title: Text(section.title, style: const TextStyle(fontWeight: FontWeight.w800)), subtitle: Text(section.subtitle), trailing: const Icon(Icons.chevron_left_rounded), onTap: () { if (section.title == 'القرآن الكريم') Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const MushafPage())); else if (section.title == 'مستشار نور الإسلام') Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const AssistantPage())); }))),
      ],),
    ));
  }
}
