import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DEFAULT_CATEGORY_COLORS = {
  Work: '#4F46E5', Personal: '#7C3AED', Groceries: '#059669',
  Health: '#DC2626', Finance: '#D97706', Ideas: '#2563EB',
  Urgent: '#EF4444', Other: '#6B7280',
};

function getColorForTag(tag) {
  if (DEFAULT_CATEGORY_COLORS[tag]) return DEFAULT_CATEGORY_COLORS[tag];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return '#' + (hash & 0x00FFFFFF).toString(16).toUpperCase().padStart(6, '0');
}

export default function TaskAccordion({ tasks, onToggleComplete, onEditTask, onCategoryPress }) {
  const [activeExpanded, setActiveExpanded] = useState(true);
  const [closedExpanded, setClosedExpanded] = useState(true);

  const activeTasks = tasks.filter(t => !t.completed);
  const closedTasks = tasks.filter(t => t.completed);

  const renderTaskRow = (item, isClosed) => (
    <View key={item.id} style={[styles.taskCard, item.urgent && !isClosed && styles.urgentCard]}>
      
      {/* Checkbox toggle */}
      <TouchableOpacity onPress={() => onToggleComplete(item)} style={styles.checkButton}>
        <View style={[styles.checkbox, isClosed && styles.checkboxChecked]}>
          {isClosed && <Text style={styles.checkIcon}>✓</Text>}
        </View>
      </TouchableOpacity>
      
      {/* Content */}
      <View style={styles.taskContent}>
        {item.urgent && !isClosed && <Text style={styles.urgentFlag}>🔴 URGENT</Text>}
        <Text style={[styles.taskText, isClosed && styles.taskTextClosed]}>
          {item.task}
        </Text>
      </View>

      {/* Edit icon */}
      <TouchableOpacity style={styles.editBtn} onPress={() => onEditTask(item)}>
        <Text style={styles.editBtnText}>✎</Text>
      </TouchableOpacity>

      {/* Category badge */}
      <TouchableOpacity
        style={[styles.categoryBadge, { backgroundColor: getColorForTag(item.category) }]}
        onPress={() => onCategoryPress(item)}
      >
        <Text style={styles.categoryText}>{item.category}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* Active Tasks Section */}
      <TouchableOpacity 
        style={styles.headerRow} 
        onPress={() => setActiveExpanded(!activeExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.headerText}>Active ({activeTasks.length})</Text>
        <Text style={styles.chevron}>{activeExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {activeExpanded && (
        <View style={styles.listSection}>
          {activeTasks.length === 0 ? (
            <Text style={styles.emptyText}>No active tasks.</Text>
          ) : (
            activeTasks.map(t => renderTaskRow(t, false))
          )}
        </View>
      )}

      {/* Closed Tasks Section */}
      <TouchableOpacity 
        style={[styles.headerRow, styles.closedHeader]} 
        onPress={() => setClosedExpanded(!closedExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.headerText}>Closed ({closedTasks.length})</Text>
        <Text style={styles.chevron}>{closedExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {closedExpanded && (
        <View style={styles.listSection}>
          {closedTasks.length === 0 ? (
            <Text style={styles.emptyText}>No closed tasks yet.</Text>
          ) : (
            closedTasks.map(t => renderTaskRow(t, true))
          )}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#ebeef5', padding: 12, borderRadius: 8, marginBottom: 10,
  },
  closedHeader: { marginTop: 12, backgroundColor: '#f3f4f6' },
  headerText: { fontSize: 16, fontWeight: '700', color: '#374151' },
  chevron: { fontSize: 12, color: '#6b7280', fontWeight: 'bold' },
  listSection: { paddingBottom: 10 },
  emptyText: { fontStyle: 'italic', color: '#9ca3af', marginLeft: 4 },
  
  taskCard: {
    backgroundColor: 'white', borderRadius: 10, padding: 12,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  urgentCard: { borderLeftWidth: 3, borderLeftColor: '#EF4444' },
  checkButton: { marginRight: 10, padding: 2 },
  checkbox: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center'
  },
  checkboxChecked: { backgroundColor: '#48bb78', borderColor: '#48bb78' },
  checkIcon: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  
  taskContent: { flex: 1, marginRight: 8 },
  urgentFlag: { fontSize: 10, fontWeight: '700', color: '#EF4444', marginBottom: 2 },
  taskText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  taskTextClosed: { color: '#9ca3af', textDecorationLine: 'line-through' },
  
  editBtn: { paddingHorizontal: 12, paddingVertical: 5 },
  editBtnText: { fontSize: 16, color: '#6b7280' },

  categoryBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  categoryText: { color: 'white', fontSize: 11, fontWeight: '700' },
});
