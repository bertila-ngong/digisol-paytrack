import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StatusBadge from '../shared/StatusBadge';

export default function PaymentCard({ payment, onMarkPaid }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{payment.accountName}</Text>
          <Text style={styles.accountNumber}>{payment.accountNumber}</Text>
        </View>
        <StatusBadge status={payment.status} />
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.amount}>{payment.amount}</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.dueDate}>{payment.dueDate}</Text>
        </View>
      </View>

      {payment.status === 'pending' && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => onMarkPaid(payment.id)}
        >
          <Text style={styles.buttonText}>Mark as Paid</Text>
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
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});