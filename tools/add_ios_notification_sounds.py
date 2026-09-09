from pathlib import Path
p = Path('ios/App/App.xcodeproj/project.pbxproj')
s = p.read_text()
items = [
 ('6E0AD1032026A5A100000003','6E0AD1042026A5A100000003','azkar_morning.wav'),
 ('6E0AD1052026A5A100000005','6E0AD1062026A5A100000005','azkar_evening.wav'),
 ('6E0AD1072026A5A100000007','6E0AD1082026A5A100000007','azkar_sleep.wav'),
 ('6E0AD1092026A5A100000009','6E0AD10A2026A5A100000009','azkar_tahajjud.wav'),
]
build = ''.join(f'\t\t{b} /* {name} in Resources */ = {{isa = PBXBuildFile; fileRef = {r} /* {name} */; }};\n' for b,r,name in items)
refs = ''.join(f'\t\t{r} /* {name} */ = {{isa = PBXFileReference; lastKnownFileType = audio.wav; path = {name}; sourceTree = "<group>"; }};\n' for b,r,name in items)
children = ''.join(f'\t\t\t\t\t{r} /* {name} */,\n' for b,r,name in items)
resources = ''.join(f'\t\t\t\t\t{b} /* {name} in Resources */,\n' for b,r,name in items)
if 'azkar_morning.wav' in s:
    print('already registered')
else:
    s = s.replace('/* End PBXBuildFile section */', build + '/* End PBXBuildFile section */', 1)
    s = s.replace('/* End PBXFileReference section */', refs + '/* End PBXFileReference section */', 1)
    s = s.replace('\t\t\t\t\t6E0AD1012026A5A100000002 /* adhan_notification.wav */,\n', '\t\t\t\t\t6E0AD1012026A5A100000002 /* adhan_notification.wav */,\n' + children, 1)
    s = s.replace('\t\t\t\t\t6E0AD1022026A5A100000002 /* adhan_notification.wav in Resources */,\n', '\t\t\t\t\t6E0AD1022026A5A100000002 /* adhan_notification.wav in Resources */,\n' + resources, 1)
    p.write_text(s)
    print('added', len(items), 'iOS notification sound resources')
