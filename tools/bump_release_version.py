from pathlib import Path

android = Path('android/app/build.gradle')
text = android.read_text(encoding='utf-8').replace('versionCode 1', 'versionCode 2').replace('versionName "1.0"', 'versionName "1.1"')
android.write_text(text, encoding='utf-8')

xcode = Path('ios/App/App.xcodeproj/project.pbxproj')
text = xcode.read_text(encoding='utf-8').replace('CURRENT_PROJECT_VERSION = 1;', 'CURRENT_PROJECT_VERSION = 2;').replace('MARKETING_VERSION = 1.0;', 'MARKETING_VERSION = 1.1;')
xcode.write_text(text, encoding='utf-8')
print('release versions bumped to 1.1 / build 2')
