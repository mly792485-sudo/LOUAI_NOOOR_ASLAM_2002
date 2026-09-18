#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
BUNDLE_ID='com.noor.alislam.noorApp'
# Flutter's generated iOS target and macOS app target.
sed -i.bak "s/com\.noor\.alislam\.noorAlIslam;/${BUNDLE_ID};/g" ios/Runner.xcodeproj/project.pbxproj
sed -i.bak "s/com\.noor\.alislam\.noorAlIslam/${BUNDLE_ID}/g" macos/Runner/Configs/AppInfo.xcconfig
# Android application ID may use a different Kotlin namespace, but the installed app ID must match Apple naming only where desired.
sed -i.bak "s/applicationId = \"com\.noor\.alislam\.noor_al_islam\"/applicationId = \"${BUNDLE_ID}\"/" android/app/build.gradle.kts
rm -f ios/Runner.xcodeproj/project.pbxproj.bak macos/Runner/Configs/AppInfo.xcconfig.bak android/app/build.gradle.kts.bak
printf 'Bundle ID configured: %s\n' "$BUNDLE_ID"
