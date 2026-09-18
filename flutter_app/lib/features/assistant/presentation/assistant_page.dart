import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../../../core/services/assistant_service.dart';

class AssistantPage extends StatefulWidget {
  const AssistantPage({super.key});

  @override
  State<AssistantPage> createState() => _AssistantPageState();
}

class _AssistantPageState extends State<AssistantPage> {
  final _question = TextEditingController();
  String? _answer;
  String? _error;
  bool _loading = false;
  late final AssistantService _service;

  @override
  void initState() {
    super.initState();
    _service = AssistantService(baseUrl: AppConfig.assistantBaseUrl);
  }

  @override
  void dispose() {
    _question.dispose();
    _service.dispose();
    super.dispose();
  }

  Future<void> _ask() async {
    final question = _question.text.trim();
    if (question.isEmpty || _loading) return;
    setState(() {
      _loading = true;
      _error = null;
      _answer = null;
    });
    try {
      final answer = await _service.ask(question);
      if (mounted) setState(() => _answer = answer);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: const Text('مستشار نور الإسلام')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'مساعد بحثي إسلامي، وليس مفتياً مستقلاً. في مسائل الطلاق والمواريث والفتاوى الخاصة راجع عالماً موثوقاً.',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ),
            ),
            if (!AppConfig.assistantConfigured)
              const Card(
                color: Color(0xFFFFF3CD),
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('لم يتم إعداد رابط خادم المستشار لهذه النسخة. ابنِ التطبيق باستخدام ASSISTANT_BASE_URL=https://رابط-الخادم.'),
                ),
              ),
            const SizedBox(height: 12),
            TextField(
              controller: _question,
              minLines: 3,
              maxLines: 7,
              textInputAction: TextInputAction.newline,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'اكتب سؤالك',
                hintText: 'مثال: ما فضل صلة الرحم؟',
              ),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: AppConfig.assistantConfigured && !_loading ? _ask : null,
              icon: _loading ? const SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send_rounded),
              label: Text(_loading ? 'جارٍ البحث...' : 'إرسال السؤال'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Card(color: Theme.of(context).colorScheme.errorContainer, child: Padding(padding: const EdgeInsets.all(16), child: Text(_error!))),
            ],
            if (_answer != null) ...[
              const SizedBox(height: 12),
              Card(child: Padding(padding: const EdgeInsets.all(16), child: SelectableText(_answer!))),
            ],
          ],
        ),
      ),
    );
  }
}
