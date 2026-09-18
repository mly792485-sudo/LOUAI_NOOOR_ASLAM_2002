from pathlib import Path
p = Path('src/utils/nativeNotifications.ts')
s = p.read_text()
s = s.replace('adhan_channel_v4', 'prayer_channel_audio_v5')
p.write_text(s)
