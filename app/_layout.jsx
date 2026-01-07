import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "accounts") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "payments") {
            iconName = focused ? "card" : "card-outline";
          } else if (route.name === "reminders") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="accounts" />
      <Tabs.Screen name="payments" />
      <Tabs.Screen name="reminders" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
