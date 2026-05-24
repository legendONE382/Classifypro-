import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";

import { useAuthStore } from "./src/store/useAuthStore";
import { LoginScreen } from "./src/screens/LoginScreen";
import { TeacherClockInScreen } from "./src/screens/TeacherClockInScreen";
import { PrincipalDashboardScreen } from "./src/screens/PrincipalDashboardScreen";
import { GradingScreen } from "./src/screens/GradingScreen";
import { StudentAttendanceScreen } from "./src/screens/StudentAttendanceScreen";

type Tab = "dashboard" | "clockin" | "grading" | "attendance";

export default function App() {
  const { isAuthenticated, user, checkAuthStatus, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>ClassifyPro</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  const getTabs = () => {
    if (user.role === "principal") {
      return [
        { key: "dashboard", label: "📊 Dashboard" },
        { key: "grading", label: "📝 Grading" },
      ];
    } else if (user.role === "teacher") {
      return [
        { key: "clockin", label: "⏰ Clock In" },
        { key: "grading", label: "📝 Grades" },
      ];
    } else if (user.role === "parent") {
      return [
        { key: "attendance", label: "📅 Attendance" },
      ];
    }
    return [];
  };

  const renderContent = () => {
    switch (tab) {
      case "dashboard":
        return <PrincipalDashboardScreen />;
      case "clockin":
        return <TeacherClockInScreen />;
      case "grading":
        return <GradingScreen />;
      case "attendance":
        return <StudentAttendanceScreen />;
      default:
        return <PrincipalDashboardScreen />;
    }
  };

  const tabs = getTabs();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.brand}>ClassifyPro</Text>
          <Pressable onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
        <Text style={styles.userInfo}>
          {user.fullName} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Text>
        <View style={styles.tabs}>
          {tabs.map((t: any) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, tab === t.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991b1b",
  },
  userInfo: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
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
    color: "#111827",
    fontSize: 13,
  },
  tabTextActive: {
    color: "white"
  },
  content: {
    flex: 1
  }
});
