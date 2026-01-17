import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useApp } from '../../utils/AppContext';
import type { TechnicalItem } from '../../types';

const COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  background: '#0F172A',
  card: '#1E293B',
  cardLight: '#334155',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  tech: '#3B82F6',
};

export default function TechnicalScreen() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddItem = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newItem: TechnicalItem = {
      id: `tech-${Date.now()}`,
      type: 'technical',
      title: title.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TECHNICAL_ITEM', payload: newItem });
    setShowModal(false);
    setTitle('');
    setNotes('');
  };

  const handleDeleteItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Item', 'Are you sure you want to delete this technical item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_TECHNICAL_ITEM', payload: itemId });
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={[COLORS.background, '#1E1B4B']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Technical</Text>
            <Text style={styles.subtitle}>Daily fundamentals</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowModal(true);
            }}
          >
            <Ionicons name="add" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {state.technicalItems.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No technical items yet</Text>
              <Text style={styles.emptySubtext}>
                Add scales, etudes, or warm-ups that you practice daily
              </Text>
            </View>
          )}

          {state.technicalItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeIn.delay(index * 50)}
              style={styles.itemCard}
            >
              <LinearGradient
                colors={[COLORS.card, COLORS.cardLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.itemGradient}
              >
                <View style={[styles.itemColorBar, { backgroundColor: COLORS.tech }]} />

                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Ionicons name="barbell" size={24} color={COLORS.tech} />
                    <Text style={styles.itemTitle}>{item.title}</Text>
                  </View>

                  {item.notes && (
                    <Text style={styles.itemNotes} numberOfLines={3}>
                      {item.notes}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Add Item Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Technical Item</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={28} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Title (e.g., C Major Scale)"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddItem}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Add Item</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: COLORS.card,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  itemCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  itemGradient: {
    flexDirection: 'row',
  },
  itemColorBar: {
    width: 5,
  },
  itemContent: {
    flex: 1,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  itemNotes: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EF444420',
    borderRadius: 8,
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
