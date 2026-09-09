from pathlib import Path
from PIL import Image

for path in [
    Path('public/app-icon.png'),
    Path('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'),
]:
    image = Image.open(path).convert('RGB')
    pixels = list(image.resize((32, 32)).getdata())
    avg = tuple(sum(p[i] for p in pixels) // len(pixels) for i in range(3))
    white = sum(1 for p in pixels if min(p) > 245) / len(pixels)
    print(f'{path}: size={image.size}, average={avg}, white_ratio={white:.2f}')

print('library urls:')
text = Path('src/components/IslamicLibrarySection.tsx').read_text(encoding='utf-8')
for line in text.splitlines():
    if 'url:' in line:
        print(line.strip())
