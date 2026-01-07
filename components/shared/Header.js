import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ title, subtitle, stats }) {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="cash-outline" size={28} color="#7C3AED" />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWarning]}>
            <Text style={styles.statLabel}>Overdue</Text>
            <Text style={[styles.statValue, styles.statValueWarning]}>{stats.overdue}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardSuccess]}>
            <Text style={styles.statLabel}>Paid</Text>
            <Text style={[styles.statValue, styles.statValueSuccess]}>{stats.paid}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#7C3AED',
    padding: 20,
    paddingTop: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#E9D5FF',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
  },
  statCardWarning: {
    backgroundColor: 'rgba(254, 226, 226, 0.2)',
  },
  statCardSuccess: {
    backgroundColor: 'rgba(220, 252, 231, 0.2)',
  },
  statLabel: {
    fontSize: 11,
    color: '#E9D5FF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  statValueWarning: {
    color: '#FCA5A5',
  },
  statValueSuccess: {
    color: '#86EFAC',
  },
});