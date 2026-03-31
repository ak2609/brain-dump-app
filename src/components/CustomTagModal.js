import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, KeyboardAvoidingView, Platform, Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomTagModal({ visible, customTags, onClose, onSaveTag, onDeleteTag }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const insets = useSafeAreaInsets();

  const isValid = name.trim().length > 0 && description.trim().length > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSaveTag({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
  };

  const renderTag = ({ item }) => (
    <View style={styles.tagItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.tagName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.tagDesc}>{item.description}</Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={() => onDeleteTag(item.name)} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          {/* We wrap the modal inner content in a Pressable that does nothing 
              so tapping inside doesn't close the modal */}
          <Pressable 
            style={[styles.modalContent, { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 40) }]} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Manage Custom Tags</Text>
                <Text style={styles.subtitle}>Teach the AI your personal categories.</Text>
              </View>
              <TouchableOpacity style={styles.closeIconBtn} onPress={onClose}>
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Tag Name (e.g., Reading)"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, styles.descInput]}
              placeholder="Description (e.g., Books I want to read)"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <TouchableOpacity 
              style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]} 
              onPress={handleSave}
              disabled={!isValid}
            >
              <Text style={styles.saveBtnText}>Add Tag</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Existing Custom Tags</Text>
            {customTags.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🏷️</Text>
                <Text style={styles.emptyText}>No custom tags yet. Create one above to help the AI sort your life!</Text>
              </View>
            ) : (
              <FlatList
                data={customTags}
                keyExtractor={item => item.name}
                renderItem={renderTag}
                style={styles.list}
              />
            )}
          </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, maxHeight: '90%',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b7280' },
  closeIconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', borderRadius: 22 },
  closeIconText: { fontSize: 18, color: '#4B5563', fontWeight: 'bold' },
  form: { marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 12, fontSize: 15, marginBottom: 12, color: '#374151'
  },
  descInput: { height: 60, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: 'transparent', padding: 14, borderRadius: 8,
    alignItems: 'center', minHeight: 44, justifyContent: 'center',
    borderWidth: 1, borderColor: '#4f46e5'
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#4f46e5', fontWeight: '700', fontSize: 15 },
  listSection: { flex: 1, minHeight: 150 },
  listTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 10 },
  emptyContainer: { alignItems: 'center', paddingVertical: 20 },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  list: { flexGrow: 0 },
  tagItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 8,
  },
  tagName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  tagDesc: { fontSize: 12, color: '#4b5563', marginTop: 2 },
  deleteBtn: { padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 13 },
});
