import 'package:flutter_test/flutter_test.dart';

import 'package:noor_al_islam/app.dart';

void main() {
  testWidgets('Noor Al-Islam first-run onboarding renders', (WidgetTester tester) async {
    await tester.pumpWidget(const NoorAlIslamApp());
    await tester.pumpAndSettle();

    expect(find.text('نور الإسلام'), findsOneWidget);
    expect(find.text('اختر لغة التطبيق'), findsOneWidget);
    expect(find.text('العربية'), findsOneWidget);
    expect(find.text('متابعة'), findsOneWidget);
  });
}
