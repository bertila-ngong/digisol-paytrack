import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/shared/Header';

// My API endpoint configuration
const API_URL = 'http://127.0.0.1:5000/api/settings';        // iOS Simulator

const HEALTH_URL = 'http://127.0.0.1:5000/api/health';      // Health check endpoint
const ELIGIBLE_REMINDERS_URL = 'http://127.0.0.1:5000/api/services/eligible-reminders';


export default function SettingsTab() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(5);
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // <-- NEW
  const [eligibleAccounts, setEligibleAccounts] = useState([]);
  const [sendingId, setSendingId] = useState(null);

  // Loading settings from backend 
  useEffect(() => {
    loadSettings();
    checkConnection();
    fetchEligibleAndShowModal();
  }, []);

  const fetchEligibleAndShowModal = async () => {
    // Optionally show a loading indicator here (omitted for brevity)
    try {
      const response = await fetch(ELIGIBLE_REMINDERS_URL);
      if (response.ok) {
        const data = await response.json();
        setEligibleAccounts(data.eligible_accounts);
        setModalVisible(true); // Show modal after fetching data
      } else {
        throw new Error('Failed to fetch eligible accounts.');
      }
    } catch (error) {
      console.error('Error fetching eligible accounts:', error);
      Alert.alert('Error', 'Could not fetch reminder list. Check backend API.');
    }
  };
  
  const handleSendReminder = async (account) => {
    if (!account.account_number) {
      Alert.alert("Error", "This account has no account number.");
      return;
    }

    setSendingId(account.id);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/services/send-reminder/${account.account_number}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert("Success", `Reminder sent to ${account.recipient || account.email || 'user'}!`);

        // Optional: Remove from list or mark as sent
        setEligibleAccounts(prev =>
          prev.map(acc =>
            acc.id === account.id
              ? { ...acc, alreadySent: true }  // visual feedback
              : acc
          )
        );
      } else {
        Alert.alert("Failed", result.message || "Could not send reminder.");
      }
    } catch (error) {
      console.error("Send reminder error:", error);
      Alert.alert("Error", "Failed to reach backend. Is Flask running?");
    } finally {
      setSendingId(null);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch(HEALTH_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        setApiConnected(true);
      } else {
        setApiConnected(false);
      }
    } catch (error) {
      setApiConnected(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.email_notifications ?? true);
        setSmsNotifications(data.sms_notifications ?? true);
        setPushNotifications(data.push_notifications ?? true);
        setReminderDaysBefore(data.reminder_days_before ?? 3);
        setApiConnected(true);
      } else {
        // Using default if backend not available
        setApiConnected(false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setApiConnected(false);
      // Use defaults silently
    } finally {
      setLoading(false);
    }
  };

  // SettingsTab.js - New Function

  const fetchRecentReminders = async () => {
    try {
      const response = await fetch(REMINDERS_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentReminders(data.reminders_sent_today); // Set the array of accounts
      }
    } catch (error) {
      console.error('Error fetching recent reminders:', error);
      // Fail silently if the job hasn't run or endpoint is down
    }
  };

  const saveSettings = async (updatedFields) => {
    try {
      setSaving(true);
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (response.ok) {
        setApiConnected(true);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Check if backend is running.');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailNotificationChange = async (value) => {
    setEmailNotifications(value);
    await saveSettings({ email_notifications: value });
  };

  const handleSmsNotificationChange = async (value) => {
    setSmsNotifications(value);
    await saveSettings({ sms_notifications: value });
  };

  const handlePushNotificationChange = async (value) => {
    setPushNotifications(value);
    await saveSettings({ push_notifications: value });
  };

  // const handleReminderDaysChange = (value) => {
  //   Alert.alert(
  //     'Reminder Days Before',
  //     'How many days before the due date should reminders be sent?',
  //     [
  //       { 
  //         text: '1 Day', 
  //         onPress: async () => {
  //           setReminderDaysBefore(value);
  //           await saveSettings({ reminder_days_before: value });
  //         }
  //       },
  //       // { 
  //       //   text: '3 Days', 
  //       //   onPress: async () => {
  //       //     setReminderDaysBefore(value);
  //       //     await saveSettings({ reminder_days_before: value});
  //       //   }
  //       // },
  //       // { 
  //       //   text: '7 Days', 
  //       //   onPress: async () => {
  //       //     setReminderDaysBefore(value);
  //       //     await saveSettings({ reminder_days_before: value });
  //       //   }
  //       // },
  //       { text: 'Cancel', style: 'cancel' }
  //     ]
  //   );
  // };

  const showReminderSchedule = () => {
    Alert.alert(
      'Automatic Reminder Schedule',
      'Your reminders are now managed automatically by the backend system.\n\nReminders are sent precisely:\n\n• 5 days before the due date\n• 1 day before the due date\n\nThis schedule cannot be customized by the user.',
      [{ text: 'OK' }]
    );
  };

  const testConnection = async () => {
    try {
      const response = await fetch(HEALTH_URL);
      if (response.ok) {
        setApiConnected(true);
        Alert.alert(' Connected', 'Backend is running and connected!');
      } else {
        setApiConnected(false);
        Alert.alert(' Disconnected', 'Backend returned an error.');
      }
    } catch (error) {
      setApiConnected(false);
      Alert.alert(' Disconnected', 'Cannot reach backend. Make sure Flask is running.');
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all accounts, payments, and reminders.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Coming Soon', 'Export feature will be available in next update.');
          }
        }
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure? This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Clear data feature will be available in next update.');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={{ marginTop: 15, color: '#666' }}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Settings" subtitle="App configuration" />

      {saving && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color="#7C3AED" />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={24} color="#7C3AED" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive payment alerts via email</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={handleEmailNotificationChange}
              trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
              thumbColor={emailNotifications ? '#7C3AED' : '#f4f3f4'}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubble-outline" size={24} color="#7C3AED" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>Receive payment alerts via SMS</Text>
              </View>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={handleSmsNotificationChange}
              trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
              thumbColor={smsNotifications ? '#7C3AED' : '#f4f3f4'}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color="#7C3AED" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive in-app notifications</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={handlePushNotificationChange}
              trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
              thumbColor={pushNotifications ? '#7C3AED' : '#f4f3f4'}
              disabled={saving}
            />
          </View>
        </View>

        {/* Reminder Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={fetchEligibleAndShowModal} // <-- UPDATED HANDLER
            disabled={saving}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={24} color="#7C3AED" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Manual Reminder Check</Text>
                <Text style={styles.settingDescription}>
                  Tap to see accounts ready for a reminder
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Accounts Eligible for Reminder</Text>

                <ScrollView style={styles.modalScroll}>
                  {eligibleAccounts.length === 0 ? (
                    <Text style={styles.noAccountsText}>
                      No accounts currently require a manual reminder.
                    </Text>
                  ) : (
                    eligibleAccounts.map((account, index) => (
                      <View key={index} style={styles.accountRow}>
                        <View>
                          <Text style={styles.accountNameText}>{account.account_name}</Text>
                          <Text style={styles.accountDetailText}>
                            Due: {account.due_date} (Send: {account.days_to_send} day{account.days_to_send > 1 ? 's' : ''} prior)
                          </Text>
                        </View>
                        {/* This button will trigger the send API call */}
                        {account.alreadySent ? (
                          <View style={[styles.sendButton, { backgroundColor: '#9CA3AF' }]}>
                            <Text style={styles.sendButtonText}>Sent</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.sendButton}
                            onPress={() => handleSendReminder(account)}
                            disabled={sendingId === account.id}
                          >
                            <Text style={styles.sendButtonText}>
                              {sendingId === account.id ? 'Sending...' : 'SEND'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={testConnection}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-outline" size={24} color="#7C3AED" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Backend Connection</Text>
                <Text style={styles.settingDescription}>
                  Tap to test connection
                </Text>
              </View>
            </View>
            <View style={[
              styles.statusBadge,
              apiConnected ? styles.connectedBadge : styles.disconnectedBadge
            ]}>
              <Text style={[
                styles.statusText,
                apiConnected ? styles.connectedText : styles.disconnectedText
              ]}>
                {apiConnected ? 'Active' : 'Offline'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert(
              'API Endpoint',
              `Current:\n${API_URL}\n\nChange in SettingsTab.js (line 12)`
            )}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="server-outline" size={24} color="#7C3AED" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>API Endpoint</Text>
                <Text style={styles.settingDescription} numberOfLines={1}>
                  {API_URL}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color="#7C3AED" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingDescription}>1.0.0</Text>
              </View>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="business-outline" size={24} color="#7C3AED" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Company</Text>
                <Text style={styles.settingDescription}>DigiSol</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}
            disabled={saving}
          >
            <Ionicons name="download-outline" size={24} color="#7C3AED" />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearData}
            disabled={saving}
          >
            <Ionicons name="trash-outline" size={24} color="#DC2626" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  savingText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedBadge: {
    backgroundColor: '#DCFCE7',
  },
  disconnectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectedText: {
    color: '#15803D',
  },
  disconnectedText: {
    color: '#DC2626',
  },
  actionButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerText: {
    color: '#DC2626',
  },
  // SettingsTab.js - Inside StyleSheet.create({})

  // ... existing styles ...

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1F2937',
  },
  modalScroll: {
    maxHeight: 300,
  },
  noAccountsText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#6B7280',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  accountNameText: {
    fontWeight: '600',
    fontSize: 15,
  },
  accountDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
  },
  closeButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // ... rest of the styles ...
});