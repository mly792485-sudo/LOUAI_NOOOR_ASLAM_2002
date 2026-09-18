from pathlib import Path
p=Path('ios/App/App.xcodeproj/project.pbxproj')
lines=p.read_text().splitlines()
children=[
'6E0AD1042026A5A100000003 /* azkar_morning.wav */,',
'6E0AD1062026A5A100000005 /* azkar_evening.wav */,',
'6E0AD1082026A5A100000007 /* azkar_sleep.wav */,',
'6E0AD10A2026A5A100000009 /* azkar_tahajjud.wav */,',]
resources=[
'6E0AD1032026A5A100000003 /* azkar_morning.wav in Resources */,',
'6E0AD1052026A5A100000005 /* azkar_evening.wav in Resources */,',
'6E0AD1072026A5A100000007 /* azkar_sleep.wav in Resources */,',
'6E0AD1092026A5A100000009 /* azkar_tahajjud.wav in Resources */,',]
def insert_after_marker(lines, marker, additions):
    if any(x.strip()==add for x in lines for add in additions): return lines
    for i,line in enumerate(lines):
        if marker in line:
            indent=line[:len(line)-len(line.lstrip())]
            return lines[:i+1] + [indent + x for x in additions] + lines[i+1:]
    raise SystemExit('marker not found: '+marker)
lines=insert_after_marker(lines, '6E0AD1012026A5A100000002 /* adhan_notification.wav */,', children)
lines=insert_after_marker(lines, '6E0AD1022026A5A100000002 /* adhan_notification.wav in Resources */,', resources)
p.write_text('\n'.join(lines)+'\n')
print('completed iOS sound group and resource registration')
