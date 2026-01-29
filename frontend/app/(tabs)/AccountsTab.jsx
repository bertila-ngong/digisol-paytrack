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
import LinkedUsersModal from '../../components/accounts_features/LinkedUsersModal';
import EditAccountModal from "../../components/accounts_features/EditAccountModal";
import CONFIG from '../config';

const AccountsTab = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkedUsersModalVisible, setLinkedUsersModalVisible] = useState(false);
  const [selectedLinkedUsers, setSelectedLinkedUsers] = useState([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    getServices();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [searchQuery, accounts]);

  const getServices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/services`);
      const data = await response.json();

      let rawList = [];
      if (data.accounts) {
        rawList = data.accounts;
      } else if (Array.isArray(data)) {
        rawList = data;
      }

      const formattedData = rawList.map((item) => {
        const primaryUser =
          item.linked_users && item.linked_users.length > 0
            ? item.linked_users[0]
            : {};

        return {
          id: item.account_number,   
          accountNumber: item.account_number || 'N/A',
          dueDate: item.due_date || 'N/A',
          name: item.name || 'Unknown User',
          email: primaryUser.email || '',
          phone: primaryUser.phone || '',
          amount: item.payment_amount
            ? `${item.payment_amount.toLocaleString()} XAF`
            : '0 XAF',
          status: item.status || 'pending',
          location: item.location || primaryUser.location || '',
          linkedUsersCount: item.linked_users
            ? item.linked_users.length
            : 0,
        };
      });

      setAccounts(formattedData);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load data');
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
          (account.name &&
            account.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (account.accountNumber &&
            account.accountNumber
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
      setFilteredAccounts(filtered);
    }
  };
  
  const handleShowLinkedUsers = async (accountNumber) => {
    setSelectedAccountNumber(accountNumber);

    const res = await fetch(`${CONFIG.API_BASE_URL}/api/services/${accountNumber}`);
    const result = await res.json();

    setSelectedLinkedUsers(result.account.linked_users || []);
    setLinkedUsersModalVisible(true);
  };

  const handleAddAccount = async (accountData) => {
    try {
      // Convert amount to number for backend
      const amountNumber = parseInt(
        String(accountData.amount).replace(/\D/g, ''),
        10
      ) || 0;

      // Payload for backend
      const payload = {
        account_number: accountData.accountNumber || `ACCT-${Date.now()}`,
        due_date: accountData.dueDate || '',
        payment_amount: amountNumber,
        location: accountData.location || '',
        name: accountData.name || 'New User',
        linked_users: [
          {
            name: accountData.name || 'New User',
            email: accountData.email || '',
            phone: accountData.phone || '',
            location: accountData.location || '',
          },
        ],
      };

      // Send POST request to backend
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        Alert.alert('Error', 'Failed to save to backend');
        return;
      }

      // Add back-end returned account to UI
      const saved = result.account;
      const primaryUser = saved.linked_users[0] || {};

      const newAccount = {
        id: saved.account_number,
        accountNumber: saved.account_number,
        dueDate: saved.due_date,
        amount: `${saved.payment_amount.toLocaleString()} XAF`,
        name: primaryUser.name,
        email: primaryUser.email,
        phone: primaryUser.phone,
        status: saved.status,
        location: saved.location || '',
        linkedUsersCount: saved.linked_users.length,
      };

      setAccounts((prev) => [newAccount, ...prev]);
      setModalVisible(false);
      Alert.alert('Success', 'Account created successfully');
    } catch (err) {
      Alert.alert('Error', 'Unable to connect to backend');
    }
  };

  const overdueCount = accounts.filter((a) => a.status === 'overdue').length;
  const paidCount = accounts.filter((a) => a.status === 'paid').length;
  
  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setEditModalVisible(true);
  };
  
  // save updated account
  const handleSaveAccount = async (updated) => {
    try {
      const paymentAmount = parseInt(updated.amount.replace(/\D/g, ""), 10) || 0;
      
      // Update linked_users with the primary user info
      const linkedUsers = [
        {
          name: updated.name || 'Unknown User',
          email: updated.email || '',
          phone: updated.phone || '',
          location: updated.location || '',
        },
      ];

      const payload = {
        account_number: updated.accountNumber,
        due_date: updated.dueDate,
        payment_amount: paymentAmount,
        location: updated.location,
        name: updated.name,
        email: updated.email, 
        phone: updated.phone,
        linked_users: linkedUsers,
      };

      console.log('Sending payload:', payload);

      // Use the ORIGINAL account number from selectedAccount for the URL
      // This ensures we find the correct document even if the account number is being changed
      const originalAccountNumber = selectedAccount?.accountNumber || updated.accountNumber;
      
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/services/${originalAccountNumber}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        Alert.alert("Error", errorData.message || "Failed to update account");
        return;
      }

      const responseData = await res.json();
      console.log('Success response:', responseData);

      Alert.alert("Success", "Account updated successfully");
      setEditModalVisible(false);
      
      // Refresh the list from the backend
      await getServices();
    } catch (e) {
      console.error("Save error:", e);
      Alert.alert("Error", "Backend unreachable: " + e.message);
    }
  };

  const handleDeleteAccount = async (accountNumber) => {
    console.log("=== DELETE INITIATED ===");
    console.log("Account Number:", accountNumber);
    console.log("Making request to:", `${CONFIG.API_BASE_URL}/api/services/${accountNumber}`);
    
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/services/${accountNumber}`,
        { 
          method: "DELETE"
        }
      );

      console.log("Response received:");
      console.log("- Status:", res.status);
      console.log("- OK:", res.ok);

      const data = await res.json();
      console.log("- Data:", data);

      if (!res.ok) {
        console.log("Delete failed:", data.message);
        Alert.alert("Error", data.message || "Failed to delete account");
        return;
      }

      console.log("Delete successful, updating UI");
      
      // Remove locally without full refresh
      setAccounts((prev) =>
        prev.filter((acc) => acc.accountNumber !== accountNumber)
      );

      Alert.alert("Success", "Account deleted successfully");
    } catch (error) {
      console.error("DELETE ERROR:", error);
      Alert.alert("Error", `Unable to connect to backend: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="DigiSol PayTrack"
        subtitle="Account Management"
        stats={{
          total: accounts.length,
          overdue: overdueCount,
          paid: paidCount,
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
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AccountCard
             account={item}
             onPress={() => {}}
             onShowLinkedUsers={handleShowLinkedUsers}
             onEdit={handleEditAccount}
             onDelete={() => handleDeleteAccount(item.accountNumber)}
            />
          )}
          ListEmptyComponent={
            !loading && (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
                No accounts found
              </Text>
            )
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
      <LinkedUsersModal
        visible={linkedUsersModalVisible}
        onClose={() => setLinkedUsersModalVisible(false)}
        users={selectedLinkedUsers}
        accountNumber={selectedAccountNumber}
        onUserAdded={(updatedList) => setSelectedLinkedUsers(updatedList)}
        onRefresh={getServices}
      />
      <EditAccountModal
        visible={editModalVisible}
        account={selectedAccount}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveAccount}
      />
    </View>
  );
};

export default AccountsTab;

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
    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
    elevation: 8,
  },
});