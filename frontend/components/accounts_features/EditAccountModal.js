import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

const EditAccountModal = ({ visible, onClose, account, onSave }) => {
  const [form, setForm] = useState({
    accountNumber: "",
    name: "",
    email: "",
    phone: "",
    dueDate: "",
    amount: "",
    location: "",
  });

  useEffect(() => {
    if (account) {
      setForm({
        accountNumber: account.accountNumber,
        name: account.name || "",
        email: account.email || "",
        phone: account.phone || "",
        dueDate: account.dueDate,
        amount: account.amount.replace(" XAF", "").replace(/,/g, ""),
        location: account.location || "",
      });
    }
  }, [account]);

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Edit Account</Text>

          <Text style={styles.label}>Account Number</Text>
          <TextInput
            style={styles.input}
            value={form.accountNumber}
            onChangeText={(t) => setForm({ ...form, accountNumber: t })}
          />

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
          />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
          />
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={form.dueDate}
            onChangeText={(t) => setForm({ ...form, dueDate: t })}
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.amount}
            onChangeText={(t) => setForm({ ...form, amount: t })}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={form.location}
            onChangeText={(t) => setForm({ ...form, location: t })}
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.save} onPress={handleSave}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditAccountModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: "#555",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  cancel: {
    backgroundColor: "#aaa",
    padding: 12,
    borderRadius: 8,
    width: "45%",
  },
  save: {
    backgroundColor: "#7C3AED",
    padding: 12,
    borderRadius: 8,
    width: "45%",
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
});