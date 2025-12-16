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
      const response = await fetch('http://127.0.0.1:5000/api/services');
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
          status: primaryUser.status || 'active',
          location: primaryUser.location || '',
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

  const res = await fetch(`http://127.0.0.1:5000/api/services/${accountNumber}`);
  const result = await res.json();

  setSelectedLinkedUsers(result.account.linked_users || []);
  setLinkedUsersModalVisible(true);
};
 

  // ✅ UPDATED — Add new account *and send to backend* (FireStore)
  
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
        status: 'active',
        name: accountData.name || 'New User',
        linked_users: [
          {
            name: accountData.name || 'New User',
            email: accountData.email || '',
            phone: accountData.phone || '',
          },
        ],
      };

      // Send POST request to backend
      const response = await fetch('http://127.0.0.1:5000/api/services', {
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
        id: saved.id,
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
  const handleEditAccount = (account) => {
  setSelectedAccount(account);
  setEditModalVisible(true);
};
 // save updated account
 const handleSaveAccount = async (updated) => {
  try {
    const payload = {
      account_number: updated.accountNumber,
      due_date: updated.dueDate,
      payment_amount: parseInt(updated.amount.replace(/\D/g, ""), 10),
      location: updated.location,
      status: updated.status,
    };

    const res = await fetch(
      `http://127.0.0.1:5000/api/services/${updated.accountNumber}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      Alert.alert("Error", "Failed to update account");
      return;
    }

    Alert.alert("Success", "Account updated");
    setEditModalVisible(false);
    getServices(); // refresh list

  } catch (e) {
    Alert.alert("Error", "Backend unreachable");
  }
};
const handleDeleteAccount = async (accountNumber) => {
  console.log("=== DELETE INITIATED ===");
  console.log("Account Number:", accountNumber);
  console.log("Making request to:", `http://127.0.0.1:5000/api/services/${accountNumber}`);
  
  try {
    const res = await fetch(
      `http://127.0.0.1:5000/api/services/${accountNumber}`,
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
