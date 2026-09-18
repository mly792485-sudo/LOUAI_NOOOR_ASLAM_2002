import 'package:flutter_test/flutter_test.dart';

import 'package:noor_al_islam/app.dart';

void main() {
  testWidgets('Noor Al-Islam home scaffold renders', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const NoorAlIslamApp());
    expect(find.text('نور الإسلام'), findsOneWidget);
    expect(find.text('أقسام التطبيق'), findsOneWidget);
    expect(find.text('القرآن الكريم'), findsOneWidget);
  });
}
