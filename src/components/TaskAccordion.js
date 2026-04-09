import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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
  const { colors } = useTheme();
  const [activeExpanded, setActiveExpanded] = useState(true);
  const [closedExpanded, setClosedExpanded] = useState(true);

  const activeTasks = tasks.filter(t => !t.completed);
  const closedTasks = tasks.filter(t => t.completed);

  const renderTaskRow = (item, isClosed) => (
    <View key={item.id} style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }, item.urgent && !isClosed && { borderLeftWidth: 3, borderLeftColor: colors.danger }]}>
      
      {/* Checkbox toggle */}
      <TouchableOpacity onPress={() => onToggleComplete(item)} style={styles.checkButton}>
        <Ionicons 
            name={isClosed ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={isClosed ? colors.success : colors.textMuted} 
        />
      </TouchableOpacity>
      
      {/* Content */}
      <View style={styles.taskContent}>
        {item.urgent && !isClosed && <Text style={[styles.urgentFlag, { color: colors.danger }]}>🔴 URGENT</Text>}
        <Text style={[styles.taskText, { color: colors.text }, isClosed && [styles.taskTextClosed, { color: colors.textMuted }]]}>
          {item.task}
        </Text>
      </View>

      {/* Edit icon */}
      <TouchableOpacity style={styles.editBtn} onPress={() => onEditTask(item)}>
        <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
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
        style={[styles.headerRow, { backgroundColor: colors.interactive }]} 
        onPress={() => setActiveExpanded(!activeExpanded)}
        activeOpacity={0.7}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>Active ({activeTasks.length})</Text>
        <Ionicons name={activeExpanded ? "chevron-down" : "chevron-forward"} size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {activeExpanded && (
        <View style={styles.listSection}>
          {activeTasks.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active tasks.</Text>
          ) : (
            activeTasks.map(t => renderTaskRow(t, false))
          )}
        </View>
      )}

      {/* Closed Tasks Section */}
      <TouchableOpacity 
        style={[styles.headerRow, styles.closedHeader, { backgroundColor: colors.borderDark }]} 
        onPress={() => setClosedExpanded(!closedExpanded)}
        activeOpacity={0.7}
      >
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>Closed ({closedTasks.length})</Text>
        <Ionicons name={closedExpanded ? "chevron-down" : "chevron-forward"} size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {closedExpanded && (
        <View style={styles.listSection}>
          {closedTasks.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No closed tasks yet.</Text>
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
    padding: 12, borderRadius: 8, marginBottom: 10,
  },
  closedHeader: { marginTop: 12 },
  headerText: { fontSize: 16, fontWeight: '700' },
  listSection: { paddingBottom: 10 },
  emptyText: { fontStyle: 'italic', marginLeft: 4 },
  
  taskCard: {
    borderRadius: 10, padding: 12,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  checkButton: { marginRight: 10, padding: 2 },
  
  taskContent: { flex: 1, marginRight: 8 },
  urgentFlag: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
  taskText: { fontSize: 14, lineHeight: 20 },
  taskTextClosed: { textDecorationLine: 'line-through' },
  
  editBtn: { paddingHorizontal: 12, paddingVertical: 5 },

  categoryBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  categoryText: { color: 'white', fontSize: 11, fontWeight: '700' },
});
