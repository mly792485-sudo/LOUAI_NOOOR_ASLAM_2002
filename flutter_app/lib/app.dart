import 'package:flutter/material.dart';

import 'core/services/device_services.dart';
import 'features/home/presentation/home_page.dart';
import 'features/onboarding/presentation/onboarding_page.dart';

class NoorAlIslamApp extends StatelessWidget {
  const NoorAlIslamApp({super.key});

  @override
  Widget build(BuildContext context) {
    const emerald = Color(0xFF0B6B57);
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'نور الإسلام',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: emerald, brightness: Brightness.light),
        fontFamily: 'sans',
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: emerald, brightness: Brightness.dark),
        scaffoldBackgroundColor: const Color(0xFF071012),
      ),
      themeMode: ThemeMode.system,
      home: const _StartupGate(),
    );
  }
}

class _StartupGate extends StatefulWidget {
  const _StartupGate();
  @override
  State<_StartupGate> createState() => _StartupGateState();
}

class _StartupGateState extends State<_StartupGate> {
  final _store = SettingsStore();
  late final Future<bool> _ready = _store.getBool('onboarding_complete');

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _ready,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Scaffold(body: Center(child: CircularProgressIndicator()));
        return snapshot.data! ? const HomePage() : const OnboardingPage();
      },
    );
  }
}
