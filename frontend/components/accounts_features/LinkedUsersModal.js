import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LinkedUsersModal({ visible, onClose, users, accountNumber, onUserAdded }) {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "" });

  const handleAddLinkedUser = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/services/${accountNumber}/add-user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const result = await res.json();

      if (!result.success) {
        alert("Error adding linked user");
        return;
      }

      onUserAdded(result.linked_users);
      setAddModalVisible(false);
      setNewUser({ name: "", email: "", phone: "" });

    } catch (err) {
      alert("Failed to add user");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>Linked Users</Text>

          <FlatList
            data={users}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userInfo}>{item.email}</Text>
                <Text style={styles.userInfo}>{item.phone}</Text>
              </View>
            )}
          />

          {/* ➕ Add User Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Ionicons name="add-circle" size={28} color="#7C3AED" />
            <Text style={styles.addButtonText}>Add Linked User</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add User Form Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add Linked User</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newUser.name}
              onChangeText={(t) => setNewUser({ ...newUser, name: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUser.email}
              onChangeText={(t) => setNewUser({ ...newUser, email: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={newUser.phone}
              onChangeText={(t) => setNewUser({ ...newUser, phone: t })}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddLinkedUser}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setAddModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modal: { backgroundColor: "white", margin: 20, padding: 20, borderRadius: 14 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  userCard: { padding: 10, marginBottom: 10, backgroundColor: "#F3F4F6", borderRadius: 10 },
  userName: { fontSize: 16, fontWeight: "600" },
  userInfo: { fontSize: 14, color: "#555" },
  addButton: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  addButtonText: { marginLeft: 6, color: "#7C3AED", fontWeight: "600" },
  closeButton: { marginTop: 20, padding: 12, alignItems: "center", backgroundColor: "#EEE", borderRadius: 10 },
  closeText: { fontWeight: "600" },
  backdrop: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  addForm: { backgroundColor: "#fff", margin: 30, padding: 20, borderRadius: 12 },
  formTitle: { fontSize: 18, fontWeight: "600", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#CCC", borderRadius: 10, padding: 10, marginBottom: 10 },
  saveButton: { backgroundColor: "#7C3AED", padding: 12, borderRadius: 10, alignItems: "center" },
  saveText: { color: "white", fontWeight: "600" },
  cancelButton: { marginTop: 10, padding: 12, alignItems: "center" },
  cancelText: { color: "#777" },
});
