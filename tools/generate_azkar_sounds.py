from pathlib import Path
import math
import struct
import wave

out = Path('public/audio')
out.mkdir(parents=True, exist_ok=True)

# Gentle non-vocal notification tones; the prayer notification remains the bundled adhan.
patterns = {
    'azkar_morning.wav': [523.25, 659.25, 783.99],
    'azkar_evening.wav': [392.00, 523.25, 659.25],
    'azkar_sleep.wav': [329.63, 392.00, 493.88],
    'azkar_tahajjud.wav': [261.63, 329.63, 392.00],
}
rate = 44100
for filename, notes in patterns.items():
    samples = []
    for index, freq in enumerate(notes):
        duration = 0.42
        count = int(rate * duration)
        for n in range(count):
            t = n / rate
            attack = min(1.0, t / 0.04)
            release = min(1.0, (duration - t) / 0.12)
            envelope = max(0.0, min(attack, release)) * 0.18
            value = math.sin(2 * math.pi * freq * t) * envelope
            samples.append(int(max(-1.0, min(1.0, value)) * 32767))
    with wave.open(str(out / filename), 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(b''.join(struct.pack('<h', sample) for sample in samples))
print('generated', ', '.join(patterns))
