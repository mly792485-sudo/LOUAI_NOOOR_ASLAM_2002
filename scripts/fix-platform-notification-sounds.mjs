import fs from 'node:fs';
const path = 'src/utils/nativeNotifications.ts';
let source = fs.readFileSync(path, 'utf8');
for (const name of ['adhan_notification', 'azkar_morning', 'azkar_evening', 'azkar_sleep', 'azkar_tahajjud']) {
  const pattern = new RegExp(`sound: "${name}"`, 'g');
  source = source.replace(pattern, `sound: isIOSPlatform() ? "${name}.wav" : "${name}"`);
}
fs.writeFileSync(path, source);
console.log('Platform-specific notification sound names applied.');
