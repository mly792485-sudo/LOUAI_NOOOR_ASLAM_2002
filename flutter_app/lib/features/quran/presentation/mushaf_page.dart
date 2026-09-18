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
  double zoom = 1;

  String imageFor(int value) =>
      'https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master/${value.toString().padLeft(3, '0')}.png';

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
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
    );
  }

  Future<void> choosePage() async {
    final input = TextEditingController(text: '$page');
    final selected = await showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('اختيار صفحة المصحف'),
        content: TextField(
          controller: input,
          autofocus: true,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'رقم الصفحة من 1 إلى 604'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () => Navigator.pop(context, int.tryParse(input.text)),
            child: const Text('انتقال'),
          ),
        ],
      ),
    );
    input.dispose();
    if (selected != null) changePage(selected);
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFF0B1716),
        appBar: AppBar(
          backgroundColor: const Color(0xFF063B32),
          foregroundColor: Colors.white,
          title: Text('المصحف الشريف · صفحة $page من $pageCount'),
          actions: [
            IconButton(onPressed: choosePage, icon: const Icon(Icons.menu_book_rounded), tooltip: 'اختيار الصفحة'),
            IconButton(onPressed: () => setState(() => zoom = 1), icon: const Icon(Icons.refresh_rounded)),
          ],
        ),
        body: PageView.builder(
          controller: controller,
          reverse: true,
          physics: const BouncingScrollPhysics(),
          allowImplicitScrolling: true,
          itemCount: pageCount,
          onPageChanged: (index) => setState(() { page = index + 1; zoom = 1; }),
          itemBuilder: (context, index) => InteractiveViewer(
            minScale: 1,
            maxScale: 3,
            scaleEnabled: true,
            panEnabled: zoom > 1,
            onInteractionUpdate: (details) => setState(() => zoom = details.scale.clamp(1, 3)),
            child: Center(
              child: Image.network(
                imageFor(index + 1),
                fit: BoxFit.contain,
                gaplessPlayback: true,
                filterQuality: FilterQuality.high,
                loadingBuilder: (context, child, progress) => progress == null
                    ? child
                    : const Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()),
                errorBuilder: (context, error, stack) => Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    const Text('تعذر تحميل صفحة المصحف. تحقق من الاتصال.'),
                    const SizedBox(height: 12),
                    FilledButton(onPressed: () => setState(() {}), child: const Text('إعادة المحاولة')),
                  ]),
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
                IconButton(onPressed: page == pageCount ? null : () => changePage(page + 1), color: Colors.white, icon: const Icon(Icons.chevron_right_rounded)),
                Text('$page / $pageCount', style: const TextStyle(color: Color(0xFFFFD166), fontWeight: FontWeight.bold)),
                IconButton(onPressed: page == 1 ? null : () => changePage(page - 1), color: Colors.white, icon: const Icon(Icons.chevron_left_rounded)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
