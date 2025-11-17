import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AccountDetails({ account }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Details</Text>
      <Text style={styles.info}>Name: {account.name}</Text>
      <Text style={styles.info}>Email: {account.email}</Text>
      <Text style={styles.info}>Phone: {account.phone}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
  },
});