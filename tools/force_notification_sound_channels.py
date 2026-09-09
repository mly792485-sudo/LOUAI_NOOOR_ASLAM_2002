from pathlib import Path

p = Path('src/utils/nativeNotifications.ts')
s = p.read_text()
replacements = {
    'azkar_channel_v2': 'azkar_morning_channel_v3',
    'azkar_evening_channel_v2': 'azkar_evening_channel_v3',
    'azkar_sleep_channel_v2': 'azkar_sleep_channel_v3',
    'azkar_tahajjud_channel_v2': 'azkar_tahajjud_channel_v3',
}
for old, new in replacements.items():
    s = s.replace(old, new)
# Keep the real filename for iOS UserNotifications. Android's Capacitor
# resolver strips .wav to the raw resource base name automatically.
for stem in ('morning', 'evening', 'sleep', 'tahajjud'):
    s = s.replace(f'sound: "azkar_{stem}",', f'sound: "azkar_{stem}.wav",')
p.write_text(s)
