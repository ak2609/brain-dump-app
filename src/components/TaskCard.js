import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDisplayDate, isOverdue } from '../utils/dateUtils';
import { snoozeReminder } from '../utils/notificationUtils';

export default function TaskCard({ item, onComplete, onUpdate }) {
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
      <View style={[styles.card, styles.editCard]}>
        <TextInput
          style={styles.editInput}
          value={editData.task}
          onChangeText={(t) => setEditData({ ...editData, task: t })}
          multiline
        />
        
        <View style={styles.editRow}>
          <TouchableOpacity style={styles.editBadge} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.editBadgeText}>
              {editData.dueDate ? formatDisplayDate(editData.dueDate, editData.hasTime) : 'Set Due Date'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.editBadge}
            onPress={() => setEditData({ ...editData, priority: editData.priority === 'High' ? 'Medium' : editData.priority === 'Medium' ? 'Low' : 'High' })}
          >
            <Text style={styles.editBadgeText}>{editData.priority || 'Medium'}</Text>
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
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Display State
  return (
    <View style={[styles.card, overdue && !item.completed && styles.overdueCard, item.completed && styles.completedCard]}>
      {/* Top Meta Row */}
      <View style={styles.metaRow}>
        <View style={styles.badgesWrapper}>
          <Text style={styles.categoryBadge}>{item.category || 'Unsorted'}</Text>
          {item.confidence && item.confidence < 0.7 && (
            <Text style={styles.suggestedBadge}>Suggested</Text>
          )}
          {item.priority && (
            <Text style={[styles.priorityBadge, item.priority === 'High' && styles.priorityHigh]}>
              {item.priority}
            </Text>
          )}
        </View>
        {overdue && <Text style={styles.overdueText}>Overdue</Text>}
      </View>

      {/* Main Content */}
      <Text style={[styles.title, item.completed && styles.titleCompleted]}>
        {item.task}
      </Text>

      {/* Timeline Row */}
      {(item.dueDate || item.reminderDate) && (
        <View style={styles.timelineRow}>
          {item.dueDate && (
            <Text style={styles.timelineChip}>
               🎯 {formatDisplayDate(item.dueDate, item.hasTime)}
            </Text>
          )}
          {item.reminderDate && !item.completed && (
            <Text style={styles.timelineChip}>
               🔔 Reminds {formatDisplayDate(item.reminderDate, true)}
            </Text>
          )}
        </View>
      )}

      {/* Action Row */}
      {!item.completed && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onComplete(item)}>
            <Text style={styles.actionGreen}>○</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setEditing(true)}>
            <Text style={styles.actionGray}>✎</Text>
          </TouchableOpacity>
          {item.reminderDate && (
            <TouchableOpacity style={styles.actionBtn} onPress={async () => {
               // Snooze action
               await snoozeReminder(item, 60); // snooze 1 hour
               alert('Snoozed for 1 hour');
            }}>
              <Text style={styles.actionBlue}>⏰ 1h</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  overdueCard: { borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  completedCard: { opacity: 0.5 },
  editCard: { backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' },
  
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  badgesWrapper: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  categoryBadge: { backgroundColor: '#F3F4F6', color: '#4B5563', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: '700' },
  suggestedBadge: { backgroundColor: '#FEF3C7', color: '#D97706', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: '600' },
  priorityBadge: { backgroundColor: '#E5E7EB', color: '#374151', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: '700' },
  priorityHigh: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  overdueText: { color: '#EF4444', fontSize: 11, fontWeight: '800', marginLeft: 6 },
  
  title: { fontSize: 16, color: '#111827', fontWeight: '500', lineHeight: 22, paddingBottom: 6 },
  titleCompleted: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  
  timelineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 10 },
  timelineChip: { backgroundColor: '#F8FAFC', color: '#475569', fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 6, marginTop: 4, gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44 },
  actionGreen: { color: '#059669', fontWeight: '800', fontSize: 22 },
  actionGray: { color: '#6B7280', fontWeight: '800', fontSize: 20 },
  actionBlue: { color: '#2563EB', fontWeight: '600', fontSize: 15 },

  // Edit Styles
  editInput: { backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, fontSize: 15, minHeight: 60, textAlignVertical: 'top', marginBottom: 10 },
  editRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  editBadge: { backgroundColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  editBadgeText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { padding: 10, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: '#4B5563', fontWeight: '600' },
  saveBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  saveText: { color: 'white', fontWeight: '700' }
});
