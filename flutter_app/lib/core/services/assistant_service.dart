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
    final response = await _client.post(
      Uri.parse('${baseUrl.replaceFirst(RegExp(r'/+$'), '')}/api/ai/qa'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({'question': question}),
    );
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'تعذر الاتصال بمستشار نور الإسلام (${response.statusCode})',
      );
    }
    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    return (decoded['text'] as String?)?.trim() ??
        'تعذر الحصول على إجابة من الخادم.';
  }

  void dispose() => _client.close();
}
