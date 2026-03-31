import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { loadTasks, saveTasks, loadSettings } from '../storage/taskStorage';
import { applyReminderOffset } from '../utils/dateUtils';
import { scheduleReminder } from '../utils/notificationUtils';

export default function ConfirmTasksScreen({ route, navigation }) {
  const { newTasks } = route.params;

  const handleConfirm = async () => {
    // 1. Load active tasks for deduplication
    const existing = await loadTasks();
    const activeTitles = existing.filter(t => !t.completed).map(t => t.task.toLowerCase());

    const settings = await loadSettings();

    // 2. Filter dupes
    const addedTasks = [];
    for (let t of newTasks) {
      if (activeTitles.includes(t.task.toLowerCase())) continue;

      // 3. Assign internal states
      t.id = `task-${Date.now()}-${Math.random()}`;
      t.completed = false;
      t.createdAt = new Date().toISOString();

      // 4. Auto-suggest notification offset if Date exists but no precise Reminder
      if (t.dueDate && !t.reminderDate && settings.notificationsEnabled) {
        t.reminderDate = applyReminderOffset(t.dueDate, settings.defaultReminderOffset);
      }

      // Schedule notification if available
      if (settings.notificationsEnabled && t.reminderDate) {
        t.notificationId = await scheduleReminder(t);
      }

      addedTasks.push(t);
    }

    if (addedTasks.length === 0) {
      Alert.alert("All Duplicates", "We didn't find any unique tasks to add.");
    } else {
      const merged = [...addedTasks, ...existing];
      await saveTasks(merged);
    }
    
    // Pass back successfully
    navigation.navigate('Home', { refresh: true });
  };

  const handleUndo = () => {
    navigation.goBack();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.task}</Text>
      <View style={styles.row}>
        <Text style={styles.badge}>{item.category || 'Unsorted'}</Text>
        <Text style={[styles.badge, item.priority === 'High' && { backgroundColor: '#FEE2E2', color: '#B91C1C' }]}>
          {item.priority}
        </Text>
      </View>
      {item.dueDate ? <Text style={styles.dateInfo}>Due: {new Date(item.dueDate).toLocaleString()}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Extracted {newTasks.length} tasks</Text>
      <Text style={styles.sub}>Review them before we save them to your list.</Text>

      <FlatList
        data={newTasks}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={handleUndo}>
          <Text style={styles.cancelColor}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={handleConfirm}>
          <Text style={styles.confirmColor}>Confirm Add</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  header: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  badge: { backgroundColor: '#F3F4F6', color: '#4B5563', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  dateInfo: { fontSize: 12, color: '#9CA3AF' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 'auto', paddingTop: 10 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F3F4F6' },
  confirmBtn: { backgroundColor: '#4F46E5' },
  cancelColor: { color: '#374151', fontWeight: '700', fontSize: 16 },
  confirmColor: { color: 'white', fontWeight: '700', fontSize: 16 }
});
