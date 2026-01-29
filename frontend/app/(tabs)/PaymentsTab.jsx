import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text
} from 'react-native';
import Header from '../../components/shared/Header';
import SearchBar from '../../components/shared/SearchBar';
import PaymentCard from '../../components/payments_features/PaymentCard';
import CONFIG from '../config';

const API_URL = `${CONFIG.API_BASE_URL}/api/services`;

const PaymentsTab = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all | pending | paid | overdue

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, payments, activeFilter]);

  // -------- FETCH FROM BACKEND ----------
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const json = await response.json();

      const transformed = json.accounts.map((item, index) => ({
        id: (index + 1).toString(),
        accountName: item.name,
        accountNumber: item.account_number,
        amount: `${item.payment_amount.toLocaleString()} XAF`,
        dueDate: item.due_date,
        status: item.status,
        paidDate: item.paid_date || null,
      }));

      setPayments(transformed);
      setFilteredPayments(transformed);
    } catch (error) {
      Alert.alert('Error', 'Could not load payments.');
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  // -------- MARK AS PAID ----------
  const handleMarkPaid = async (accountNumber) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch(
        `${API_URL}/mark-paid/${accountNumber}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paid_date: today
          })
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error('Unable to update payment');
      }

      // Update UI
      const updated = payments.map((p) =>
        p.accountNumber === accountNumber
          ? { ...p, status: 'paid', paidDate: today }
          : p
      );

      setPayments(updated);
      Alert.alert('Success', 'Payment marked as paid');
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment');
    }
  };

  // -------- FILTER + SEARCH ----------
  const applyFilters = () => {
    let temp = [...payments];

    // Filter by status
    if (activeFilter !== 'all') {
      temp = temp.filter((p) => p.status === activeFilter);
    }

    // Search by name or number
    if (searchQuery.trim() !== '') {
      temp = temp.filter(
        (p) =>
          p.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPayments(temp);
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const overdueCount = payments.filter((p) => p.status === 'overdue').length;
  const paidCount = payments.filter((p) => p.status === 'paid').length;

  if (initialLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Payments"
        subtitle="Track payment status"
        stats={{
          total: payments.length,
          overdue: overdueCount,
          paid: paidCount,
        }}
      />

      <View style={styles.content}>
        
        {/* 🔍 SEARCH BAR */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or account..."
        />

        {/* 🔘 FILTER BUTTONS */}
        <View style={styles.filterRow}>
          {['all', 'pending', 'overdue', 'paid'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                activeFilter === f && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.activeFilterText,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 📄 PAYMENT LIST */}
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              onMarkPaid={() => handleMarkPaid(item.accountNumber)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default PaymentsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: '600',
  },
});