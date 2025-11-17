import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/shared/Header';
import SearchBar from '../../components/shared/SearchBar';
import AccountCard from '../../components/accounts_features/AccountCard';
import AddAccountModal from '../../components/accounts_features/AddAccountModal';

//  DUMMY DATA - Replace with API calls later
const DUMMY_ACCOUNTS = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+237 671234567',
    location: 'Douala, Cameroon',
    accountNumber: 'ACC-00123',
    amount: '10,000 XAF',
    dueDate: '2025-12-01',
    status: 'active',
    linkedUsers: 2,
  },
  {
    id: '2',
    name: 'Sunset Apartments',
    email: 'contact@sunset.cm',
    phone: '+237 698765432',
    location: 'Yaoundé, Cameroon',
    accountNumber: 'ACC-00124',
    amount: '25,000 XAF',
    dueDate: '2025-11-20',
    status: 'overdue',
    linkedUsers: 3,
  },
  {
    id: '3',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+237 655123456',
    location: 'Buea, Cameroon',
    accountNumber: 'ACC-00125',
    amount: '15,000 XAF',
    dueDate: '2025-12-15',
    status: 'active',
    linkedUsers: 1,
  },
  {
    id: '4',
    name: 'Marie Kouam',
    email: 'marie.kouam@gmail.com',
    phone: '+237 677889900',
    location: 'Douala, Cameroon',
    accountNumber: 'ACC-00126',
    amount: '20,000 XAF',
    dueDate: '2025-11-25',
    status: 'active',
    linkedUsers: 2,
  },
  {
    id: '5',
    name: 'Tech Solutions Ltd',
    email: 'info@techsolutions.cm',
    phone: '+237 699112233',
    location: 'Yaoundé, Cameroon',
    accountNumber: 'ACC-00127',
    amount: '50,000 XAF',
    dueDate: '2025-11-15',
    status: 'overdue',
    linkedUsers: 4,
  },
];

export default function AccountsTab() {
  const [accounts, setAccounts] = useState(DUMMY_ACCOUNTS);
  const [filteredAccounts, setFilteredAccounts] = useState(DUMMY_ACCOUNTS);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    filterAccounts();
  }, [searchQuery, accounts]);

  const filterAccounts = () => {
    if (searchQuery.trim() === '') {
      setFilteredAccounts(accounts);
    } else {
      const filtered = accounts.filter(
        (account) =>
          account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAccounts(filtered);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    // 🔌 Replace with API call: accountsAPI.getAll()
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleAddAccount = (accountData) => {
    // 🔌 Replace with API call: accountsAPI.create(accountData)
    const newAccount = {
      id: String(accounts.length + 1),
      name: accountData.name || '',
      email: accountData.email || '',
      phone: accountData.phone || '',
      location: accountData.location || '',
      accountNumber: accountData.accountNumber || '',
      amount: accountData.amount || '',
      dueDate: accountData.dueDate || '',
      status: 'active',
      linkedUsers: 1,
    };
    setAccounts([...accounts, newAccount]);
    setModalVisible(false);
    Alert.alert('Success', 'Account created successfully');
  };

  const overdueCount = accounts.filter(a => a.status === 'overdue').length;

  return (
    <View style={styles.container}>
      <Header
        title="DigiSol PayTrack"
        subtitle="Account Management"
        stats={{
          total: accounts.length,
          overdue: overdueCount,
          paid: 0,
        }}
      />
      
      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search accounts..."
        />

        <FlatList
          data={filteredAccounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AccountCard
              account={item}
              onPress={() => Alert.alert('Account Details', `Viewing ${item.name}`)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <AddAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddAccount}
      />
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});