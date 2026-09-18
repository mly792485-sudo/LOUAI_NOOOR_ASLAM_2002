class AppConfig {
  const AppConfig._();

  static const assistantBaseUrl = String.fromEnvironment(
    'ASSISTANT_BASE_URL',
    defaultValue: String.fromEnvironment('VITE_API_BASE_URL', defaultValue: ''),
  );

  static bool get assistantConfigured => assistantBaseUrl.trim().isNotEmpty;
}
