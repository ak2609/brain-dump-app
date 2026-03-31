import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, KeyboardAvoidingView, Platform
} from 'react-native';

export default function CustomTagModal({ visible, customTags, onClose, onSaveTag, onDeleteTag }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
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
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>Manage Custom Tags</Text>
          <Text style={styles.subtitle}>Teach the AI your personal categories.</Text>

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
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Add Tag</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Existing Custom Tags</Text>
            {customTags.length === 0 ? (
              <Text style={styles.emptyText}>No custom tags yet.</Text>
            ) : (
              <FlatList
                data={customTags}
                keyExtractor={item => item.name}
                renderItem={renderTag}
                style={styles.list}
              />
            )}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40, maxHeight: '80%',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 20 },
  form: { marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 12, fontSize: 15, marginBottom: 12, color: '#374151'
  },
  descInput: { height: 60, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#4f46e5', padding: 14, borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
  listSection: { flex: 1, minHeight: 150 },
  listTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 10 },
  emptyText: { color: '#9ca3af', fontStyle: 'italic', fontSize: 14 },
  list: { flexGrow: 0 },
  tagItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 8,
  },
  tagName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  tagDesc: { fontSize: 12, color: '#4b5563', marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { color: '#ef4444', fontWeight: '500', fontSize: 13 },
  closeBtn: {
    marginTop: 20, alignItems: 'center', padding: 12,
  },
  closeBtnText: { color: '#6b7280', fontSize: 16, fontWeight: '600' }
});
