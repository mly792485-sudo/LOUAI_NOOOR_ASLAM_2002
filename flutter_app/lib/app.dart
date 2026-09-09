import 'package:flutter/material.dart';

import 'features/home/presentation/home_page.dart';

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
        colorScheme: ColorScheme.fromSeed(
          seedColor: emerald,
          brightness: Brightness.light,
        ),
        fontFamily: 'sans',
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: emerald,
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF071012),
      ),
      themeMode: ThemeMode.system,
      home: const HomePage(),
    );
  }
}
