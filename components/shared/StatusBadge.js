import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function StatusBadge({ status, style }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'active':
        return styles.active;
      case 'overdue':
        return styles.overdue;
      case 'pending':
        return styles.pending;
      case 'paid':
        return styles.paid;
      case 'inactive':
        return styles.inactive;
      default:
        return styles.inactive;
    }
  };

  return (
    <Text style={[styles.badge, getStatusStyle(), style]}>
      {status.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '700',
  },
  active: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  overdue: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  pending: {
    backgroundColor: '#FEF3C7',
    color: '#CA8A04',
  },
  paid: {
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
  },
  inactive: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
});