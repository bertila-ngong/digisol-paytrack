import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/shared/Header';

// My API endpoint configuration
const API_URL = 'http://127.0.0.1:5000/api/settings';        // iOS Simulator
const HEALTH_URL = 'http://127.0.0.1:5000/api/health';      // Health check endpoint
const EXPORT_URL = 'http://127.0.0.1:5000/api/services/export-pdf';

export default function SettingsTab() {
  // Commented out notification states - uncomment if needed later
  // const [emailNotifications, setEmailNotifications] = useState(true);
  // const [smsNotifications, setSmsNotifications] = useState(true);
  // const [pushNotifications, setPushNotifications] = useState(true);
  // const [reminderDaysBefore, setReminderDaysBefore] = useState(5);
  
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Commented out modal states - uncomment if needed later
  // const [modalVisible, setModalVisible] = useState(false);
  // const [eligibleAccounts, setEligibleAccounts] = useState([]);
  // const [sendingId, setSendingId] = useState(null);

  // Loading settings from backend 
  useEffect(() => {
    // loadSettings();
    checkConnection();
    // Commented out - no auto-popup on page load
    // fetchEligibleAndShowModal();
  }, []);

  // Commented out functions - uncomment if needed later
  /*
  const fetchEligibleAndShowModal = async () => {
    try {
      const response = await fetch(ELIGIBLE_REMINDERS_URL);
      if (response.ok) {
        const data = await response.json();
        setEligibleAccounts(data.eligible_accounts);
        setModalVisible(true);
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

        setEligibleAccounts(prev =>
          prev.map(acc =>
            acc.id === account.id
              ? { ...acc, alreadySent: true }
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
  */

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
    } finally {
      setLoading(false);
    }
  };

  // Commented out settings load - uncomment if needed later
  /*
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
        setApiConnected(false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setApiConnected(false);
    } finally {
      setLoading(false);
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
  */

  const handleExportData = async () => {
    Alert.alert(
      'Export Data',
      'This will export all accounts data to a PDF file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              setExporting(true);
              
              const response = await fetch(EXPORT_URL, {
                method: 'GET',
              });

              if (!response.ok) {
                throw new Error('Export failed');
              }

              const result = await response.json();
              
              if (result.success) {
                Alert.alert(
                  'Success',
                  `PDF exported successfully!\n\nFile: ${result.filename}\nPath: ${result.filepath}\n\nThe file has been saved on your server.`,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', result.message || 'Failed to export PDF');
              }
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert('Error', 'Failed to export data. Make sure backend is running.');
            } finally {
              setExporting(false);
            }
          }
        }
      ]
    );
  };

  // COMMENTED OUT - Clear Data function
  /*
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
  */

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

      {(saving || exporting) && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color="#7C3AED" />
          <Text style={styles.savingText}>
            {exporting ? 'Exporting...' : 'Saving...'}
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* COMMENTED OUT - Notification Settings */}
        {/*
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
        */}

        {/* COMMENTED OUT - Reminder Settings */}
        {/*
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={fetchEligibleAndShowModal}
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
        </View>
        */}

        {/* COMMENTED OUT - API Configuration */}
        {/*
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
        */}

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
            disabled={exporting}
          >
            <Ionicons name="download-outline" size={24} color="#7C3AED" />
            <Text style={styles.actionButtonText}>
              {exporting ? 'Exporting...' : 'Export Data'}
            </Text>
          </TouchableOpacity>

          {/* COMMENTED OUT - Clear All Data Button */}
          {/*
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearData}
            disabled={saving}
          >
            <Ionicons name="trash-outline" size={24} color="#DC2626" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
          </TouchableOpacity>
          */}
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
});