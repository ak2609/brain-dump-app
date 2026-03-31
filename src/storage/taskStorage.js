import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@braindump_tasks';
const TAGS_KEY = '@braindump_custom_tags';
const SETTINGS_KEY = '@braindump_settings';

const DEFAULT_SETTINGS = {
  notificationsEnabled: false,
  defaultReminderOffset: '1h',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export async function loadTasks() {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load tasks', e);
    return [];
  }
}

export async function saveTasks(tasks) {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export async function loadTags() {
  try {
    const jsonValue = await AsyncStorage.getItem(TAGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load tags', e);
    return [];
  }
}

export async function saveTags(tags) {
  try {
    const jsonValue = JSON.stringify(tags);
    await AsyncStorage.setItem(TAGS_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save tags', e);
  }
}

export async function loadSettings() {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    return jsonValue != null ? { ...DEFAULT_SETTINGS, ...JSON.parse(jsonValue) } : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Failed to load settings', e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings) {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
