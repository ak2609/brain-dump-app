import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { isOverdue, isToday, isUpcoming, getCompletedThisWeekCount } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';

export default function TimelineDashboard({ tasks }) {
  const { colors, isDark } = useTheme();
  const activeTasks = tasks.filter(t => !t.completed);
  
  const overdueCount = activeTasks.filter(t => isOverdue(t.dueDate)).length;
  const todayCount = activeTasks.filter(t => isToday(t.dueDate)).length;
  const upcomingCount = activeTasks.filter(t => isUpcoming(t.dueDate)).length;
  const completedThisWeek = getCompletedThisWeekCount(tasks);

  // Determine shadow style based on theme
  const shadowStyle = isDark ? 
    { elevation: 1, borderWidth: 1, borderColor: colors.borderDark } : 
    { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        
        {overdueCount > 0 && (
          <View style={[styles.card, shadowStyle, { backgroundColor: colors.danger }]}>
            <Text style={styles.count}>{overdueCount}</Text>
            <Text style={styles.label}>Overdue</Text>
          </View>
        )}

        <View style={[styles.card, shadowStyle, { backgroundColor: colors.warning }]}>
          <Text style={styles.count}>{todayCount}</Text>
          <Text style={styles.label}>Due Today</Text>
        </View>

        <View style={[styles.card, shadowStyle, { backgroundColor: colors.primary }]}>
          <Text style={styles.count}>{upcomingCount}</Text>
          <Text style={styles.label}>Upcoming</Text>
        </View>

        <View style={[styles.card, shadowStyle, { backgroundColor: colors.success }]}>
          <Text style={styles.count}>{completedThisWeek}</Text>
          <Text style={styles.label}>Done this Week</Text>
        </View>

        <View style={{ width: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  scroll: { paddingHorizontal: 20 },
  card: {
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center',
    width: 115, // Fixed uniform width as requested by product design principles
  },
  count: { color: 'white', fontSize: 24, fontWeight: '800', marginBottom: 2 },
  label: { color: 'white', fontSize: 13, fontWeight: '700', textAlign: 'center' }
});
