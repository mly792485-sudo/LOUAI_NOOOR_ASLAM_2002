import { Capacitor } from '@capacitor/core';

const cleanUrl = (value: unknown): string => {
  const candidate = String(value || '').trim();
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
};

/**
 * Store URLs are intentionally empty until the app is actually published.
 * This prevents sharing a fake or placeholder App Store / Play Store link.
 */
export function getAppDistributionUrl(): string {
  const platform = Capacitor.getPlatform();
  const iosUrl = cleanUrl(import.meta.env.VITE_APP_STORE_URL);
  const androidUrl = cleanUrl(import.meta.env.VITE_PLAY_STORE_URL);
  if (platform === 'ios' && iosUrl) return iosUrl;
  if (platform === 'android' && androidUrl) return androidUrl;
  if (typeof window !== 'undefined') return window.location.href;
  return '';
}
