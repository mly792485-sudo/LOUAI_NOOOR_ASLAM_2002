/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { AppSettings, PrayerTime } from "../types";

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isIOSPlatform = (): boolean => {
  return Capacitor.getPlatform() === "ios";
};

// Available Adhan Muezzin Voices with authentic audio
export const ADHAN_VOICES = [
  {
    id: "makkah-ali-mulla",
    nameAr: "أذان الحرم المكي — الشيخ علي ملا (دون إنترنت)",
    nameEn: "Makkah Adhan — Sheikh Ali Mulla (Offline)",
    file: "adhan_notification.wav",
  },
];

export interface NativePrayerScheduleDay {
  date: Date;
  prayers: Array<Pick<PrayerTime, "name" | "arabicName" | "time">>;
}

/**
 * Register Rich Notification Action Types (Buttons for iOS / Android Notification Center)
 */
export const registerRichNotificationActionTypes = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: "ADHAN_ACTIONS",
          actions: [
            {
              id: "open_app",
              title: "فتح التطبيق والدعاء 🤲",
              foreground: true,
            },
            {
              id: "listen_adhan",
              title: "الاستماع للأذان 🔊",
              foreground: true,
            },
          ],
        },
        {
          id: "PRAYER_ALERT_ACTIONS",
          actions: [
            {
              id: "open_app",
              title: "تأكيد الاستعداد للصلاة 🕌",
              foreground: true,
            },
          ],
        },
        {
          id: "AZKAR_ACTIONS",
          actions: [
            {
              id: "read_azkar",
              title: "قراءة الأذكار الآن 📖",
              foreground: true,
            },
            {
              id: "dismiss",
              title: "تم بحمد الله ✓",
              destructive: false,
              foreground: false,
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.warn("Could not register notification action types:", err);
  }
};

/**
 * Request notification permissions across iOS, Android, and Web with native iOS handling
 */
export const requestAllPermissions = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // 1. Register Action Types for Rich Notifications
      await registerRichNotificationActionTypes();

      // 2. Check existing permission
      let permStatus = await LocalNotifications.checkPermissions();

      // 3. Request if not yet granted
      if (permStatus.display !== "granted") {
        permStatus = await LocalNotifications.requestPermissions();
      }

      // 4. Set up notification channels for Android
      try {
        await LocalNotifications.createChannel({
          id: "prayer_channel_audio_v6",
          name: "تنبيهات الأذان ومواقيت الصلاة (الأذان الحقيقي)",
          description:
            "إشعارات الأذان المسموعة والكاملة عند دخول أوقات الصلوات الخمس مع صوت المؤذن المختار",
          importance: 5, // High / Max importance for lockscreen alert
          visibility: 1, // Public visibility on lockscreen
          sound: isIOSPlatform() ? "adhan_notification.wav" : "adhan_notification",
          vibration: true,
          lights: true,
          lightColor: "#10b981",
        });

        await LocalNotifications.createChannel({
          id: "prayer_time_silent_v1",
          name: "تنبيه دخول وقت الصلاة (صامت)",
          description: "تنبيه نصي صامت عند دخول وقت الصلاة قبل تشغيل الأذان بخمس دقائق",
          importance: 4,
          visibility: 1,
          vibration: false,
          lights: true,
          lightColor: "#10b981",
        });

        await LocalNotifications.createChannel({
          id: "azkar_morning_channel_v5",
          name: "تنبيهات الأذكار والسنن",
          description: "تذكيرات أذكار الصباح والمساء وقيام الليل وسورة الكهف",
          importance: 4,
          visibility: 1,
          sound: isIOSPlatform() ? "azkar_morning.wav" : "azkar_morning",
          vibration: true,
          lights: true,
          lightColor: "#f59e0b",
        });

        for (const channel of [
          { id: "azkar_evening_channel_v5", name: "أذكار المساء", sound: isIOSPlatform() ? "azkar_evening.wav" : "azkar_evening" },
          { id: "azkar_sleep_channel_v5", name: "أذكار النوم", sound: isIOSPlatform() ? "azkar_sleep.wav" : "azkar_sleep" },
          { id: "azkar_tahajjud_channel_v5", name: "قيام الليل والوتر", sound: isIOSPlatform() ? "azkar_tahajjud.wav" : "azkar_tahajjud" },
        ]) {
          await LocalNotifications.createChannel({
            id: channel.id,
            name: channel.name,
            description: "تنبيه إسلامي بصوت قصير لطيف",
            importance: 4,
            visibility: 1,
            sound: channel.sound,
            vibration: true,
            lights: true,
            lightColor: "#f59e0b",
          });
        }
      } catch (channelErr) {
        // Channels are Android specific; on iOS this is handled seamlessly by APNs / UserNotifications
      }

      return permStatus.display === "granted";
    } else if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    }
  } catch (err) {
    console.warn("iOS / Native Notification permission request error:", err);
  }
  return false;
};

