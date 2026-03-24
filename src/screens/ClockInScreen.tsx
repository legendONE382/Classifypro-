import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuthStore } from "../store/useAuthStore";
import { useAttendanceStore } from "../store/useAttendanceStore";

export const ClockInScreen = () => {
  const user = useAuthStore((state) => state.user);
  const addLog = useAttendanceStore((state) => state.addLog);
  const markClassroomStatus = useAttendanceStore((state) => state.markClassroomStatus);

  const [qrToken, setQrToken] = useState("");
  const [message, setMessage] = useState("Ready to validate teacher presence with geo-fence + QR.");

  const handleMockClockIn = () => {
    if (!user) {
      setMessage("No active user session.");
      return;
    }

    if (!qrToken.trim()) {
      setMessage("Enter the classroom QR token to continue.");
      return;
    }

    markClassroomStatus("class-2", "teaching");

    addLog({
      id: `log-${Date.now()}`,
      teacherName: user.fullName,
      classroomName: "SS2 - Gold Room",
      status: "on_time",
      clockInTime: new Date().toISOString()
    });

    setMessage(`Clock-in verified for ${user.fullName}. Classroom token ${qrToken.trim()} accepted.`);
    setQrToken("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Clock In</Text>
      <Text style={styles.description}>Prototype flow for geofence validation + classroom QR scan.</Text>

      <View style={styles.box}>
        <Text style={styles.label}>Classroom QR Token</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. room-ss2-gold"
          value={qrToken}
          onChangeText={setQrToken}
          autoCapitalize="none"
        />

        <Pressable style={styles.button} onPress={handleMockClockIn}>
          <Text style={styles.buttonText}>Mock Clock In</Text>
        </Pressable>

        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
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
  description: {
    color: "#4B5563"
  },
  box: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 10
  },
  label: {
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "700"
  },
  message: {
    color: "#1F2937"
  }
});
