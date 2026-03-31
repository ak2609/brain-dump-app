// CategoryPicker.js
// A modal that appears when the user wants to re-categorize a task.
// It receives the current category and a callback function for when 
// the user makes a new selection.

import React from 'react';
import { 
  View, Text, TouchableOpacity, Modal, StyleSheet, FlatList 
} from 'react-native';

const CATEGORIES = [
  'Work', 'Personal', 'Groceries', 'Health', 
  'Finance', 'Ideas', 'Urgent', 'Other'
];

// Color mapping so each category has its own badge color — 
// makes the UI scannable at a glance
const CATEGORY_COLORS = {
  Work: '#4F46E5',
  Personal: '#7C3AED',
  Groceries: '#059669',
  Health: '#DC2626',
  Finance: '#D97706',
  Ideas: '#2563EB',
  Urgent: '#EF4444',
  Other: '#6B7280',
};

export default function CategoryPicker({ visible, currentCategory, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Semi-transparent backdrop */}
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Change Category</Text>
          <Text style={styles.subtitle}>Current: {currentCategory}</Text>

          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  item === currentCategory && styles.selectedOption
                ]}
                onPress={() => onSelect(item)}
              >
                {/* Colored dot matching the category color */}
                <View style={[
                  styles.dot, 
                  { backgroundColor: CATEGORY_COLORS[item] || '#6B7280' }
                ]} />
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#F3F4F6',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  cancelButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});