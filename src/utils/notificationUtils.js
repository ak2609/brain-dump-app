import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up behavior when notification is received while app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });
  }

  return finalStatus === 'granted';
}

export async function scheduleReminder(task) {
  if (!task.reminderDate) return null;
  const d = new Date(task.reminderDate);
  if (isNaN(d) || d.getTime() <= Date.now()) return null;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: task.priority === 'High' ? '🚨 ' + task.task : task.task,
        body: task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleString()}` : 'Time to get this done!',
        data: { taskId: task.id },
      },
      trigger: d, // the exact Date instance
    });
    return identifier;
  } catch (error) {
    console.warn("Failed scheduling local notification:", error);
    return null;
  }
}

export async function cancelReminder(identifier) {
  if (!identifier) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (e) {
    console.warn("Could not cancel notification", e);
  }
}

export async function snoozeReminder(task, minutes) {
  const newDate = new Date();
  newDate.setMinutes(newDate.getMinutes() + minutes);
  
  const snzTask = { ...task, reminderDate: newDate.toISOString() };
  return await scheduleReminder(snzTask);
}
