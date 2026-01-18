import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSegment } from '../utils/gebrianCalendar';
import { addSegment } from '../utils/storage';

export const AddSegmentScreen = ({ navigation }: any) => {
  const [segmentName, setSegmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!segmentName.trim()) {
      Alert.alert('Error', 'Please enter a segment name');
      return;
    }

    setIsSubmitting(true);
    try {
      const newSegment = createSegment(segmentName.trim());
      await addSegment(newSegment);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add segment. Please try again.');
      console.error('Error adding segment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Practice Segment</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Segment Name</Text>
              <TextInput
                style={styles.input}
                value={segmentName}
                onChangeText={setSegmentName}
                placeholder="e.g., Bach Prelude in C"
                placeholderTextColor="#94a3b8"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <Text style={styles.hint}>
                Enter the name of the piece or passage you want to practice
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>📅 Gebrian Calendar</Text>
              <Text style={styles.infoText}>
                Your segment will follow the Gebrian practice schedule:
              </Text>
              <Text style={styles.infoText}>
                • 3 practice days{'\n'}
                • 1 rest day{'\n'}
                • 1 practice day{'\n'}
                • 1 rest day{'\n'}
                • 1 practice day{'\n'}
                • 1 week rest{'\n'}
                • 3 practice days{'\n'}
                • 2 weeks rest{'\n'}
                • Repeat cycle
              </Text>
              <Text style={styles.infoText}>
                After 3 complete cycles, your segment will move to the
                Performance Ready bucket.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? 'Adding...' : 'Add Segment'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  hint: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
