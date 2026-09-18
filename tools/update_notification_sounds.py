from pathlib import Path
p = Path('src/utils/nativeNotifications.ts')
s = p.read_text()
# Prayer reminders and iqama must use the adhan channel, never an azkar channel.
s = s.replace('sound: "adhan_notification.wav",\n              channelId: "azkar_channel_v2",', 'sound: "adhan_notification.wav",\n              channelId: "adhan_channel_v2",', 2)
# Each azkar category gets a separate Android channel and bundled short sound.
s = s.replace('title: "أذكار النوم 🌙",\n          body: "أعظم آية في القرآن، وقاية لك من الشيطان، لازمها كل ليلة قبل منامك، اقرأها الآن من هنا 👈",\n          schedule: { at: sleepAzkarTime },\n          channelId: "azkar_channel_v2",\n          sound: "adhan_notification.wav",', 'title: "أذكار النوم 🌙",\n          body: "أعظم آية في القرآن، وقاية لك من الشيطان، لازمها كل ليلة قبل منامك، اقرأها الآن من هنا 👈",\n          schedule: { at: sleepAzkarTime },\n          channelId: "azkar_sleep_channel_v2",\n          sound: "azkar_sleep.wav",')
s = s.replace('channelId: "azkar_channel_v2",\n            sound: "adhan_notification.wav",\n            iconColor: "#f59e0b",', 'channelId: "azkar_channel_v2",\n            sound: "azkar_morning.wav",\n            iconColor: "#f59e0b",')
s = s.replace('channelId: "azkar_channel_v2",\n            sound: "adhan_notification.wav",\n            iconColor: "#10b981",', 'channelId: "azkar_evening_channel_v2",\n            sound: "azkar_evening.wav",\n            iconColor: "#10b981",', 2)
s = s.replace('channelId: "azkar_channel_v2",\n            sound: "adhan_notification.wav",\n            iconColor: "#6366f1",', 'channelId: "azkar_tahajjud_channel_v2",\n            sound: "azkar_tahajjud.wav",\n            iconColor: "#6366f1",')
p.write_text(s)
print('notification sound mappings updated')
