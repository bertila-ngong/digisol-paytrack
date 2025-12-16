// components/reminders_features/ReminderCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReminderCard({ reminder, onSend }) {
  const isSent = reminder.sent;

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
            <Text style={styles.type}>
              {reminder.type.toUpperCase()} Reminder
            </Text>
          </View>
        </View>

        {/* Custom Badge - NOT reusing Payment's StatusBadge */}
        <View style={[styles.statusBadge, isSent ? styles.sentBadge : styles.pendingBadge]}>
          <Text style={[styles.statusText, isSent ? styles.sentText : styles.pendingText]}>
            {isSent ? 'SENT' : 'PENDING'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.label}>Payment Due</Text>
          <Text style={styles.dueDate}>{reminder.dueDate}</Text>
        </View>

        {isSent && reminder.sentDate && (
          <View style={styles.footerRight}>
            <Text style={styles.label}>Sent On</Text>
            <Text style={styles.sentDate}>{reminder.sentDate}</Text>
          </View>
        )}
      </View>

      {!isSent && (
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sentBadge: {
    backgroundColor: '#DCFCE7',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sentText: {
    color: '#166534',
  },
  pendingText: {
    color: '#92400E',
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