import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export default function ReminderSettings() {
  const [emailEnabled, setEmailEnabled] = React.useState(true);
  const [smsEnabled, setSmsEnabled] = React.useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminder Settings</Text>
      
      <View style={styles.setting}>
        <Text style={styles.settingLabel}>Email Notifications</Text>
        <Switch
          value={emailEnabled}
          onValueChange={setEmailEnabled}
          trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
          thumbColor={emailEnabled ? '#7C3AED' : '#f4f3f4'}
        />
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingLabel}>SMS Notifications</Text>
        <Switch
          value={smsEnabled}
          onValueChange={setSmsEnabled}
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