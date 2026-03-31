import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TaskCard from './TaskCard';
import { isOverdue, isToday, isUpcoming } from '../utils/dateUtils';

export default function TaskList({ tasks, onComplete, onUpdate, onClearCompleted }) {
  const [closedExpanded, setClosedExpanded] = useState(false);

  const active = tasks.filter(t => !t.completed);
  const closed = tasks.filter(t => t.completed);

  const overdue = active.filter(t => isOverdue(t.dueDate));
  const today = active.filter(t => isToday(t.dueDate));
  const upcoming = active.filter(t => isUpcoming(t.dueDate));
  const noDate = active.filter(t => !t.dueDate);

  const renderSection = (title, data, emptyMsg) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
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
        <View style={styles.emptyMainContainer}>
          <Text style={styles.emptyMainEmoji}>🪴</Text>
          <Text style={styles.emptyMainTitle}>All caught up!</Text>
          <Text style={styles.emptyMainText}>No active tasks right now. Dump your brain above to get started.</Text>
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
      <View style={styles.closedSection}>
        <TouchableOpacity 
          style={styles.headerRow} 
          onPress={() => setClosedExpanded(!closedExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.headerText}>Completed ({closed.length})</Text>
          <Text style={styles.chevron}>{closedExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {closedExpanded && (
          <View style={styles.listSection}>
            {closed.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={onClearCompleted}>
                <Text style={styles.clearText}>Clear Completed</Text>
              </TouchableOpacity>
            )}

            {closed.length === 0 ? (
             <Text style={styles.emptyText}>No closed tasks yet.</Text>
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
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 12 },
  emptyMainContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyMainEmoji: { fontSize: 40, marginBottom: 16 },
  emptyMainTitle: { fontSize: 18, color: '#111827', fontWeight: '700', marginBottom: 4 },
  emptyMainText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  
  closedSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginBottom: 10 },
  headerText: { fontSize: 16, fontWeight: '700', color: '#374151' },
  chevron: { fontSize: 12, color: '#6B7280', fontWeight: 'bold' },
  listSection: { paddingBottom: 10 },
  emptyText: { fontStyle: 'italic', color: '#9CA3AF', marginLeft: 4 },
  
  clearBtn: { alignSelf: 'flex-end', marginBottom: 12, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#FEE2E2', borderRadius: 6 },
  clearText: { color: '#B91C1C', fontWeight: '600', fontSize: 12 }
});
