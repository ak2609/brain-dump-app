// HomeScreen.js
// The entire app lives here — one screen, one purpose.
// Flow: user types → taps Organize → AI processes → list appears → 
// user can tap any category badge to correct it → correction saves to Supabase

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, SafeAreaView, Alert, ScrollView
} from 'react-native';
import { supabase } from '../supabaseClient';
import { organizeBrainDump } from '../organizeTask';
import CategoryPicker from '../components/CategoryPicker';

const CATEGORY_COLORS = {
  Work: '#4F46E5', Personal: '#7C3AED', Groceries: '#059669',
  Health: '#DC2626', Finance: '#D97706', Ideas: '#2563EB',
  Urgent: '#EF4444', Other: '#6B7280',
};

export default function HomeScreen() {
  // State variables — think of these as the app's "working memory"
  const [brainDump, setBrainDump] = useState('');    // the text the user typed
  const [tasks, setTasks] = useState([]);             // the organized task list
  const [loading, setLoading] = useState(false);      // controls the spinner
  const [pickerVisible, setPickerVisible] = useState(false);  // modal open/close
  const [selectedTask, setSelectedTask] = useState(null);     // which task is being edited

  // This runs when the user taps "Organize"
  const handleOrganize = async () => {
    if (!brainDump.trim()) {
      Alert.alert('Empty!', 'Type something in the box first.');
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Fetch the user's past corrections from Supabase.
      // We order by most recent and take the last 30 — enough context 
      // without making the AI prompt too long.
      const { data: corrections, error } = await supabase
        .from('corrections')
        .select('task_text, ai_category, user_category')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Supabase fetch error:', error);
      }

      // Step 2: Call the AI with the brain dump text + corrections context
      const organized = await organizeBrainDump(
        brainDump, 
        corrections || []
      );

      // Step 3: Assign a unique ID to each task for React's list rendering
      const tasksWithIds = organized.map((task, index) => ({
        ...task,
        id: `task-${index}-${Date.now()}`,
      }));

      setTasks(tasksWithIds);
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Check your internet connection.');
      console.error(err);
    } finally {
      // Always turn off loading, whether success or failure
      setLoading(false);
    }
  };

  // Called when the user taps a category badge — opens the picker modal
  const handleCategoryPress = (task) => {
    setSelectedTask(task);
    setPickerVisible(true);
  };

  // Called when the user selects a new category from the modal
  const handleCategoryCorrection = async (newCategory) => {
    if (!selectedTask || newCategory === selectedTask.category) {
      setPickerVisible(false);
      return;
    }

    const oldCategory = selectedTask.category;

    // Immediately update the UI — don't make the user wait for the DB write
    setTasks(prev =>
      prev.map(t =>
        t.id === selectedTask.id ? { ...t, category: newCategory } : t
      )
    );
    setPickerVisible(false);

    // Save the correction to Supabase in the background
    const { error } = await supabase.from('corrections').insert({
      task_text: selectedTask.task,
      ai_category: oldCategory,
      user_category: newCategory,
    });

    if (error) {
      console.error('Failed to save correction:', error);
      // Optionally revert the UI change if the DB write failed
    }
  };

  // Renders each task card in the list
  const renderTask = ({ item }) => (
    <View style={[styles.taskCard, item.urgent && styles.urgentCard]}>
      <View style={styles.taskContent}>
        {item.urgent && <Text style={styles.urgentFlag}>🔴 URGENT</Text>}
        <Text style={styles.taskText}>{item.task}</Text>
      </View>
      {/* Category badge — tap it to correct the category */}
      <TouchableOpacity
        style={[
          styles.categoryBadge,
          { backgroundColor: CATEGORY_COLORS[item.category] || '#6B7280' }
        ]}
        onPress={() => handleCategoryPress(item)}
      >
        <Text style={styles.categoryText}>{item.category}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <Text style={styles.header}>Brain Dump</Text>
        <Text style={styles.subheader}>
          Throw everything in. We'll sort it out.
        </Text>

        {/* The main text input */}
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder="e.g. Need to finish the pitch deck by Friday, buy eggs, call the dentist, look into that SaaS idea..."
          placeholderTextColor="#9CA3AF"
          value={brainDump}
          onChangeText={setBrainDump}
          textAlignVertical="top"
        />

        {/* Organize button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleOrganize}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Organize ✨</Text>
          )}
        </TouchableOpacity>

        {/* Results */}
        {tasks.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsHeader}>
              {tasks.length} tasks organized
            </Text>
            <Text style={styles.resultsHint}>
              Tap any category badge to correct it.
            </Text>
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={renderTask}
              scrollEnabled={false} // Parent ScrollView handles scrolling
            />
          </View>
        )}

      </ScrollView>

      {/* Category correction modal */}
      <CategoryPicker
        visible={pickerVisible}
        currentCategory={selectedTask?.category}
        onSelect={handleCategoryCorrection}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  input: {
    backgroundColor: 'white', borderRadius: 12, padding: 16,
    fontSize: 15, color: '#374151', minHeight: 140,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4F46E5', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  resultsSection: { marginTop: 8 },
  resultsHeader: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  resultsHint: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  taskCard: {
    backgroundColor: 'white', borderRadius: 10, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8, borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  urgentCard: { borderLeftWidth: 3, borderLeftColor: '#EF4444' },
  taskContent: { flex: 1, marginRight: 10 },
  urgentFlag: { fontSize: 10, fontWeight: '700', color: '#EF4444', marginBottom: 2 },
  taskText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  categoryBadge: { 
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 
  },
  categoryText: { color: 'white', fontSize: 11, fontWeight: '700' },
});