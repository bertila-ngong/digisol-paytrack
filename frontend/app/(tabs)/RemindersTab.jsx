import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/shared/Header';
import SearchBar from '../../components/shared/SearchBar';

// CHANGE THIS BASED ON YOUR DEVICE
const API_URL = 'http://127.0.0.1:5000/api/services';        // iOS Simulator
// const API_URL = 'http://10.0.2.2:5000/api/services';     // Android Emulator

export default function RemindersTab() {
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | pending
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const json = await res.json();
      const raw = json.accounts || [];

      const transformed = raw.map(acc => ({
        id: acc.account_number || acc.id,
        name: acc.name || 'Unknown',
        accountNumber: acc.account_number || 'N/A',
        dueDate: acc.due_date || 'No date',
        amount: acc.payment_amount ? `${Number(acc.payment_amount).toLocaleString()} XAF` : 'N/A',
        status: (acc.status || 'pending').toLowerCase(),
        email: acc.linked_users?.[0]?.email || acc.email || '',
        phone: acc.linked_users?.[0]?.phone || acc.phone || '',
        reminderSent: !!acc.reminder_sent,
        sentDate: acc.reminder_sent_date || null,
      }));

      setAccounts(transformed);
      applyFilter(transformed, activeTab, searchQuery);
    } catch (err) {
      Alert.alert('Error', 'Cannot load accounts');
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilter(accounts, activeTab, searchQuery);
  }, [activeTab, searchQuery, accounts]);

  const applyFilter = (list, tab, query) => {
    let result = [...list];

    if (tab === 'pending') {
      result = result.filter(a => a.status !== 'paid');
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.accountNumber.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  };

  const openSendOptions = (account) => {
    setSelectedAccount(account);
    setModalVisible(true);
  };

  const sendEmail = () => {
    if (!selectedAccount?.email) {
      Alert.alert('No Email', 'This customer has no email address');
      return;
    }
    const url = `mailto:${selectedAccount.email}?subject=Payment Reminder&body=Hello ${selectedAccount.name},\n\nThis is a friendly reminder that your payment of ${selectedAccount.amount} is due on ${selectedAccount.dueDate}.\n\nThank you!`;
    Linking.openURL(url);
    setModalVisible(false);
  };

  const sendSMS = () => {
    if (!selectedAccount?.phone) {
      Alert.alert('No Phone', 'This customer has no phone number');
      return;
    }
    const url = Platform.OS === 'ios'
      ? `sms:${selectedAccount.phone}`
      : `sms:${selectedAccount.phone}?body=Hello ${selectedAccount.name}, your payment of ${selectedAccount.amount} is due on ${selectedAccount.dueDate}. Thank you!`;
    Linking.openURL(url);
    setModalVisible(false);
  };

  const totalCount = accounts.length;

  if (-initialLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={{ marginTop: 15, color: '#666' }}>Loading accounts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - Only Total */}
      <Header
        title="Reminders"
        subtitle="Payment notifications"
        stats={{ total: totalCount }}
      />

      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or account..."
        />

        {/* Tabs */}
        <View style={styles.tabRow}>
          {['all', 'pending'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'all' ? 'All Accounts' : 'Pending Only'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.account}>Acc: {item.accountNumber}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  item.status === 'paid' ? styles.paidBadge :
                  item.status === 'overdue' ? styles.overdueBadge : styles.pendingBadge
                ]}>
                  <Text style={styles.statusText}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.label}>Amount Due</Text>
                <Text style={styles.amount}>{item.amount}</Text>
                <Text style={styles.label}>Due Date</Text>
                <Text style={styles.dueDate}>{item.dueDate}</Text>
              </View>

              {/* Show Send Button only in Pending tab */}
              {activeTab === 'pending' && item.status !== 'paid' && (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => openSendOptions(item)}
                >
                  <Text style={styles.sendButtonText}>Send Reminder Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No accounts found</Text>}
        />
      </View>

      {/* BEAUTIFUL SEND OPTIONS POPUP */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Reminder</Text>
            <Text style={styles.modalSubtitle}>Choose how to contact {selectedAccount?.name}</Text>

            <TouchableOpacity style={styles.optionButton} onPress={sendEmail}>
              <Ionicons name="mail" size={28} color="#7C3AED" />
              <Text style={styles.optionText}>Send via Email</Text>
              <Text style={styles.optionSubtext}>{selectedAccount?.email || 'No email'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={sendSMS}>
              <Ionicons name="chatbubble" size={28} color="#25D366" />
              <Text style={styles.optionText}>Send via SMS</Text>
              <Text style={styles.optionSubtext}>{selectedAccount?.phone || 'No phone'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  tabRow: { flexDirection: 'row', marginVertical: 16, backgroundColor: '#E5E7EB', borderRadius: 30, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 26, alignItems: 'center' },
  activeTab: { backgroundColor: '#7C3AED' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  activeTabText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
  account: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  paidBadge: { backgroundColor: '#DCFCE7' },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  overdueBadge: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#166534' },
  cardBody: { gap: 8 },
  label: { fontSize: 13, color: '#9CA3AF' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  dueDate: { fontSize: 15, color: '#4B5563' },
  sendButton: { backgroundColor: '#7C3AED', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 50, color: '#9CA3AF', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '88%', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  modalSubtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },
  optionButton: { width: '100%', backgroundColor: '#F3F4F6', borderRadius: 16, padding: 18, marginVertical: 8, alignItems: 'center' },
  optionText: { fontSize: 17, fontWeight: '600', marginTop: 8, color: '#1F2937' },
  optionSubtext: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  cancelButton: { marginTop: 20 },
  cancelText: { fontSize: 16, color: '#7C3AED', fontWeight: '600' },
});