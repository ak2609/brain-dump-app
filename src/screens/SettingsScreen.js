import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadSettings, saveSettings } from '../storage/taskStorage';
import { requestPermissions } from '../utils/notificationUtils';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    notificationsEnabled: false,
    defaultReminderOffset: '1h',
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  useEffect(() => {
    (async () => {
      const data = await loadSettings();
      setSettings(data);
    })();
  }, []);

  const updateSetting = async (key, val) => {
    const newSettings = { ...settings, [key]: val };
    
    // If turning on notifications, prompt permissions
    if (key === 'notificationsEnabled' && val === true) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert("Denied", "You need to allow notifications in device settings.");
        newSettings.notificationsEnabled = false;
      }
    }
    
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
      <Text style={styles.header}>Notification Preferences</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Enable Reminders</Text>
        <Switch 
          value={settings.notificationsEnabled}
          onValueChange={(val) => updateSetting('notificationsEnabled', val)}
          trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
        />
      </View>

      <Text style={styles.sectionHeader}>Default Reminder Offset</Text>
      <View style={styles.pillRow}>
        {['15m', '1h', '1d'].map(offset => (
          <TouchableOpacity 
            key={offset}
            style={[styles.pill, settings.defaultReminderOffset === offset && styles.pillActive]}
            onPress={() => updateSetting('defaultReminderOffset', offset)}
          >
            <Text style={[styles.pillText, settings.defaultReminderOffset === offset && styles.pillTextActive]}>
              {offset}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.helpText}>
        When tasks have a due date but no explicit reminder, we will automatically schedule one this duration before the deadline.
      </Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  header: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151' },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' },
  pillRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  pill: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#E5E7EB', borderRadius: 20 },
  pillActive: { backgroundColor: '#4F46E5' },
  pillText: { color: '#4B5563', fontWeight: '600' },
  pillTextActive: { color: 'white' },
  helpText: { fontSize: 13, color: '#9CA3AF', lineHeight: 18 }
});
