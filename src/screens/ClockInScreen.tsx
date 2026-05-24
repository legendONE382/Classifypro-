import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { useAttendanceStore } from "../store/useAttendanceStore";
import { useAuthStore as useAuthStoreActions } from "../store/useAuthStore";
import { calculateDistance, formatDistance } from "../lib/geofencing";
import { GeoPoint } from "../types/domain";

// Conditional import for location
let Location: any = null;
if (Platform.OS !== "web") {
  try {
    Location = require("expo-location");
  } catch (e) {
    console.log("expo-location not available");
  }
}

export const ClockInScreen = () => {
  const user = useAuthStore((state) => state.user);
  const { clockIn, loading, error, todayAttendance, clearError } = useAttendanceStore();

  const [location, setLocation] = useState<any>(null);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [qrToken, setQrToken] = useState("");

  const schoolLocation: GeoPoint = {
    latitude: 6.9271,
    longitude: 3.3955,
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "web") {
        setLocation({
          coords: {
            latitude: schoolLocation.latitude + 0.0005,
            longitude: schoolLocation.longitude + 0.0005,
            accuracy: 50,
          },
        });
        return;
      }

      if (!Location) {
        Alert.alert("Location", "Location service not available on this platform");
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (err) {
      console.error("Location error:", err);
      setLocation({
        coords: {
          latitude: schoolLocation.latitude,
          longitude: schoolLocation.longitude,
          accuracy: 100,
        },
      });
    }
  };

  const handleRefreshLocation = async () => {
    try {
      if (Platform.OS === "web") {
        setLocation({
          coords: {
            latitude: schoolLocation.latitude + Math.random() * 0.001,
            longitude: schoolLocation.longitude + Math.random() * 0.001,
            accuracy: 50,
          },
        });
        return;
      }

      if (!Location) return;
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (err) {
      Alert.alert("Error", "Could not fetch location");
    }
  };

  const handleMockClockIn = async () => {
    if (!user) {
      Alert.alert("No session", "No active user session.");
      return;
    }

    if (!qrToken.trim()) {
      Alert.alert("QR Token required", "Enter the classroom QR token to continue.");
      return;
    }

    if (!selectedClassroom) {
      Alert.alert("Classroom required", "Please select a classroom.");
      return;
    }

    if (!location) {
      Alert.alert("Location not available", "Please enable location services");
      return;
    }

    const userLocation: GeoPoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    const response = await clockIn(
      user.id,
      selectedClassroom,
      userLocation,
      schoolLocation,
      100,
      null
    );

    if (response.success) {
      setMessage(`Clock-in verified for ${user.fullName}. Classroom token ${qrToken.trim()} accepted.`);
      setQrToken("");
    } else {
      Alert.alert("Clock-in failed", response.message);
    }
  };

  const [message, setMessage] = useState(
    "Ready to validate teacher presence with geo-fence + QR."
  );

  const classrooms = [
    { id: "class-1", name: "JSS1 - Blue Room" },
    { id: "class-2", name: "SS2 - Gold Room" },
  ];

  const distanceToSchool = location
    ? calculateDistance(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        schoolLocation
      )
    : null;

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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Classroom</Text>
          {classrooms.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.option, selectedClassroom === c.id && styles.optionSelected]}
              onPress={() => setSelectedClassroom(c.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedClassroom === c.id && styles.optionTextSelected,
                ]}
              >
                {c.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {location && distanceToSchool !== null && (
          <View style={styles.locationInfo}>
            <Text style={styles.smallText}>
              📍 {formatDistance(distanceToSchool)} from school
            </Text>
            <Text style={styles.smallText}>
              Geofence: {distanceToSchool <= 100 ? "✅ Within range" : "❌ Outside range"}
            </Text>
            <Pressable style={styles.smallButton} onPress={handleRefreshLocation}>
              <Text style={styles.smallButtonText}>Refresh Location</Text>
            </Pressable>
          </View>
        )}

        {!loading ? (
          <Pressable style={styles.button} onPress={handleMockClockIn}>
            <Text style={styles.buttonText}>Mock Clock In</Text>
          </Pressable>
        ) : (
          <ActivityIndicator style={styles.loadingIndicator} color="white" />
        )}

        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  description: {
    color: "#4B5563",
  },
  box: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 10,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontWeight: "600",
    fontSize: 13,
    color: "#374151",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginVertical: 2,
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
  locationInfo: {
    gap: 4,
    padding: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  smallText: {
    fontSize: 12,
    color: "#6B7280",
  },
  smallButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  smallButtonText: {
    fontSize: 11,
    color: "#3B82F6",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
  loadingIndicator: {
    alignSelf: "center",
  },
  message: {
    color: "#1F2937",
  },
});