import 'package:flutter/material.dart';

import '../../../core/services/device_services.dart';
import '../../home/presentation/home_page.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _store = SettingsStore();
  final _location = LocationService();
  final _pageController = PageController();
  final _languages = const [
    ('ar', 'العربية', 'العربية'),
    ('en', 'English', 'English'),
    ('id', 'Indonesia', 'Bahasa Indonesia'),
    ('fr', 'Français', 'Français'),
    ('ru', 'Русский', 'Русский'),
    ('fa', 'فارسی', 'فارسی'),
    ('tr', 'Türkçe', 'Türkçe'),
    ('es', 'Español', 'Español'),
    ('de', 'Deutsch', 'Deutsch'),
    ('ur', 'اردو', 'اردو'),
  ];

  int _step = 0;
  String _language = 'ar';
  LocationSnapshot? _snapshot;
  String? _locationError;
  bool _locating = false;
  String? _gender;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _saveLanguage(String code) async {
    setState(() => _language = code);
    await _store.setString('noor_language', code);
  }

  Future<void> _locate() async {
    setState(() {
      _locating = true;
      _locationError = null;
    });
    try {
      final snapshot = await _location.currentLocation();
      await _store.setDouble('latitude', snapshot.position.latitude);
      await _store.setDouble('longitude', snapshot.position.longitude);
      if (snapshot.countryCode != null) await _store.setString('country_code', snapshot.countryCode!);
      if (snapshot.city != null) await _store.setString('city', snapshot.city!);
      if (snapshot.country != null) await _store.setString('country', snapshot.country!);
      if (mounted) setState(() => _snapshot = snapshot);
    } on LocationException catch (error) {
      if (mounted) setState(() => _locationError = error.message);
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  Future<void> _finish() async {
    if (_gender != null) await _store.setString('gender', _gender!);
    await _store.setBool('onboarding_complete', true);
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute<void>(builder: (_) => const HomePage()),
      (_) => false,
    );
  }

  void _next() {
    if (_step == 0 && _language.isEmpty) return;
    if (_step == 3) {
      _finish();
      return;
    }
    setState(() => _step += 1);
    _pageController.animateToPage(_step, duration: const Duration(milliseconds: 280), curve: Curves.easeOutCubic);
  }

  void _back() {
    if (_step == 0) return;
    setState(() => _step -= 1);
    _pageController.animateToPage(_step, duration: const Duration(milliseconds: 280), curve: Curves.easeOutCubic);
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: _language == 'ar' || _language == 'fa' || _language == 'ur' ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 8),
                child: Row(
                  children: [
                    if (_step > 0) IconButton(onPressed: _back, icon: const Icon(Icons.arrow_back_rounded)) else const SizedBox(width: 48),
                    Expanded(child: Text('نور الإسلام', textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold))),
                    const SizedBox(width: 48),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: Row(children: List.generate(4, (index) => Expanded(child: Container(margin: const EdgeInsets.symmetric(horizontal: 3), height: 5, decoration: BoxDecoration(color: index <= _step ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(99))))),
              ),
              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [_languageStep(), _locationStep(), _genderStep(), _accountStep()],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                child: SizedBox(width: double.infinity, child: FilledButton(onPressed: _next, child: Text(_step == 3 ? 'الدخول إلى التطبيق' : 'متابعة'))),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _languageStep() => _shell(
        icon: Icons.translate_rounded,
        title: 'اختر لغة التطبيق',
        subtitle: 'يمكنك تغيير اللغة لاحقًا من الإعدادات.',
        child: GridView.builder(
          padding: const EdgeInsets.only(top: 12),
          itemCount: _languages.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 2.2),
          itemBuilder: (_, index) {
            final language = _languages[index];
            final selected = _language == language.$1;
            return InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => _saveLanguage(language.$1),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), color: selected ? Theme.of(context).colorScheme.primaryContainer : Theme.of(context).colorScheme.surfaceContainerHighest, border: Border.all(color: selected ? Theme.of(context).colorScheme.primary : Colors.transparent, width: 2)),
                child: Row(children: [Icon(selected ? Icons.check_circle : Icons.language_rounded, size: 20), const SizedBox(width: 8), Expanded(child: Text(language.$2, style: const TextStyle(fontWeight: FontWeight.w600)))]),
              ),
            );
          },
        ),
      );

  Widget _locationStep() => _shell(
        icon: Icons.location_on_rounded,
        title: 'حدد موقعك',
        subtitle: 'نحتاج موقعك الحقيقي لحساب مواقيت الصلاة وتحديد القبلة بدقة. لن نستخدم إحداثيات ثابتة.',
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const SizedBox(height: 20),
          FilledButton.icon(onPressed: _locating ? null : _locate, icon: _locating ? const SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.my_location_rounded), label: Text(_locating ? 'جارٍ تحديد الموقع...' : 'السماح بتحديد الموقع')),
          if (_snapshot != null) ...[
            const SizedBox(height: 18),
            Card(child: ListTile(leading: const Icon(Icons.check_circle, color: Colors.green), title: const Text('تم تحديد موقعك بنجاح'), subtitle: Text(_snapshot!.displayName.isEmpty ? '${_snapshot!.position.latitude.toStringAsFixed(4)}, ${_snapshot!.position.longitude.toStringAsFixed(4)}' : _snapshot!.displayName))),
          ],
          if (_locationError != null) ...[
            const SizedBox(height: 18),
            Card(color: Theme.of(context).colorScheme.errorContainer, child: Padding(padding: const EdgeInsets.all(14), child: Text(_locationError!))),
          ],
          const SizedBox(height: 10),
          TextButton(onPressed: _next, child: const Text('المتابعة بدون موقع الآن')),
        ]),
      );

  Widget _genderStep() => _shell(icon: Icons.person_outline_rounded, title: 'اختر ما يناسبك', subtitle: 'هذا الاختيار اختياري ولا يمنع استخدام الوظائف الأساسية.', child: Column(children: [const SizedBox(height: 20), _choice('male', 'مسلم', Icons.person_rounded), const SizedBox(height: 12), _choice('female', 'مسلمة', Icons.person_2_rounded), const SizedBox(height: 8), TextButton(onPressed: () => setState(() => _gender = null), child: const Text('تخطي'))]));

  Widget _choice(String value, String label, IconData icon) {
    final selected = _gender == value;
    return InkWell(onTap: () => setState(() => _gender = value), borderRadius: BorderRadius.circular(18), child: Container(width: double.infinity, padding: const EdgeInsets.all(18), decoration: BoxDecoration(borderRadius: BorderRadius.circular(18), color: selected ? Theme.of(context).colorScheme.primaryContainer : Theme.of(context).colorScheme.surfaceContainerHighest, border: Border.all(color: selected ? Theme.of(context).colorScheme.primary : Colors.transparent, width: 2)), child: Row(children: [Icon(icon), const SizedBox(width: 12), Text(label, style: const TextStyle(fontWeight: FontWeight.bold)), const Spacer(), if (selected) const Icon(Icons.check_circle)]));
  }

  Widget _accountStep() => _shell(icon: Icons.verified_user_outlined, title: 'مرحبًا بك في نور الإسلام', subtitle: 'يمكنك استخدام التطبيق كزائر. تسجيل الدخول والمزامنة سيُضافان فقط بعد ربط مزود مصادقة حقيقي.', child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [const SizedBox(height: 22), Card(child: const Padding(padding: EdgeInsets.all(16), child: Text('لن ننشئ حسابًا وهميًا ولن نطلب كلمة مرور دون خدمة مصادقة آمنة. يمكنك المتابعة كزائر وحفظ الإعدادات على جهازك.'))), const SizedBox(height: 12), OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.login_rounded), label: const Text('تسجيل الدخول (يتطلب إعداد الخدمة)'))]));

  Widget _shell({required IconData icon, required String title, required String subtitle, required Widget child}) => Padding(padding: const EdgeInsets.fromLTRB(24, 20, 24, 8), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [CircleAvatar(radius: 34, child: Icon(icon, size: 32)), const SizedBox(height: 18), Text(title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),), const SizedBox(height: 8), Text(subtitle, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium), const SizedBox(height: 8), Expanded(child: child)]));
}
