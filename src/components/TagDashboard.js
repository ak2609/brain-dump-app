import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_CATEGORY_COLORS = {
  Work: '#4F46E5', Personal: '#7C3AED', Groceries: '#059669',
  Health: '#DC2626', Finance: '#D97706', Ideas: '#2563EB',
  Urgent: '#EF4444', Other: '#6B7280',
};

// Generate a color based on string hash for custom tags
function getColorForTag(tag) {
  if (DEFAULT_CATEGORY_COLORS[tag]) {
    return DEFAULT_CATEGORY_COLORS[tag];
  }
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = '#' + (hash & 0x00FFFFFF).toString(16).toUpperCase().padStart(6, '0');
  return color;
}

export default function TagDashboard({ tasks }) {
  const { colors, isDark } = useTheme();
  const activeTasks = tasks.filter(t => !t.completed);
  
  const counts = activeTasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  if (sortedCategories.length === 0) {
    return null;
  }

  const shadowStyle = isDark ? 
    { elevation: 1, borderWidth: 1, borderColor: colors.borderDark } : 
    { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 };


  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: colors.text }]}>Active Tasks Overview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {sortedCategories.map(category => (
          <View 
            key={category} 
            style={[styles.tagCard, shadowStyle, { backgroundColor: getColorForTag(category) }]}
          >
            <Text style={styles.tagCount}>{counts[category]}</Text>
            <Text style={styles.tagName}>{category}</Text>
          </View>
        ))}
        <View style={{ width: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  tagCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  tagCount: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  tagName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
