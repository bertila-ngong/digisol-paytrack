import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CONFIG from "../../app/config";

const LinkedUsersModal = ({ visible, onClose, users, accountNumber, onUserAdded, onRefresh }) => {
  const [addMode, setAddMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingUserIndex, setEditingUserIndex] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", location: "" });

  const handleAddUser = async () => {
    if (!newUser.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/services/${accountNumber}/add-user`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        }
      );

      const data = await res.json();

      if (!data.success) {
        Alert.alert("Error", "Failed to add user");
        return;
      }

      onUserAdded(data.linked_users);
      setNewUser({ name: "", email: "", phone: "", location: "" });
      setAddMode(false);
      Alert.alert("Success", "User added successfully");
      if (onRefresh) onRefresh();
    } catch (error) {
      Alert.alert("Error", "Unable to connect to backend");
    }
  };

  const handleEditUser = (index) => {
    setEditingUserIndex(index);
    setNewUser({ ...users[index] });
    setEditMode(true);
  };

  const handleUpdateUser = async () => {
    if (!newUser.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      const updatedUsers = [...users];
      updatedUsers[editingUserIndex] = newUser;

      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/services/${accountNumber}/update-users`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linked_users: updatedUsers }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        Alert.alert("Error", data.message || "Failed to update user");
        return;
      }

      onUserAdded(updatedUsers);
      setNewUser({ name: "", email: "", phone: "", location: "" });
      setEditMode(false);
      setEditingUserIndex(null);
      Alert.alert("Success", "User updated successfully");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Unable to connect to backend");
    }
  };

  const handleDeleteUser = async (index) => {
    try {
      const updatedUsers = users.filter((_, i) => i !== index);

      console.log("Deleting user at index:", index);
      console.log("Updated users list:", updatedUsers);
      console.log("Account number:", accountNumber);

      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/services/${accountNumber}/update-users`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linked_users: updatedUsers }),
        }
      );

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (!data.success) {
        Alert.alert("Error", data.message || "Failed to delete user");
        return;
      }

      onUserAdded(updatedUsers);
      Alert.alert("Success", "User deleted successfully");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", `Unable to connect to backend: ${error.message}`);
    }
  };

  const cancelForm = () => {
    setNewUser({ name: "", email: "", phone: "", location: "" });
    setAddMode(false);
    setEditMode(false);
    setEditingUserIndex(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Linked Users ({users.length})</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {!addMode && !editMode && (
            <>
              <FlatList
                data={users}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.name}</Text>
                      {item.email ? (
                        <View style={styles.detailRow}>
                          <Ionicons name="mail-outline" size={14} color="#6B7280" />
                          <Text style={styles.userDetail}>{item.email}</Text>
                        </View>
                      ) : null}
                      {item.phone ? (
                        <View style={styles.detailRow}>
                          <Ionicons name="call-outline" size={14} color="#6B7280" />
                          <Text style={styles.userDetail}>{item.phone}</Text>
                        </View>
                      ) : null}
                      {item.location ? (
                        <View style={styles.detailRow}>
                          <Ionicons name="location-outline" size={14} color="#6B7280" />
                          <Text style={styles.userDetail}>{item.location}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.userActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          console.log("Edit button pressed for index:", index);
                          handleEditUser(index);
                        }}
                      >
                        <Ionicons name="create-outline" size={18} color="#7C3AED" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          console.log("Delete button pressed for index:", index);
                          handleDeleteUser(index);
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No linked users found</Text>
                }
              />

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setAddMode(true)}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add New User</Text>
              </TouchableOpacity>
            </>
          )}

          {(addMode || editMode) && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>
                {editMode ? "Edit User" : "Add New User"}
              </Text>

              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={newUser.name}
                onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                placeholder="Enter name"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                placeholder="Enter email"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={newUser.phone}
                onChangeText={(text) => setNewUser({ ...newUser, phone: text })}
                placeholder="Enter phone"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={newUser.location}
                onChangeText={(text) => setNewUser({ ...newUser, location: text })}
                placeholder="Enter location"
              />

              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelForm}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={editMode ? handleUpdateUser : handleAddUser}
                >
                  <Text style={styles.saveButtonText}>
                    {editMode ? "Update" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default LinkedUsersModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  userCard: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  userDetail: {
    fontSize: 13,
    color: "#4B5563",
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#EDE9FE",
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  form: {
    marginTop: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1F2937",
  },
  label: {
    fontSize: 13,
    color: "#555",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#7C3AED",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});