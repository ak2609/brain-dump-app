import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadTasks, saveTasks, loadSettings } from '../storage/taskStorage';
import { applyReminderOffset } from '../utils/dateUtils';
import { scheduleReminder } from '../utils/notificationUtils';

export default function ConfirmTasksScreen({ route, navigation }) {
  const { newTasks } = route.params;
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
      <Text style={styles.header}>Extracted {newTasks.length} tasks</Text>
      <Text style={styles.sub}>Review them before we save them to your list.</Text>

      {newTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🤔</Text>
          <Text style={styles.emptyText}>No tasks extracted. Try adding more detail to your brain dump.</Text>
        </View>
      ) : (
        <FlatList
          data={newTasks}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={styles.list}
        />
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={handleUndo}>
          <Text style={styles.cancelColor}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.confirmBtn, newTasks.length === 0 && styles.disabledBtn]} 
          onPress={handleConfirm}
          disabled={newTasks.length === 0}
        >
          <Text style={styles.confirmColor}>Confirm Add</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 16 },
  emptyText: { color: '#6B7280', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  list: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 'auto', paddingTop: 10 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', minHeight: 44, justifyContent: 'center', borderWidth: 1 },
  cancelBtn: { backgroundColor: '#F3F4F6', borderColor: 'transparent' },
  confirmBtn: { backgroundColor: 'transparent', borderColor: '#4F46E5' },
  disabledBtn: { opacity: 0.5 },
  cancelColor: { color: '#374151', fontWeight: '700', fontSize: 16 },
  confirmColor: { color: '#4F46E5', fontWeight: '700', fontSize: 16 }
});
