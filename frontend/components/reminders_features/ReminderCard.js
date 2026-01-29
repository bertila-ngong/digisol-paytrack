import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StatusBadge from '../shared/StatusBadge';

export default function ReminderCard({ reminder, onSend }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{reminder.accountName}</Text>
          <Text style={styles.accountNumber}>Acc: {reminder.accountNumber}</Text>
        </View>
        <StatusBadge status={reminder.status} />
      </View>

      <View style={styles.details}>
        <Text style={styles.label}>Amount Due</Text>
        <Text style={styles.amount}>{reminder.amount}</Text>

        <Text style={styles.label}>Due Date</Text>
        <Text style={styles.dueDate}>{reminder.dueDate}</Text>
      </View>

      {reminder.status !== 'paid' && (
        <TouchableOpacity style={styles.button} onPress={() => onSend(reminder.id)}>
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
  },
  accountNumber: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  details: {
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  dueDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#7C3AED',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});