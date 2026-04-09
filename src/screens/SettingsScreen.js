import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadSettings, saveSettings } from '../storage/taskStorage';
import { requestPermissions } from '../utils/notificationUtils';
import { useTheme } from '../context/ThemeContext';

import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState({
    notificationsEnabled: false,
    defaultReminderOffset: '1h',
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    themeMode: 'system'
  });

  useEffect(() => {
    (async () => {
      const data = await loadSettings();
      setSettings(data);
      if (data.themeMode && data.themeMode !== themeMode) {
        setThemeMode(data.themeMode);
      }
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

    if (key === 'themeMode') {
      setThemeMode(val);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('Home');
        }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>Settings</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: colors.text }]}>Appearance</Text>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Theme</Text>
        <View style={styles.pillRow}>
          {['system', 'light', 'dark'].map(mode => (
            <TouchableOpacity 
              key={mode}
              style={[styles.pill, { backgroundColor: settings.themeMode === mode ? colors.primary : colors.interactive }]}
              onPress={() => updateSetting('themeMode', mode)}
            >
              <Text style={[styles.pillText, { color: settings.themeMode === mode ? 'white' : colors.text }, settings.themeMode === mode && styles.pillTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.header, { color: colors.text, marginTop: 32 }]}>Notification Preferences</Text>
        
        <View style={[styles.row, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.label, { color: colors.text }]}>Enable Reminders</Text>
          <Switch 
            value={settings.notificationsEnabled}
            onValueChange={(val) => updateSetting('notificationsEnabled', val)}
            trackColor={{ false: colors.borderDark, true: colors.primary }}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Default Reminder Offset</Text>
        <View style={styles.pillRow}>
          {['15m', '1h', '1d'].map(offset => (
            <TouchableOpacity 
              key={offset}
              style={[styles.pill, { backgroundColor: settings.defaultReminderOffset === offset ? colors.primary : colors.interactive }]}
              onPress={() => updateSetting('defaultReminderOffset', offset)}
            >
              <Text style={[styles.pillText, { color: settings.defaultReminderOffset === offset ? 'white' : colors.text }, settings.defaultReminderOffset === offset && styles.pillTextActive]}>
                {offset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.helpText, { color: colors.textMuted }]}>
          When tasks have a due date but no explicit reminder, we will automatically schedule one this duration before the deadline.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 4 },
  backBtn: { padding: 4, marginRight: 12, marginLeft: -4 },
  topBarTitle: { fontSize: 24, fontWeight: '800' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 20, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  sectionHeader: { fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
  pillRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }, // flex: 1 ensures equal width
  pillText: { fontWeight: '600', textAlign: 'center' },
  pillTextActive: { color: 'white' },
  helpText: { fontSize: 13, lineHeight: 18 }
});
