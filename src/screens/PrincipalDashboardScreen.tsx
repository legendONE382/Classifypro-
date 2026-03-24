import { ScrollView, StyleSheet, Text, View } from "react-native";

import { StatusBadge } from "../components/StatusBadge";
import { useAttendanceStore } from "../store/useAttendanceStore";

export const PrincipalDashboardScreen = () => {
  const classrooms = useAttendanceStore((state) => state.classrooms);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Live Principal Dashboard</Text>
      <Text style={styles.subtitle}>Real-time classroom activity across your school.</Text>

      {classrooms.map((classroom) => (
        <View key={classroom.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.classroom}>{classroom.classroomName}</Text>
            <StatusBadge status={classroom.status} />
          </View>
          <Text style={styles.detail}>Teacher: {classroom.teacherName}</Text>
          <Text style={styles.detail}>Session: {classroom.periodLabel}</Text>
          <Text style={styles.time}>Updated: {new Date(classroom.updatedAt).toLocaleTimeString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "800"
  },
  subtitle: {
    color: "#4B5563",
    marginBottom: 8
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  classroom: {
    fontSize: 16,
    fontWeight: "700"
  },
  detail: {
    color: "#111827"
  },
  time: {
    color: "#6B7280",
    fontSize: 12
  }
});
