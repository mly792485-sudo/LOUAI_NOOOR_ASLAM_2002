from pathlib import Path
import re

for name in ('src/utils/nativeNotifications.ts', 'capacitor.config.json'):
    path = Path(name)
    text = path.read_text(encoding='utf-8')
    text = text.replace('adhan-notification.wav', 'adhan_notification.wav')
    text = re.sub(r'adhan_channel(?:_v2)?', 'adhan_channel_v2', text)
    text = re.sub(r'azkar_channel(?:_v2)?', 'azkar_channel_v2', text)
    path.write_text(text, encoding='utf-8')
print('notification names normalized')
