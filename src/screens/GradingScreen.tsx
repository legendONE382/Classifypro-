import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useGradingStore } from "../store/useGradingStore";
import { useAuthStore } from "../store/useAuthStore";

export const GradingScreen = () => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [subject, setSubject] = useState("");
  const [scoreValue, setScoreValue] = useState("");
  const [maxScoreValue, setMaxScoreValue] = useState("100");
  const [session, setSession] = useState("2025/2026");
  const [term, setTerm] = useState("First");

  const { grades, loading, submitGrade, fetchStudentGrades } = useGradingStore();
  const { user } = useAuthStore();

  const [students] = useState([
    { id: "student-1", name: "Chioma Okoro" },
    { id: "student-2", name: "Tunde Adeyemi" },
    { id: "student-3", name: "Amara Usman" },
  ]);

  const handleSubmit = async () => {
    if (!selectedStudent || !subject || !scoreValue) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const success = await submitGrade(
      selectedStudent,
      "class-1", // selected classroom
      user.id,
      user.schoolId,
      subject,
      parseFloat(scoreValue),
      parseFloat(maxScoreValue),
      session,
      term
    );

    if (success) {
      Alert.alert("Success", "Grade submitted successfully");
      setSubject("");
      setScoreValue("");
      setMaxScoreValue("100");
    }
  };

  const handleFetchGrades = async () => {
    if (selectedStudent) {
      await fetchStudentGrades(selectedStudent, session, term);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>📚 Grade Management</Text>

        {/* Student Selection */}
        <View style={styles.card}>
          <Text style={styles.label}>Select Student</Text>
          {students.map((s) => (
            <Pressable
              key={s.id}
              style={[styles.option, selectedStudent === s.id && styles.optionSelected]}
              onPress={() => setSelectedStudent(s.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedStudent === s.id && styles.optionTextSelected,
                ]}
              >
                {s.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Grade Input Form */}
        <View style={styles.card}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Mathematics, English"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Score</Text>
          <View style={styles.scoreRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Score"
              value={scoreValue}
              onChangeText={setScoreValue}
              keyboardType="decimal-pad"
            />
            <Text style={styles.scoreSeparator}>/</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Max"
              value={maxScoreValue}
              onChangeText={setMaxScoreValue}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.label}>Session/Term</Text>
          <View style={styles.rowButtons}>
            <TextInput
              style={[styles.input, { flex: 1.5 }]}
              placeholder="Session"
              value={session}
              onChangeText={setSession}
            />
            <View style={{ width: 8 }} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Term"
              value={term}
              onChangeText={setTerm}
            />
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Submit Grade</Text>
            )}
          </Pressable>
        </View>

        {/* Grades History */}
        {selectedStudent && (
          <View style={styles.card}>
            <View style={styles.historyHeader}>
              <Text style={styles.label}>Grades History</Text>
              <Pressable onPress={handleFetchGrades}>
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>

            {grades.length === 0 ? (
              <Text style={styles.emptyText}>No grades recorded yet</Text>
            ) : (
              grades.map((grade) => (
                <View key={grade.id} style={styles.gradeItem}>
                  <View style={styles.gradeInfo}>
                    <Text style={styles.subject}>{grade.subject}</Text>
                    <Text style={styles.gradeDetail}>
                      {grade.score}/{grade.maxScore} ({grade.gradeLetter})
                    </Text>
                  </View>
                  <Text style={styles.percentage}>
                    {Math.round((grade.score / grade.maxScore) * 100)}%
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
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
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginVertical: 4,
  },
  optionSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  optionText: {
    fontSize: 13,
    color: "#111827",
  },
  optionTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "white",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreSeparator: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refreshText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },
  gradeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  gradeInfo: {
    flex: 1,
    gap: 2,
  },
  subject: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  gradeDetail: {
    fontSize: 12,
    color: "#6B7280",
  },
  percentage: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 16,
  },
});
