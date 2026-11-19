import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export const EHSAN_URL = 'https://ehsan.sa/';

export async function openEhsan(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({
      url: EHSAN_URL,
      presentationStyle: 'popover',
      toolbarColor: '#071A15',
    });
    return;
  }

  const opened = window.open(EHSAN_URL, '_blank', 'noopener,noreferrer');
  if (!opened) window.location.assign(EHSAN_URL);
}
