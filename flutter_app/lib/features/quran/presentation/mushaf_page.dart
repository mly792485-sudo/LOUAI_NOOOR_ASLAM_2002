import 'package:flutter/material.dart';

class MushafPage extends StatefulWidget {
  const MushafPage({super.key});

  @override
  State<MushafPage> createState() => _MushafPageState();
}

class _MushafPageState extends State<MushafPage> {
  static const pageCount = 604;
  final controller = PageController();
  int page = 1;

  String get imageUrl =>
      'https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master/${page.toString().padLeft(3, '0')}.png';

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void changePage(int value) {
    final next = value.clamp(1, pageCount);
    setState(() => page = next);
    controller.animateToPage(
      next - 1,
      duration: const Duration(milliseconds: 240),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFE8DFCC),
        appBar: AppBar(
          backgroundColor: const Color(0xFF063B32),
          foregroundColor: Colors.white,
          title: Text('المصحف الشريف · صفحة $page من $pageCount'),
          actions: [
            IconButton(
              onPressed: () => changePage(page),
              icon: const Icon(Icons.refresh_rounded),
            ),
          ],
        ),
        body: PageView.builder(
          controller: controller,
          reverse: true,
          itemCount: pageCount,
          onPageChanged: (index) => setState(() => page = index + 1),
          itemBuilder: (context, index) => InteractiveViewer(
            minScale: 1,
            maxScale: 3,
            child: Center(
              child: Image.network(
                'https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master/${(index + 1).toString().padLeft(3, '0')}.png',
                fit: BoxFit.contain,
                loadingBuilder: (context, child, progress) => progress == null
                    ? child
                    : const CircularProgressIndicator(),
                errorBuilder: (context, error, stack) => const Padding(
                  padding: EdgeInsets.all(32),
                  child: Text(
                    'تعذر تحميل صفحة المصحف. تحقق من اتصال الإنترنت.',
                  ),
                ),
              ),
            ),
          ),
        ),
        bottomNavigationBar: ColoredBox(
          color: const Color(0xFF063B32),
          child: SafeArea(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  onPressed: page == pageCount
                      ? null
                      : () => changePage(page + 1),
                  color: Colors.white,
                  disabledColor: Colors.white30,
                  icon: const Icon(Icons.chevron_right_rounded),
                ),
                Text(
                  '$page / $pageCount',
                  style: const TextStyle(
                    color: Color(0xFFFFD166),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  onPressed: page == 1 ? null : () => changePage(page - 1),
                  color: Colors.white,
                  disabledColor: Colors.white30,
                  icon: const Icon(Icons.chevron_left_rounded),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
