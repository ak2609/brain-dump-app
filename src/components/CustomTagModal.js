import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, KeyboardAvoidingView, Platform, Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function CustomTagModal({ visible, customTags, onClose, onSaveTag, onDeleteTag }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const isValid = name.trim().length > 0 && description.trim().length > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSaveTag({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
  };

  const renderTag = ({ item }) => (
    <View style={[styles.tagItem, { backgroundColor: colors.interactive }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.tagName, { color: colors.text }]}>{item.name}</Text>
        {item.description ? (
          <Text style={[styles.tagDesc, { color: colors.textSecondary }]}>{item.description}</Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={() => onDeleteTag(item.name)} style={styles.deleteBtn}>
        <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete</Text>
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
          <Pressable 
            style={[styles.modalContent, { backgroundColor: colors.card, paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 40) }]} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Manage Custom Tags</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Teach the AI your personal categories.</Text>
              </View>
              <TouchableOpacity style={[styles.closeIconBtn, { backgroundColor: colors.interactive }]} onPress={onClose}>
                <Text style={[styles.closeIconText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
            <TextInput
              style={[styles.input, { borderColor: colors.borderDark, color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholder="Tag Name (e.g., Reading)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, styles.descInput, { borderColor: colors.borderDark, color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholder="Description (e.g., Books I want to read)"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <TouchableOpacity 
              style={[styles.saveBtn, { borderColor: colors.primary }, !isValid && styles.saveBtnDisabled]} 
              onPress={handleSave}
              disabled={!isValid}
            >
              <Text style={[styles.saveBtnText, { color: colors.primary }]}>Add Tag</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listSection}>
            <Text style={[styles.listTitle, { color: colors.textSecondary }]}>Existing Custom Tags</Text>
            {customTags.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🏷️</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No custom tags yet. Create one above to help the AI sort your life!</Text>
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
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, maxHeight: '90%',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13 },
  closeIconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  closeIconText: { fontSize: 18, fontWeight: 'bold' },
  form: { marginBottom: 20 },
  input: {
    borderWidth: 1, borderRadius: 8,
    padding: 12, fontSize: 15, marginBottom: 12
  },
  descInput: { height: 60, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: 'transparent', padding: 14, borderRadius: 8,
    alignItems: 'center', minHeight: 44, justifyContent: 'center',
    borderWidth: 1,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontWeight: '700', fontSize: 15 },
  listSection: { flex: 1, minHeight: 150 },
  listTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  emptyContainer: { alignItems: 'center', paddingVertical: 20 },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  list: { flexGrow: 0 },
  tagItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderRadius: 8, marginBottom: 8,
  },
  tagName: { fontSize: 15, fontWeight: '600' },
  tagDesc: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontWeight: '600', fontSize: 13 },
});
