import React from 'react';
import { 
  View, Text, TouchableOpacity, Modal, StyleSheet, FlatList 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  'Work', 'Personal', 'Groceries', 'Health', 
  'Finance', 'Ideas', 'Urgent', 'Other'
];

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
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Change Category</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Current: {currentCategory}</Text>

          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  item === currentCategory && { backgroundColor: colors.interactive }
                ]}
                onPress={() => onSelect(item)}
              >
                <View style={[
                  styles.dot, 
                  { backgroundColor: CATEGORY_COLORS[item] || colors.textMuted }
                ]} />
                <Text style={[styles.optionText, { color: colors.text }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.interactive }]} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});