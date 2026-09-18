import 'dart:convert';

import 'package:http/http.dart' as http;

class AssistantService {
  AssistantService({required this.baseUrl, http.Client? client})
    : _client = client ?? http.Client();
  final String baseUrl;
  final http.Client _client;

  Future<String> ask(String question) async {
    if (baseUrl.trim().isEmpty) {
      throw StateError(
        'لم يتم إعداد رابط خادم المستشار. أضف رابط HTTPS في إعدادات البناء.',
      );
    }
    final response = await _client
        .post(
      Uri.parse('${baseUrl.replaceFirst(RegExp(r'/+$'), '')}/api/ai/qa'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({'question': question}),
    )
        .timeout(const Duration(seconds: 45));
    if (response.statusCode < 200 || response.statusCode >= 300) {
      String detail = '';
      try {
        final payload = jsonDecode(response.body) as Map<String, dynamic>;
        detail = (payload['error'] as String?)?.trim() ?? '';
      } catch (_) {}
      throw Exception(detail.isEmpty
          ? 'تعذر الاتصال بمستشار نور الإسلام (${response.statusCode})'
          : 'تعذر الاتصال بمستشار نور الإسلام: $detail');
    }
    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    return (decoded['text'] as String?)?.trim() ??
        'تعذر الحصول على إجابة من الخادم.';
  }

  void dispose() => _client.close();
}