/**
 * Check current notification permission status
 */
export const checkPermissionsStatus = async (): Promise<
  "granted" | "denied" | "prompt"
> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === "granted") return "granted";
      if (status.display === "denied") return "denied";
      return "prompt";
    } else if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") return "granted";
      if (Notification.permission === "denied") return "denied";
      return "prompt";
    }
  } catch (err) {
    console.warn("Error checking permissions:", err);
  }
  return "prompt";
};

/**
 * Schedules a short native test notification. This is used by the settings
 * screen instead of the browser Notification API when the app runs natively.
 */
export const scheduleNativeTestNotification = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const id = Math.floor(Date.now() % 1000000000);
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: "نور الإسلام | اختبار ناجح",
        body: "تم تشغيل إشعار الاختبار بصوت الأذان المحلي المرفق.",
        schedule: { at: new Date(Date.now() + 2000) },
        sound: isIOSPlatform() ? "adhan_notification.wav" : "adhan_notification",
        channelId: "prayer_channel_audio_v6",
        extra: { type: "test" },
      }],
    });
    return true;
  } catch (error) {
    console.error("Failed to schedule native test notification:", error);
    return false;
  }
};

/**
 * Schedule Native Background Lock-screen Push Notifications for iOS / iPhone & Android
 * Formatted with Rich Notification attributes (distinct titles, sound, icons, and lockscreen preview actions)
 */
