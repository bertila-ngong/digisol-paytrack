import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import Header from '../../components/shared/Header';
import SearchBar from '../../components/shared/SearchBar';
import PaymentCard from '../../components/payments_features/PaymentCard';

// 🎯 DUMMY DATA
const DUMMY_PAYMENTS = [
  {
    id: '1',
    accountName: 'Jane Doe',
    accountNumber: 'ACC-00123',
    amount: '10,000 XAF',
    dueDate: '2025-12-01',
    status: 'pending',
  },
  {
    id: '2',
    accountName: 'Sunset Apartments',
    accountNumber: 'ACC-00124',
    amount: '25,000 XAF',
    dueDate: '2025-11-20',
    status: 'overdue',
  },
  {
    id: '3',
    accountName: 'John Smith',
    accountNumber: 'ACC-00125',
    amount: '15,000 XAF',
    dueDate: '2025-12-15',
    status: 'paid',
    paidDate: '2025-12-10',
  },
  {
    id: '4',
    accountName: 'Marie Kouam',
    accountNumber: 'ACC-00126',
    amount: '20,000 XAF',
    dueDate: '2025-11-25',
    status: 'pending',
  },
  {
    id: '5',
    accountName: 'Tech Solutions Ltd',
    accountNumber: 'ACC-00127',
    amount: '50,000 XAF',
    dueDate: '2025-11-15',
    status: 'overdue',
  },
];

export default function PaymentsTab() {
  const [payments, setPayments] = useState(DUMMY_PAYMENTS);
  const [filteredPayments, setFilteredPayments] = useState(DUMMY_PAYMENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    filterPayments();
  }, [searchQuery, payments]);

  const filterPayments = () => {
    if (searchQuery.trim() === '') {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter(
        (payment) =>
          payment.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPayments(filtered);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    // 🔌 Replace with API call: paymentsAPI.getAll()
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleMarkPaid = (paymentId) => {
    // 🔌 Replace with API call: paymentsAPI.update(paymentId, { status: 'paid' })
    const updatedPayments = payments.map(p =>
      p.id === paymentId ? { ...p, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : p
    );
    setPayments(updatedPayments);
    Alert.alert('Success', 'Payment marked as paid');
  };

  const overdueCount = payments.filter(p => p.status === 'overdue').length;
  const paidCount = payments.filter(p => p.status === 'paid').length;

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
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search payments..."
        />

        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PaymentCard payment={item} onMarkPaid={handleMarkPaid} />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});