from pathlib import Path
path = Path('src/utils/nativeNotifications.ts')
text = path.read_text(encoding='utf-8')
text = text.replace('              smallIcon: "ic_stat_icon",\n', '')
text = text.replace('              smallIcon: "ic_stat_icon",\r\n', '')
path.write_text(text, encoding='utf-8')
print('removed missing Android notification icon reference')
