import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuthStore } from "../store/useAuthStore";

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"principal" | "teacher">("teacher");
  const [schoolId, setSchoolId] = useState("");

  const { loading, error, login, register, clearError } = useAuthStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    if (isSignUp) {
      if (!fullName || !schoolId) {
        Alert.alert("Validation", "Please fill all fields");
        return;
      }
      await register(email, password, fullName, role, schoolId);
    } else {
      await login(email, password);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>ClassifyPro</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={clearError}>
              <Text style={styles.dismissButton}>Dismiss</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.form}>
          {isSignUp && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>School ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your school ID"
                  value={schoolId}
                  onChangeText={setSchoolId}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleSelector}>
                  {(["teacher", "principal"] as const).map((r) => (
                    <Pressable
                      key={r}
                      style={[styles.roleOption, role === r && styles.roleOptionActive]}
                      onPress={() => setRole(r)}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          role === r && styles.roleTextActive,
                        ]}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
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
              <Text style={styles.buttonText}>
                {isSignUp ? "Create Account" : "Login"}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.toggleButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              clearError();
            }}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? "Already have an account? Login"
                : "Don't have an account? Sign Up"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using ClassifyPro, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    marginVertical: 12,
    gap: 8,
  },
  errorText: {
    color: "#991b1b",
    fontSize: 14,
  },
  dismissButton: {
    color: "#7F1D1D",
    fontWeight: "600",
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: "white",
    color: "#111827",
  },
  roleSelector: {
    flexDirection: "row",
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "white",
  },
  roleOptionActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  roleTextActive: {
    color: "white",
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  toggleButton: {
    alignItems: "center",
    marginTop: 12,
  },
  toggleText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
