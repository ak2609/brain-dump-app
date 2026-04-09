import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from './TaskCard';
import { isOverdue, isToday, isUpcoming } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';

export default function TaskList({ tasks, onComplete, onUpdate, onClearCompleted }) {
  const { colors } = useTheme();
  const [closedExpanded, setClosedExpanded] = useState(false);

  const active = tasks.filter(t => !t.completed);
  const closed = tasks.filter(t => t.completed);

  const overdue = active.filter(t => isOverdue(t.dueDate));
  const today = active.filter(t => isToday(t.dueDate));
  const upcoming = active.filter(t => isUpcoming(t.dueDate));
  const noDate = active.filter(t => !t.dueDate);

  const renderSection = (title, data) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {data.map(t => (
          <TaskCard 
            key={t.id} 
            item={t} 
            onComplete={onComplete} 
            onUpdate={onUpdate} 
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {active.length === 0 ? (
        <View style={[styles.emptyMainContainer, { backgroundColor: colors.card, borderColor: colors.borderDark }]}>
          <Text style={styles.emptyMainEmoji}>🪴</Text>
          <Text style={[styles.emptyMainTitle, { color: colors.text }]}>All caught up!</Text>
          <Text style={[styles.emptyMainText, { color: colors.textSecondary }]}>No active tasks right now. Dump your brain above to get started.</Text>
        </View>
      ) : (
        <>
          {renderSection('Overdue', overdue)}
          {renderSection('Due Today', today)}
          {renderSection('Upcoming', upcoming)}
          {renderSection('No Date', noDate)}
        </>
      )}

      {/* Closed Tasks Section */}
      <View style={[styles.closedSection, { borderTopColor: colors.borderDark }]}>
        <TouchableOpacity 
          style={[styles.headerRow, { backgroundColor: colors.interactive }]} 
          onPress={() => setClosedExpanded(!closedExpanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Completed ({closed.length})</Text>
          <Ionicons name={closedExpanded ? "chevron-down" : "chevron-forward"} size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        {closedExpanded && (
          <View style={styles.listSection}>
            {closed.length > 0 && (
              <TouchableOpacity style={[styles.clearBtn, { backgroundColor: colors.dangerMuted }]} onPress={onClearCompleted}>
                <Text style={[styles.clearText, { color: colors.danger }]}>Clear Completed</Text>
              </TouchableOpacity>
            )}

            {closed.length === 0 ? (
             <Text style={[styles.emptyText, { color: colors.textMuted }]}>No closed tasks yet.</Text>
            ) : (
             closed.map(t => (
                <TaskCard 
                  key={t.id} 
                  item={t} 
                  onComplete={onComplete} 
                  onUpdate={onUpdate} 
                />
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  emptyMainContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
  emptyMainEmoji: { fontSize: 40, marginBottom: 16 },
  emptyMainTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptyMainText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  
  closedSection: { marginTop: 10, borderTopWidth: 1, paddingTop: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 10 },
  headerText: { fontSize: 16, fontWeight: '700' },
  listSection: { paddingBottom: 10 },
  emptyText: { fontStyle: 'italic', marginLeft: 4 },
  
  clearBtn: { alignSelf: 'flex-end', marginBottom: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  clearText: { fontWeight: '600', fontSize: 12 }
});
