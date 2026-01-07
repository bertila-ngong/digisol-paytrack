import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../shared/StatusBadge';

export default function ReminderCard({ reminder, onSend }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{reminder.accountName}</Text>
          <View style={styles.typeContainer}>
            <Ionicons
              name={reminder.type === 'email' ? 'mail-outline' : 'call-outline'}
              size={16}
              color="#7C3AED"
            />
            <Text style={styles.type}>{reminder.type.toUpperCase()} Reminder</Text>
          </View>
        </View>
        <StatusBadge status={reminder.sent ? 'paid' : 'pending'} />
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.label}>Payment Due</Text>
          <Text style={styles.dueDate}>{reminder.dueDate}</Text>
        </View>
        {reminder.sent && reminder.sentDate && (
          <View style={styles.footerRight}>
            <Text style={styles.label}>Sent On</Text>
            <Text style={styles.sentDate}>{reminder.sentDate}</Text>
          </View>
        )}
      </View>

      {!reminder.sent && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => onSend(reminder.id)}
        >
          <Text style={styles.buttonText}>Send Reminder Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  type: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  sentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#7C3AED',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});