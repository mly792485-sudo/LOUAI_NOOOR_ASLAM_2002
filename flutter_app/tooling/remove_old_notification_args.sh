#!/usr/bin/env bash
set -euo pipefail
FILE="$(dirname "$0")/../lib/core/services/notification_service.dart"
sed -i.bak '/uiLocalNotificationDateInterpretation:/,+1d' "$FILE"
rm -f "$FILE.bak"
