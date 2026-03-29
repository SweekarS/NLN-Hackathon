import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissionsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5B8C7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export interface NotificationConfig {
  dailyRituals: boolean;
  encouragement: boolean;
  progressNudges: boolean;
}

export async function scheduleDailyReminders(
  enabled: boolean,
  config: NotificationConfig,
  tasksLeft: boolean,
) {
  // Always clear existing scheduled notifications to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  // If user turned them off, skip entirely.
  if (!enabled) {
    return;
  }

  // Generate random times for morning, afternoon, and evening.
  // Morning: 8:00 AM - 11:59 AM
  // Afternoon: 1:00 PM - 4:59 PM (13:00 - 16:59)
  // Evening: 6:00 PM - 9:59 PM (18:00 - 21:59)
  const getRandomTime = (startHour: number, endHour: number) => {
    const hour =
      Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const minute = Math.floor(Math.random() * 60);
    return { hour, minute };
  };

  const scheduledPayloads: {
    title: string;
    body: string;
    time: { hour: number; minute: number };
    skipIfDone: boolean;
  }[] = [];

  // 1. Daily Rituals: 3 random nudges (Morning, Afternoon, Evening) if tasks aren't done.
  if (config.dailyRituals) {
    scheduledPayloads.push(
      {
        title: 'Morning Moment ☀️',
        body: 'Take a gentle breath and start your first mindfulness task for today.',
        time: getRandomTime(8, 11),
        skipIfDone: true,
      },
      {
        title: 'Afternoon Check-in 🌿',
        body: 'A quick nudge to check your wellness and log an activity.',
        time: getRandomTime(13, 16),
        skipIfDone: true,
      },
      {
        title: 'Evening Reflection 🌙',
        body: 'Wind down gently and complete your daily Phool tasks.',
        time: getRandomTime(18, 20),
        skipIfDone: true,
      },
    );
  }

  // 2. Encouragement: 1 entirely random positive affirmation (between 10 AM and 5 PM) regardless of task completion.
  if (config.encouragement) {
    const affirmations = [
      'Take a deep breath. You are doing great today.',
      "A gentle reminder that it's okay to rest.",
      'Every small step nurtures your growth on Phool.',
      'You are worthy of the peace you cultivate.',
    ];
    const randomAffirmation =
      affirmations[Math.floor(Math.random() * affirmations.length)];
    scheduledPayloads.push({
      title: 'Gentle Reminder 🌸',
      body: randomAffirmation,
      time: getRandomTime(10, 17),
      skipIfDone: false,
    });
  }

  // 3. Progress Nudges: 1 specific "Streak SOS" at 9:00 PM if tasks aren't done.
  if (config.progressNudges) {
    scheduledPayloads.push({
      title: 'Streak Saver 🛡️',
      body: 'Only a few hours left! Complete your Conditioning to protect your streak.',
      time: { hour: 21, minute: 0 },
      skipIfDone: true,
    });
  }

  for (const payload of scheduledPayloads) {
    // If the payload specifies skipIfDone and the user has finished all tasks, schedule for tomorrow instead.
    if (payload.skipIfDone && !tasksLeft) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(payload.time.hour, payload.time.minute, 0, 0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: tomorrow,
        },
      });
    } else {
      // User has tasks left. Schedule daily recurring (which will trigger today if time > now)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          sound: true,
        },
        trigger: {
          hour: payload.time.hour,
          minute: payload.time.minute,
          repeats: true,
        } as any,
      });
    }
  }
}
