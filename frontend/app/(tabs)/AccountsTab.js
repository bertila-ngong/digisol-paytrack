import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/shared/Header';
import SearchBar from '../../components/shared/SearchBar';
import AccountCard from '../../components/accounts_features/AccountCard';
import AddAccountModal from '../../components/accounts_features/AddAccountModal';

export default function AccountsTab() {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Run once on mount
  useEffect(() => {
    getServices();
  }, []);

  // Re-filter when search or data changes
  useEffect(() => {
    filterAccounts();
  }, [searchQuery, accounts]);

  const getServices = async () => {
    setLoading(true);
    try {
      // Ensure this endpoint is correct. If using Android Emulator, use 'http://10.0.2.2:5000...'
      const response = await fetch('http://127.0.0.1:5000/api/accounts');
      const data = await response.json();

      console.log("Raw API Data:", data);

      let rawList = [];
      if (data.accounts) {
        rawList = data.accounts;
      } else if (Array.isArray(data)) {
        rawList = data;
      }

      // 🛠️ CRITICAL FIX: MAP THE DATABASE STRUCTURE TO UI STRUCTURE
      // Your DB has data inside 'linked_users', but UI wants it flat.
      const formattedData = rawList.map((item) => {
        // Grab the first user from the array, or create an empty object if missing
        const primaryUser = (item.linked_users && item.linked_users.length > 0) 
          ? item.linked_users[0] 
          : {};

        return {
          id: item.id || Math.random().toString(),
          // Get specific fields from the ROOT of the document
          accountNumber: item.account_number || 'N/A',
          dueDate: item.due_date || 'N/A',
          
          // Get specific fields from the NESTED 'linked_users' array
          name: primaryUser.name || 'Unknown User',
          email: primaryUser.email || '',
          phone: primaryUser.phone || '',
          amount: primaryUser.payment_amount ? `${primaryUser.payment_amount} XAF` : '0 XAF',
          status: primaryUser.status || 'active',
          location: primaryUser.location || '',
          
          linkedUsersCount: item.linked_users ? item.linked_users.length : 0,
        };
      });

      setAccounts(formattedData);
      // filteredAccounts will be updated by the useEffect hook automatically

    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    if (searchQuery.trim() === '') {
      setFilteredAccounts(accounts);
    } else {
      const filtered = accounts.filter(
        (account) =>
          (account.name && account.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (account.accountNumber && account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredAccounts(filtered);
    }
  };

  // const handleRefresh = () => {
  //   getServices();
  // };

  const handleAddAccount = (accountData) => {
    // Ideally, POST to API here. For now, we update local state.
    const newAccount = {
      id: String(Date.now()),
      name: accountData.name || 'New User',
      email: accountData.email || '',
      phone: accountData.phone || '',
      location: accountData.location || '',
      accountNumber: accountData.accountNumber || 'N/A', // Fixed key name
      amount: accountData.amount || '0 XAF',
      dueDate: accountData.dueDate || '',
      status: 'active',
      linkedUsersCount: 1,
    };
    setAccounts([newAccount, ...accounts]);
    setModalVisible(false);
    Alert.alert('Success', 'Account created successfully');
  };

  // Calculate stats dynamically
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
          // 🛠️ CRITICAL FIX: Pass the ARRAY, not the function
          data={filteredAccounts} 
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AccountCard
              account={item}
              onPress={() => Alert.alert('Account Details', `Viewing ${item.name}`)}
            />
          )}
          // refreshControl={
          //   <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          // }
          ListEmptyComponent={
            !loading && <Text style={{textAlign:'center', marginTop: 20, color: '#888'}}>No accounts found</Text>
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          windowSize={5}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
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
    // Updated for Web compatibility
    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)', 
    elevation: 8,
  },
});