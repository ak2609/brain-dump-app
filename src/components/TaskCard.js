import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { formatDisplayDate, isOverdue } from '../utils/dateUtils';
import { snoozeReminder } from '../utils/notificationUtils';
import { useTheme } from '../context/ThemeContext';

export default function TaskCard({ item, onComplete, onUpdate }) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...item });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    onUpdate({ ...item, ...editData });
    setEditing(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditData({ ...editData, dueDate: selectedDate.toISOString(), hasTime: true });
    }
  };

  const overdue = isOverdue(item.dueDate) && !item.completed;

  if (editing) {
    return (
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.borderDark }]}>
        <TextInput
          style={[styles.editInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
          value={editData.task}
          onChangeText={(t) => setEditData({ ...editData, task: t })}
          multiline
        />
        
        <View style={styles.editRow}>
          <TouchableOpacity 
            style={[styles.editBadge, { backgroundColor: colors.interactive, borderColor: colors.borderDark, borderWidth: 1 }]} 
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.editBadgeText, { color: colors.text }]}>
              {editData.dueDate ? formatDisplayDate(editData.dueDate, editData.hasTime) : 'Set Due Date'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.editBadge, { backgroundColor: colors.interactive, borderColor: colors.borderDark, borderWidth: 1 }]}
            onPress={() => setEditData({ ...editData, priority: editData.priority === 'High' ? 'Medium' : editData.priority === 'Medium' ? 'Low' : 'High' })}
          >
            <Ionicons name="flag-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.editBadgeText, { color: colors.text }]}>{editData.priority || 'Medium'}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={editData.dueDate ? new Date(editData.dueDate) : new Date()}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Display State
  return (
    <View style={[
      styles.card, 
      { backgroundColor: colors.card, borderColor: colors.border },
      overdue && !item.completed && { borderLeftWidth: 4, borderLeftColor: colors.danger },
      item.completed && styles.completedCard
    ]}>
      {/* Top Meta Row */}
      <View style={styles.metaRow}>
        <View style={styles.badgesWrapper}>
          <Text style={[styles.categoryBadge, { backgroundColor: colors.border, color: colors.textSecondary }]}>{item.category || 'Unsorted'}</Text>
          {item.confidence && item.confidence < 0.7 && (
            <Text style={[styles.suggestedBadge, { backgroundColor: colors.warningMuted, color: colors.warning }]}>Suggested</Text>
          )}
          {item.priority && (
            <Text style={[styles.priorityBadge, { backgroundColor: colors.interactive, color: colors.textSecondary }, item.priority === 'High' && { backgroundColor: colors.dangerMuted, color: colors.danger }]}>
              {item.priority}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {overdue && <Text style={[styles.overdueText, { color: colors.danger }]}>Overdue</Text>}
          {!item.completed && (
            <TouchableOpacity style={styles.actionIconBtn} onPress={() => setEditing(true)}>
              <Ionicons name="pencil-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Row: Checkbox + Title */}
      <View style={styles.mainContentRow}>
        <TouchableOpacity style={styles.checkBtn} onPress={() => onComplete(item)}>
          <Ionicons 
            name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
            size={28} 
            color={item.completed ? colors.success : colors.textMuted} 
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }, item.completed && [styles.titleCompleted, { color: colors.textMuted }]]}>
          {item.task}
        </Text>
      </View>

      {/* Timeline Row */}
      {(item.dueDate || item.reminderDate) && (
        <View style={styles.timelineRow}>
          {item.dueDate && (
             <View style={[styles.timelineChip, { backgroundColor: colors.background }]}>
                <Ionicons name="locate-outline" size={14} color={colors.primary} />
                <Text style={[styles.timelineChipText, { color: colors.textSecondary }]}>
                  {formatDisplayDate(item.dueDate, item.hasTime)}
                </Text>
             </View>
          )}
          {item.reminderDate && !item.completed && (
            <View style={[styles.timelineChip, { backgroundColor: colors.background }]}>
              <Ionicons name="notifications-outline" size={14} color={colors.warning} />
              <Text style={[styles.timelineChipText, { color: colors.textSecondary }]}>
                Reminds {formatDisplayDate(item.reminderDate, true)}
              </Text>
            </View>
          )}
          {item.reminderDate && !item.completed && (
            <TouchableOpacity 
              style={[styles.timelineChip, { backgroundColor: colors.primaryMuted }]} 
              onPress={async () => {
                await snoozeReminder(item, 60);
                alert('Snoozed for 1 hour');
              }}
            >
              <Ionicons name="alarm-outline" size={14} color={colors.primary} />
              <Text style={[styles.timelineChipText, { color: colors.primary, fontWeight: '700' }]}>+1h</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, elevation: 1, shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { height: 1, width: 0 } },
  completedCard: { opacity: 0.6 },
  
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  badgesWrapper: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: '700', overflow: 'hidden' },
  suggestedBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: '600', overflow: 'hidden' },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: '700', overflow: 'hidden' },
  overdueText: { fontSize: 11, fontWeight: '800', marginLeft: 6, marginRight: 8 },
  actionIconBtn: { padding: 4, marginLeft: 4 },

  mainContentRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkBtn: { marginRight: 12, marginTop: -2 }, // Align checkbox with first line of text
  title: { fontSize: 16, fontWeight: '500', lineHeight: 22, flex: 1, paddingBottom: 6 },
  titleCompleted: { textDecorationLine: 'line-through' },
  
  timelineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, marginLeft: 40, marginBottom: 4 }, // align under text, 40 is approx width of checkbox + margin
  timelineChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 4, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  timelineChipText: { fontSize: 12, fontWeight: '500' },
  
  // Edit Styles
  editInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 15, minHeight: 60, textAlignVertical: 'top', marginBottom: 10 },
  editRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  editBadge: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minHeight: 44, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  editBadgeText: { fontWeight: '600', fontSize: 13 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { padding: 10, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  cancelText: { fontWeight: '600' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  saveText: { color: 'white', fontWeight: '700' }
});
