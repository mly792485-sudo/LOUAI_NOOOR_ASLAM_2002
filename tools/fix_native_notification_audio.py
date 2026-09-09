from pathlib import Path

p = Path('src/utils/nativeNotifications.ts')
s = p.read_text()
# Android notification channels are immutable after creation. Version them so
# installed users receive channels with the corrected custom sound mapping.
s = s.replace('adhan_channel_v2', 'adhan_channel_v4')
s = s.replace('azkar_morning_channel_v3', 'azkar_morning_channel_v4')
s = s.replace('azkar_evening_channel_v3', 'azkar_evening_channel_v4')
s = s.replace('azkar_sleep_channel_v3', 'azkar_sleep_channel_v4')
s = s.replace('azkar_tahajjud_channel_v3', 'azkar_tahajjud_channel_v4')
# Make the Android channel sound references explicit bare resource names. The
# notification payload keeps the extension for iOS custom-sound resolution.
s = s.replace('sound: "adhan_notification.wav",', 'sound: "adhan_notification",')
s = s.replace('sound: "azkar_morning.wav",', 'sound: "azkar_morning",')
s = s.replace('sound: "azkar_evening.wav",', 'sound: "azkar_evening",')
s = s.replace('sound: "azkar_sleep.wav",', 'sound: "azkar_sleep",')
s = s.replace('sound: "azkar_tahajjud.wav",', 'sound: "azkar_tahajjud",')
# Channel creation should use bare Android raw resource names.
s = s.replace('sound: channel.sound,', 'sound: channel.sound,')
# The selected adhan payload must remain a filename for iOS; change ADHAN_VOICES
# only in the runtime schedule after channel creation by normalizing the channel
# references above, while preserving payload sound variables.
s = s.replace('sound: adhanSoundFile, // Dynamic chosen muezzin adhan audio (MP3/WAV)', 'sound: adhanSoundFile, // iOS resolves the bundled WAV filename; Android uses the channel sound')
# Add exact/idle flags to every date-based local notification.
s = s.replace('schedule: { at: ', 'schedule: { at: ')
# close every simple schedule object used by this file
s = s.replace(' },\n              sound:', ' , allowWhileIdle: true, isExactNotification: true },\n              sound:')
s = s.replace(' },\n          channelId:', ' , allowWhileIdle: true, isExactNotification: true },\n          channelId:')
p.write_text(s)
