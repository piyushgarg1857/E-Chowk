import 'package:flutter_test/flutter_test.dart';
import 'package:e_chowk/main.dart';

void main() {
  testWidgets('E-Chowk app renders', (WidgetTester tester) async {
    await tester.pumpWidget(const LabourChowkApp());
    expect(find.textContaining('E-Chowk'), findsOneWidget);
  });
}