export const scheduleAllNativeNotifications = async (
  prayers: NativePrayerScheduleDay['prayers'],
  settings: AppSettings,
  scheduleDays: NativePrayerScheduleDay[] = [{ date: new Date(), prayers }],
) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Cancel previous scheduled notifications to avoid duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications && pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notificationsToSchedule: any[] = [];
    let notifIdCounter = 1000;

    const today = new Date();
    // Resolve selected adhan sound file
    const selectedVoiceObj =
      ADHAN_VOICES.find((v) => v.id === settings.selectedAdhanVoice) ||
      ADHAN_VOICES[0];
    const adhanSoundFile = selectedVoiceObj.file;

    const getPrePrayerNotification = (prayerName: string, minutes: number) => {
      switch (prayerName) {
        case "Fajr":
          return {
            title: "الفجر بعد قليل 🕌",
            body: "توفيق يومك يبدأ الآن. اقطع انشغالك وتأهب لنداء الفلاح والوضوء. 🌿 اضغط لفتح التطبيق.",
          };
        case "Maghrib":
          return {
            title: "المغرب بعد قليل 🕌",
            body: "دقائق وتُفتح أبواب السماء للداعين.. توضأ واستعد. 👈 انقر لتعرف أوقات استجابة الدعاء.",
          };
        case "Isha":
          return {
            title: "العشاء بعد قليل 🕌",
            body: "من انتظر الصلاة فهو في صلاة. اغتنم الدقائق وتوضأ لتنال الأجر والبشائر النبوية.",
          };
        case "Dhuhr":
          return {
            title: "الظهر بعد قليل 🕌",
            body: "تفتح أبواب السماء عند زوال الشمس.. استعد بالوضوء وأرح قلبك بالصلاة. 🌿",
          };
        case "Asr":
          return {
            title: "العصر بعد قليل 🕌",
            body: "الصلاة الوسطى.. حافظ عليها واغتنم عظيم أجرها ونورها في صحيفتك. 🌿",
          };
        default:
          return {
            title: `اقترب موعد الأذان (${minutes} د) 🕌`,
            body: `استعد للوضوء وإجابة نداء الصلاة في وقتها.`,
          };
      }
    };

    const getAdhanNotification = (prayerName: string, arabicName: string) => {
      switch (prayerName) {
        case "Fajr":
          return {
            title: `حان الآن موعد أذان الفجر 🕌 (${selectedVoiceObj.nameAr.split("(")[1]?.replace(")", "") || "الحرم"})`,
            body: "قال ﷺ: «من تطهر فى بيته ثم مشى إلى بيت من بيوت الله، ليقضى فريضة من فرائض الله، كانت خطوتاه إحداهما تحط خطيئة، والأخرى ترفع درجة».",
          };
        case "Maghrib":
          return {
            title: `حان الآن موعد أذان المغرب 🕌 (${selectedVoiceObj.nameAr.split("(")[1]?.replace(")", "") || "الحرم"})`,
            body: "قال ﷺ: «من تطهر فى بيته ثم مشى إلى بيت من بيوت الله، ليقضى فريضة من فرائض الله، كانت خطوتاه إحداهما تحط خطيئة، والأخرى ترفع درجة».",
          };
        case "Isha":
          return {
            title: "حان الآن موعد أذان العشاء 🕌",
            body: "سُئل ﷺ: أيّ الأعمال أحبّ إلى الله؟ قال: «الصّلاة على وقتها» متفق عليه.",
          };
        case "Dhuhr":
          return {
            title: "حان الآن موعد أذان الظهر 🕌",
            body: "قال ﷺ: «إذا نودي بالصلاة فُتحت أبواب السماء واستُجيب الدعاء».",
          };
        case "Asr":
          return {
            title: "حان الآن موعد أذان العصر 🕌",
            body: "قال ﷺ: «من صلى البردين دخل الجنة» (البردان: الفجر والعصر).",
          };
        default:
          return {
            title: `حان الآن موعد أذان صلاة ${arabicName} 🕌`,
            body: `حيّ على الصلاة، حيّ على الفلاح.. تقبل الله طاعتكم.`,
          };
      }
    };

    // Schedule for the next 7 days in advance
    for (const scheduleDay of scheduleDays) {
      const targetDate = new Date(scheduleDay.date);
      targetDate.setHours(12, 0, 0, 0);

      scheduleDay.prayers.forEach((prayer) => {
        if (!prayer.time) return;
        const [pHour, pMin] = prayer.time.split(":").map(Number);

        // At prayer time: a silent text reminder only. Sunrise is never included.
        if (prayer.name !== "Sunrise" && settings.adhanReminder) {
          const exactTime = new Date(targetDate);
          exactTime.setHours(pHour, pMin, 0, 0);

          if (exactTime.getTime() > Date.now()) {
            notificationsToSchedule.push({
              id: notifIdCounter++,
              title: `حان وقت صلاة ${prayer.arabicName}`,
              body: `حان الآن وقت صلاة ${prayer.arabicName}. تقبل الله طاعتكم. سيبدأ الأذان بعد 5 دقائق.`,
              schedule: { at: exactTime , allowWhileIdle: true, isExactNotification: true },
              channelId: "prayer_time_silent_v1",
              iconColor: "#10b981",
              actionTypeId: "PRAYER_ALERT_ACTIONS",
              extra: {
                prayer: prayer.name,
                type: "prayer_time",
              },
            });

            // Play the authentic bundled recording five minutes after the time reminder.
            const adhanTime = new Date(exactTime.getTime() + 5 * 60 * 1000);
            if (adhanTime.getTime() > Date.now()) {
              const adhanData = getAdhanNotification(prayer.name, prayer.arabicName);
              notificationsToSchedule.push({
                id: notifIdCounter++,
                title: adhanData.title,
                body: `بدأ الآن أذان صلاة ${prayer.arabicName}. حيّ على الصلاة، حيّ على الفلاح.`,
                schedule: { at: adhanTime, allowWhileIdle: true, isExactNotification: true },
                sound: adhanSoundFile,
                channelId: "prayer_channel_audio_v6",
                iconColor: "#10b981",
                actionTypeId: "ADHAN_ACTIONS",
                extra: { prayer: prayer.name, type: "adhan", voice: settings.selectedAdhanVoice },
              });
            }
          }
        }

      });

      // E. Sleep Azkar Notification (Every night at 09:32 PM)
      const sleepAzkarTime = new Date(targetDate);
      sleepAzkarTime.setHours(21, 32, 0, 0);
      if (sleepAzkarTime.getTime() > Date.now()) {
        notificationsToSchedule.push({
          id: notifIdCounter++,
          title: "أذكار النوم 🌙",
          body: "أعظم آية في القرآن، وقاية لك من الشيطان، لازمها كل ليلة قبل منامك، اقرأها الآن من هنا 👈",
          schedule: { at: sleepAzkarTime , allowWhileIdle: true, isExactNotification: true },
          channelId: "azkar_sleep_channel_v5",
          sound: isIOSPlatform() ? "azkar_sleep.wav" : "azkar_sleep",
          iconColor: "#38bdf8",
          actionTypeId: "AZKAR_ACTIONS",
          extra: { type: "sleep_azkar" },
        });
      }

      // E. Morning Azkar (06:30 AM)
      if (settings.azkarReminder && settings.morningAzkarReminder !== false) {
        const morningAzkarTime = new Date(targetDate);
        morningAzkarTime.setHours(6, 30, 0, 0);
        if (morningAzkarTime.getTime() > Date.now()) {
          notificationsToSchedule.push({
            id: notifIdCounter++,
            title: "🌅 أذكار الصباح (حصنك الحصين)",
            body: "«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ» - افتتح يومك المبارك بذكر الله وانعم بالحفظ والسكينة والبركة.",
            schedule: { at: morningAzkarTime, allowWhileIdle: true, isExactNotification: true },
            channelId: "azkar_morning_channel_v5",
            sound: isIOSPlatform() ? "azkar_morning.wav" : "azkar_morning",
            iconColor: "#f59e0b",
            actionTypeId: "AZKAR_ACTIONS",
            extra: { type: "morning_azkar" },
          });
        }
      }

      // F. Evening Azkar (05:00 PM)
      if (settings.azkarReminder && settings.eveningAzkarReminder !== false) {
        const eveningAzkarTime = new Date(targetDate);
        eveningAzkarTime.setHours(17, 0, 0, 0);
        if (eveningAzkarTime.getTime() > Date.now()) {
          notificationsToSchedule.push({
            id: notifIdCounter++,
            title: "🌆 أذكار المساء (سكينة وطمأنينة)",
            body: "«أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ» - حصّن نفسك وأهلك بأذكار المساء النبوية الشريفة.",
            schedule: { at: eveningAzkarTime, allowWhileIdle: true, isExactNotification: true },
            channelId: "azkar_evening_channel_v5",
            sound: isIOSPlatform() ? "azkar_evening.wav" : "azkar_evening",
            iconColor: "#10b981",
            actionTypeId: "AZKAR_ACTIONS",
            extra: { type: "evening_azkar" },
          });
        }
      }

      // G. Friday Surah Al-Kahf (Every Friday at 09:00 AM)
      if (targetDate.getDay() === 5 && settings.fridayKahfReminder !== false) {
        const fridayTime = new Date(targetDate);
        fridayTime.setHours(9, 0, 0, 0);
        if (fridayTime.getTime() > Date.now()) {
          notificationsToSchedule.push({
            id: notifIdCounter++,
            title: "🕌 جمعة مباركة (سورة الكهف والصلاة على النبي ﷺ)",
            body: "نورٌ ما بين الجمعتين.. لا تنسَ قراءة سورة الكهف والإكثار من الصلاة والسلام على رسول الله ﷺ والدعاء في ساعة الاستجابة.",
            schedule: { at: fridayTime, allowWhileIdle: true, isExactNotification: true },
            channelId: "azkar_evening_channel_v5",
            sound: isIOSPlatform() ? "azkar_evening.wav" : "azkar_evening",
            iconColor: "#10b981",
            actionTypeId: "AZKAR_ACTIONS",
            extra: { type: "friday_kahf" },
          });
        }
      }

      // H. Tahajjud & Witr (03:30 AM)
      if (settings.tahajjudReminder !== false) {
        const tahajjudTime = new Date(targetDate);
        tahajjudTime.setHours(3, 30, 0, 0);
        if (tahajjudTime.getTime() > Date.now()) {
          notificationsToSchedule.push({
            id: notifIdCounter++,
            title: "🌙 قيام الليل والوتر (الثلث الأخير من الليل)",
            body: "ينزل ربنا تبارك وتعالى إلى السماء الدنيا كل ليلة.. هل من تائب فأتوب عليه؟ صلاة الوتر ركعة خير من الدنيا وما فيها.",
            schedule: { at: tahajjudTime, allowWhileIdle: true, isExactNotification: true },
            channelId: "azkar_tahajjud_channel_v5",
            sound: isIOSPlatform() ? "azkar_tahajjud.wav" : "azkar_tahajjud",
            iconColor: "#6366f1",
            actionTypeId: "AZKAR_ACTIONS",
            extra: { type: "tahajjud" },
          });
        }
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule.slice(0, 60),
      });
      console.log(
        `Successfully scheduled ${notificationsToSchedule.length} native rich lock-screen notifications.`,
      );
    }
  } catch (error) {
    console.error("Failed to schedule native notifications:", error);
  }
};
