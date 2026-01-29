import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import CONFIG from '../../app/config';

const API_URL = CONFIG.API_BASE_URL;

export default function ReminderSettings() {
  const [emailEnabled, setEmailEnabled] = React.useState(true);
  const [smsEnabled, setSmsEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  // Fetch current settings from backend on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings`);
      const data = await response.json();
      setEmailEnabled(data.email_notifications ?? true);
      setSmsEnabled(data.sms_notifications ?? true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async (emailValue, smsValue) => {
    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_notifications: emailValue,
          sms_notifications: smsValue,
        }),
      });

      if (!response.ok) {
        Alert.alert('Error', 'Failed to save settings');
        return;
      }

      Alert.alert('Success', 'Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleEmailToggle = (value) => {
    setEmailEnabled(value);
    saveSettings(value, smsEnabled);
  };

  const handleSmsToggle = (value) => {
    setSmsEnabled(value);
    saveSettings(emailEnabled, value);
  };

  if (loading) {
    return <Text>Loading settings...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminder Settings</Text>
      
      <View style={styles.setting}>
        <Text style={styles.settingLabel}>Email Notifications</Text>
        <Switch
          value={emailEnabled}
          onValueChange={handleEmailToggle}
          trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
          thumbColor={emailEnabled ? '#7C3AED' : '#f4f3f4'}
        />
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingLabel}>SMS Notifications</Text>
        <Switch
          value={smsEnabled}
          onValueChange={handleSmsToggle}
          trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
          thumbColor={smsEnabled ? '#7C3AED' : '#f4f3f4'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
  },
});