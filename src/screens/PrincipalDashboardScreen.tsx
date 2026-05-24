import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useDashboardStore } from "../store/useDashboardStore";
import { useAuthStore } from "../store/useAuthStore";
import { StatusBadge } from "../components/StatusBadge";

export const PrincipalDashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { classroomStatuses, notifications, loading, fetchClassroomStatuses, fetchNotifications } =
    useDashboardStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.schoolId && user?.id) {
      fetchClassroomStatuses(user.schoolId);
      fetchNotifications(user.id);
    }
  }, [user?.schoolId, user?.id]);

  const onRefresh = async () => {
    if (!user?.schoolId || !user?.id) return;
    setRefreshing(true);
    await Promise.all([
      fetchClassroomStatuses(user.schoolId),
      fetchNotifications(user.id),
    ]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>📊 Principal Dashboard</Text>
          <Text style={styles.subtitle}>Real-time class monitoring</Text>
        </View>

        {/* Attendance Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {classroomStatuses.filter((c) => c.status === "teaching").length}
            </Text>
            <Text style={styles.summaryLabel}>Teaching</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>
              {classroomStatuses.filter((c) => c.status === "late").length}
            </Text>
            <Text style={styles.summaryLabel}>Late</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#EF4444" }]}>
              {classroomStatuses.filter((c) => c.status === "empty").length}
            </Text>
            <Text style={styles.summaryLabel}>Empty</Text>
          </View>
        </View>

        {/* Classroom Status Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classroom Status</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#111827" />
          ) : classroomStatuses.length === 0 ? (
            <Text style={styles.emptyText}>No classrooms to display</Text>
          ) : (
            classroomStatuses.map((classroom) => (
              <View key={classroom.classroomId} style={styles.classroomCard}>
                <View style={styles.classroomHeader}>
                  <View style={styles.classroomInfo}>
                    <Text style={styles.classroomName}>{classroom.classroomName}</Text>
                    <Text style={styles.teacherName}>{classroom.teacherName}</Text>
                  </View>
                  <StatusBadge status={classroom.status} />
                </View>
                {classroom.lastClockIn && (
                  <Text style={styles.timestamp}>
                    Last clock-in:{" "}
                    {new Date(classroom.lastClockIn).toLocaleTimeString()}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📋 View Attendance Report</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📝 Generate Report Cards</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>👥 Manage Staff</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#10B981",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  classroomCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#6B7280",
    gap: 8,
  },
  classroomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  classroomInfo: {
    flex: 1,
    gap: 2,
  },
  classroomName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  teacherName: {
    fontSize: 12,
    color: "#6B7280",
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionButton: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 24,
  },
}));
  time: {
    color: "#6B7280",
    fontSize: 12
  }
});
