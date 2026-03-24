import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";

import { ClockInScreen } from "./src/screens/ClockInScreen";
import { PrincipalDashboardScreen } from "./src/screens/PrincipalDashboardScreen";

type Tab = "dashboard" | "clockin";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>ClassifyPro</Text>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab("dashboard")}
            style={[styles.tab, tab === "dashboard" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "dashboard" && styles.tabTextActive]}>Dashboard</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("clockin")}
            style={[styles.tab, tab === "clockin" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "clockin" && styles.tabTextActive]}>Clock In</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>{tab === "dashboard" ? <PrincipalDashboardScreen /> : <ClockInScreen />}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 10
  },
  brand: {
    fontSize: 22,
    fontWeight: "900"
  },
  tabs: {
    flexDirection: "row",
    gap: 8
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E5E7EB"
  },
  tabActive: {
    backgroundColor: "#111827"
  },
  tabText: {
    fontWeight: "700",
    color: "#111827"
  },
  tabTextActive: {
    color: "white"
  },
  content: {
    flex: 1
  }
});
