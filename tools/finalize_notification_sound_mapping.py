from pathlib import Path
p = Path('src/utils/nativeNotifications.ts')
s = p.read_text()
# Android channel sound names must be bare raw resource names.
s = s.replace('{ id: "azkar_evening_channel_v4", name: "أذكار المساء", sound: "azkar_evening.wav" }', '{ id: "azkar_evening_channel_v4", name: "أذكار المساء", sound: "azkar_evening" }')
s = s.replace('{ id: "azkar_sleep_channel_v4", name: "أذكار النوم", sound: "azkar_sleep.wav" }', '{ id: "azkar_sleep_channel_v4", name: "أذكار النوم", sound: "azkar_sleep" }')
s = s.replace('{ id: "azkar_tahajjud_channel_v4", name: "قيام الليل والوتر", sound: "azkar_tahajjud.wav" }', '{ id: "azkar_tahajjud_channel_v4", name: "قيام الليل والوتر", sound: "azkar_tahajjud" }')
# Capacitor iOS resolves the extension-bearing filename from public/; Android
# strips the extension when resolving the raw resource.
s = s.replace('sound: "adhan_notification",\n              channelId:', 'sound: "adhan_notification.wav",\n              channelId:')
s = s.replace('sound: "adhan_notification",\n        channelId:', 'sound: "adhan_notification.wav",\n        channelId:')
# Every scheduled date notification must survive Doze and request exact timing.
import re
s = re.sub(r'schedule: \{ at: ([A-Za-z0-9_().]+) \}(,?)', r'schedule: { at: \1, allowWhileIdle: true, isExactNotification: true }\2', s)
p.write_text(s)
