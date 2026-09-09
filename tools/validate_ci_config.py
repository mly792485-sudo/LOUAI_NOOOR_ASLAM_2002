from pathlib import Path

try:
    import yaml
except ImportError:
    raise SystemExit("PyYAML is not installed")

for filename in [".github/workflows/build-ios.yml", ".github/workflows/build-android.yml"]:
    data = yaml.safe_load(Path(filename).read_text())
    if not isinstance(data, dict) or "jobs" not in data:
        raise SystemExit(f"Invalid workflow structure: {filename}")
    print(f"valid {filename}")

workflow = Path(".github/workflows/build-ios.yml").read_text()
if "public/audio/adhan-notification.wav" in workflow:
    raise SystemExit("stale missing audio reference remains")
if "macos-26" not in workflow:
    raise SystemExit("iOS workflow is not using macos-26")
print("iOS workflow uses macos-26 and has no stale audio reference")
