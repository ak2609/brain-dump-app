import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { organizeBrainDump } from '../organizeTask';
import TimelineDashboard from '../components/TimelineDashboard';
import TaskList from '../components/TaskList';
import CustomTagModal from '../components/CustomTagModal';
import { loadTasks, saveTasks, loadTags, saveTags } from '../storage/taskStorage';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [brainDump, setBrainDump] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [customTags, setCustomTags] = useState([]);
  const [tagModalVisible, setTagModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function init() {
        const storedTasks = await loadTasks();
        const storedTags = await loadTags();
        setTasks(storedTasks || []);
        setCustomTags(storedTags || []);
      }
      init();
    }, [])
  );

  const handleOrganize = async () => {
    if (!brainDump.trim()) {
      Alert.alert('Empty!', 'Type something in the box first.');
      return;
    }
    setLoading(true);
    try {
      const organized = await organizeBrainDump(brainDump, [], customTags);
      setBrainDump('');
      
      if (organized.length > 0) {
        navigation.navigate('ConfirmTasks', { newTasks: organized });
      } else {
        Alert.alert('No tasks found', 'We could not detect any actionable tasks.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(newTasks);
    await saveTasks(newTasks);
  };

  const toggleComplete = async (task) => {
    const now = new Date().toISOString();
    const newTasks = tasks.map(t =>
      t.id === task.id ? { ...t, completed: !t.completed, completedAt: !t.completed ? now : null } : t
    );
    setTasks(newTasks);
    await saveTasks(newTasks);
  };

  const clearCompleted = () => {
    Alert.alert("Clear Completed?", "This will permanently delete all finished tasks.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const active = tasks.filter(t => !t.completed);
        setTasks(active);
        await saveTasks(active);
      }}
    ]);
  };

  const handleSaveTag = async (newTag) => {
    if (!customTags.find(t => t.name.toLowerCase() === newTag.name.toLowerCase())) {
      const newTags = [...customTags, newTag];
      setCustomTags(newTags);
      await saveTags(newTags);
    }
  };
  const handleDeleteTag = async (tagName) => {
    const newTags = customTags.filter(t => t.name !== tagName);
    setCustomTags(newTags);
    await saveTags(newTags);
    const updatedTasks = tasks.map(t => t.category === tagName ? { ...t, category: 'Unsorted' } : t);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.header, { color: colors.text }]}>Brain Dump</Text>
            <Text style={[styles.subheader, { color: colors.textSecondary }]}>Throw everything in. We'll sort it out.</Text>
          </View>
          <TouchableOpacity 
            style={[styles.settingsIcon, { backgroundColor: colors.interactive }]} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.borderDark, shadowColor: colors.shadow }]}
          multiline
          numberOfLines={6}
          placeholder="e.g. Need to finish the pitch deck by Friday 4pm, buy milk, call the dentist on Sunday..."
          placeholderTextColor={colors.textMuted}
          value={brainDump}
          onChangeText={setBrainDump}
          textAlignVertical="top"
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]} onPress={handleOrganize} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Organize ✨</Text>}
        </TouchableOpacity>

        <View style={styles.subActions}>
          <TouchableOpacity style={styles.manageTagsBtn} onPress={() => setTagModalVisible(true)}>
            <Text style={[styles.manageTagsText, { color: colors.textSecondary }]}>+ Custom Tags</Text>
          </TouchableOpacity>
        </View>

        {tasks.length > 0 && (
          <View style={styles.dashboardSection}>
            <TimelineDashboard tasks={tasks} />
            <TaskList 
              tasks={tasks} 
              onComplete={toggleComplete} 
              onUpdate={handleUpdateTask} 
              onClearCompleted={clearCompleted} 
            />
          </View>
        )}
      </ScrollView>

      <CustomTagModal
        visible={tagModalVisible}
        customTags={customTags}
        onClose={() => setTagModalVisible(false)}
        onSaveTag={handleSaveTag}
        onDeleteTag={handleDeleteTag}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subheader: { fontSize: 14, marginBottom: 20 },
  settingsIcon: { padding: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  input: {
    borderRadius: 12, padding: 16,
    fontSize: 15, minHeight: 120,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    marginBottom: 16,
  },
  button: { borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  subActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, marginBottom: 12 },
  manageTagsBtn: { alignItems: 'center', minWidth: 44, minHeight: 44, justifyContent: 'center' },
  manageTagsText: { fontWeight: '600', fontSize: 14 },
  dashboardSection: { marginTop: 10 }
});