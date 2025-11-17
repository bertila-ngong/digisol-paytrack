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
import ReminderCard from '../../components/reminders_features/ReminderCard';

// 🎯 DUMMY DATA
const DUMMY_REMINDERS = [
  {
    id: '1',
    accountName: 'Jane Doe',
    accountNumber: 'ACC-00123',
    type: 'email',
    dueDate: '2025-12-01',
    sent: true,
    sentDate: '2025-11-28',
  },
  {
    id: '2',
    accountName: 'Sunset Apartments',
    accountNumber: 'ACC-00124',
    type: 'sms',
    dueDate: '2025-11-20',
    sent: true,
    sentDate: '2025-11-17',
  },
  {
    id: '3',
    accountName: 'John Smith',
    accountNumber: 'ACC-00125',
    type: 'email',
    dueDate: '2025-12-15',
    sent: false,
    sentDate: null,
  },
  {
    id: '4',
    accountName: 'Marie Kouam',
    accountNumber: 'ACC-00126',
    type: 'sms',
    dueDate: '2025-11-25',
    sent: false,
    sentDate: null,
  },
  {
    id: '5',
    accountName: 'Tech Solutions Ltd',
    accountNumber: 'ACC-00127',
    type: 'email',
    dueDate: '2025-11-15',
    sent: true,
    sentDate: '2025-11-12',
  },
];

export default function RemindersTab() {
  const [reminders, setReminders] = useState(DUMMY_REMINDERS);
  const [filteredReminders, setFilteredReminders] = useState(DUMMY_REMINDERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    filterReminders();
  }, [searchQuery, reminders]);

  const filterReminders = () => {
    if (searchQuery.trim() === '') {
      setFilteredReminders(reminders);
    } else {
      const filtered = reminders.filter(
        (reminder) =>
          reminder.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reminder.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReminders(filtered);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    // 🔌 Replace with API call: remindersAPI.getAll()
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleSendReminder = (reminderId) => {
    // 🔌 Replace with API call: remindersAPI.send(reminderId)
    const updatedReminders = reminders.map(r =>
      r.id === reminderId
        ? { ...r, sent: true, sentDate: new Date().toISOString().split('T')[0] }
        : r
    );
    setReminders(updatedReminders);
    Alert.alert('Success', 'Reminder sent successfully');
  };

  const sentCount = reminders.filter(r => r.sent).length;
  const pendingCount = reminders.filter(r => !r.sent).length;

  return (
    <View style={styles.container}>
      <Header
        title="Reminders"
        subtitle="Payment notifications"
        stats={{
          total: reminders.length,
          overdue: pendingCount,
          paid: sentCount,
        }}
      />
      
      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search reminders..."
        />

        <FlatList
          data={filteredReminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReminderCard reminder={item} onSend={handleSendReminder} />
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