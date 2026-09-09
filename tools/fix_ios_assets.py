from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'public' / 'app-icon.png').convert('RGB')
icon_dir = root / 'ios' / 'App' / 'App' / 'Assets.xcassets' / 'AppIcon.appiconset'
icon_dir.mkdir(parents=True, exist_ok=True)

entries = [
    ('AppIcon-20@2x.png', 40, '20x20', '2x', 'iphone'),
    ('AppIcon-20@3x.png', 60, '20x20', '3x', 'iphone'),
    ('AppIcon-29@2x.png', 58, '29x29', '2x', 'iphone'),
    ('AppIcon-29@3x.png', 87, '29x29', '3x', 'iphone'),
    ('AppIcon-40@2x.png', 80, '40x40', '2x', 'iphone'),
    ('AppIcon-40@3x.png', 120, '40x40', '3x', 'iphone'),
    ('AppIcon-60@2x.png', 120, '60x60', '2x', 'iphone'),
    ('AppIcon-60@3x.png', 180, '60x60', '3x', 'iphone'),
    ('AppIcon-512@2x.png', 1024, '1024x1024', '1x', 'ios'),
]
for filename, size, logical, scale, idiom in entries:
    source.resize((size, size), Image.Resampling.LANCZOS).save(icon_dir / filename, optimize=True)

import json
contents = {
    'images': [
        {'filename': filename, 'idiom': idiom, 'scale': scale, 'size': logical}
        for filename, _, logical, scale, idiom in entries
    ],
    'info': {'author': 'xcode', 'version': 1},
}
(icon_dir / 'Contents.json').write_text(json.dumps(contents, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# iOS notification sound must be in the native target resources and the filename must match code exactly.
source_audio = root / 'public' / 'audio' / 'adhan-notification.wav'
app_dir = root / 'ios' / 'App' / 'App'
(app_dir / 'adhan_notification.wav').write_bytes(source_audio.read_bytes())

pbx = root / 'ios' / 'App' / 'App.xcodeproj' / 'project.pbxproj'
text = pbx.read_text(encoding='utf-8')
if 'adhan_notification.wav in Resources' not in text:
    text = text.replace(
        '\t\t6E0AD1002026A5A100000001 /* adhan.wav in Resources */ = {isa = PBXBuildFile; fileRef = 6E0AD0FF2026A5A100000001 /* adhan.wav */; };',
        '\t\t6E0AD1002026A5A100000001 /* adhan.wav in Resources */ = {isa = PBXBuildFile; fileRef = 6E0AD0FF2026A5A100000001 /* adhan.wav */; };\n\t\t6E0AD1022026A5A100000002 /* adhan_notification.wav in Resources */ = {isa = PBXBuildFile; fileRef = 6E0AD1012026A5A100000002 /* adhan_notification.wav */; };'
    )
    text = text.replace(
        '\t\t6E0AD0FF2026A5A100000001 /* adhan.wav */ = {isa = PBXFileReference; lastKnownFileType = audio.wav; path = adhan.wav; sourceTree = "<group>"; };',
        '\t\t6E0AD0FF2026A5A100000001 /* adhan.wav */ = {isa = PBXFileReference; lastKnownFileType = audio.wav; path = adhan.wav; sourceTree = "<group>"; };\n\t\t6E0AD1012026A5A100000002 /* adhan_notification.wav */ = {isa = PBXFileReference; lastKnownFileType = audio.wav; path = adhan_notification.wav; sourceTree = "<group>"; };'
    )
    text = text.replace(
        '\t\t\t\t6E0AD0FF2026A5A100000001 /* adhan.wav */,',
        '\t\t\t\t6E0AD0FF2026A5A100000001 /* adhan.wav */,\n\t\t\t\t6E0AD1012026A5A100000002 /* adhan_notification.wav */,'
    )
    text = text.replace(
        '\t\t\t\t6E0AD1002026A5A100000001 /* adhan.wav in Resources */,',
        '\t\t\t\t6E0AD1002026A5A100000001 /* adhan.wav in Resources */,\n\t\t\t\t6E0AD1022026A5A100000002 /* adhan_notification.wav in Resources */,'
    )
    pbx.write_text(text, encoding='utf-8')
print('iOS icons and notification sound resources prepared')
