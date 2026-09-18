#!/usr/bin/env python3
import base64
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = 'mly792485-sudo/BODYBHQQQ'
BRANCH = 'main'
FILES = [
    'flutter_app/lib/features/quran/presentation/mushaf_page.dart',
    'render.yaml',
    'src/App.tsx',
    'src/components/AzkarSection.tsx',
    'src/components/IslamicLibrarySection.tsx',
    'src/components/MushafPageReader.tsx',
    'src/components/SettingsModal.tsx',
    'src/types.ts',
    'tools/publish_changed_files.py',
]

def gh(*args, input_data=None):
    result = subprocess.run(['gh', 'api', *args], cwd=ROOT, input=input_data, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout

for relative in FILES:
    path = ROOT / relative
    encoded = base64.b64encode(path.read_bytes()).decode('ascii')
    sha = None
    try:
        current = json.loads(gh(f'repos/{REPO}/contents/{relative}', '--field', f'ref={BRANCH}'))
        sha = current.get('sha')
    except RuntimeError:
        pass
    payload = {'message': f'Update Noor Al-Islam: {relative}', 'content': encoded, 'branch': BRANCH}
    if sha:
        payload['sha'] = sha
    gh(f'repos/{REPO}/contents/{relative}', '--method', 'PUT', '--input', '-', input_data=json.dumps(payload))
    print(f'updated {relative}', flush=True)

print('REMOTE_COMMIT=' + json.loads(gh(f'repos/{REPO}/commits/{BRANCH}'))['sha'])
