from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'public' / 'app-icon.png'
image = Image.open(source).convert('RGBA')

sizes = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}

for density, size in sizes.items():
    folder = root / 'android' / 'app' / 'src' / 'main' / 'res' / f'mipmap-{density}'
    folder.mkdir(parents=True, exist_ok=True)
    resized = image.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(folder / 'ic_launcher.png', optimize=True)
    resized.save(folder / 'ic_launcher_round.png', optimize=True)
    resized.save(folder / 'ic_launcher_foreground.png', optimize=True)

# Adaptive icons use a bitmap foreground with a safe dark background.
foreground = root / 'android' / 'app' / 'src' / 'main' / 'res' / 'drawable-nodpi'
foreground.mkdir(parents=True, exist_ok=True)
image.resize((432, 432), Image.Resampling.LANCZOS).save(foreground / 'ic_launcher_foreground.png', optimize=True)

for name in ('ic_launcher.xml', 'ic_launcher_round.xml'):
    target = root / 'android' / 'app' / 'src' / 'main' / 'res' / 'mipmap-anydpi-v26' / name
    target.write_text('''<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background" />\n    <foreground android:drawable="@drawable/ic_launcher_foreground" />\n</adaptive-icon>\n''', encoding='utf-8')

background = root / 'android' / 'app' / 'src' / 'main' / 'res' / 'values' / 'ic_launcher_background.xml'
background.write_text('''<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#062C2B</color>\n</resources>\n''', encoding='utf-8')
print('Android launcher icons generated from', source)
