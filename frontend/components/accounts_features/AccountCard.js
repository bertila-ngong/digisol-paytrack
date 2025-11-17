import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../shared/StatusBadge';

export default function AccountCard({ account, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{account.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.name}>{account.name}</Text>
            <Text style={styles.accountNumber}>{account.accountNumber}</Text>
          </View>
        </View>
        <StatusBadge status={account.status} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{account.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{account.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{account.location}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Payment Amount</Text>
          <Text style={styles.amount}>{account.amount}</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.footerLabel}>Due Date</Text>
          <Text style={styles.dueDate}>{account.dueDate}</Text>
        </View>
      </View>

      <View style={styles.linkedUsers}>
        <Ionicons name="people-outline" size={16} color="#6B7280" />
        <Text style={styles.linkedUsersText}>
          {account.linkedUsers} linked user{account.linkedUsers > 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 12,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
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
  linkedUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkedUsersText: {
    fontSize: 13,
    color: '#6B7280',
  },
});