import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const catalogPath = path.join(root, 'public/data/adhkar-audio-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const records = [];
for (const [categoryId, reciters] of Object.entries(catalog.categories ?? {})) {
  for (const [reciterId, record] of Object.entries(reciters)) {
    records.push({ categoryId, reciterId, ...record });
  }
}
for (const [key, record] of Object.entries(catalog.items ?? {})) {
  records.push({ key, ...record });
}

if (records.length === 0) throw new Error('الكتالوج لا يحتوي أي تسجيلات');
let failures = 0;
for (const record of records) {
  if (!record.url || !record.url.startsWith('/')) {
    console.error(`FAIL: رابط غير محلي أو مفقود: ${record.categoryId ?? record.key}`);
    failures++;
    continue;
  }
  const filePath = path.join(root, 'public', record.url.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: الملف غير موجود: ${filePath}`);
    failures++;
    continue;
  }
  try {
    const output = execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=format_name,duration',
      '-of', 'json', filePath
    ], { encoding: 'utf8' });
    const format = JSON.parse(output).format ?? {};
    const duration = Number(format.duration);
    if (format.format_name !== 'mp3' || !Number.isFinite(duration) || duration <= 0) {
      throw new Error('صيغة أو مدة غير صالحة');
    }
    console.log(`OK: ${record.categoryId ?? record.key} / ${record.reciterId ?? 'item'} — ${duration.toFixed(2)}s`);
  } catch (error) {
    console.error(`FAIL: ${record.categoryId ?? record.key}: ${error.message}`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log(`\nتم التحقق من ${records.length} تسجيلات مفهرسة بنجاح.`);
console.log('ملاحظة: ffprobe يثبت سلامة الملف فقط؛ مطابقة الكلام للنص وحقوق النشر تحتاج مراجعة بشرية قبل إضافة تسجيل مستقل لأي ذكر.');
