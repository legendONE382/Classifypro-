import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useAttendanceStore } from "../store/useAttendanceStore";
import { useAuthStore } from "../store/useAuthStore";
import { env } from "../lib/env";
import { calculateDistance, formatDistance } from "../lib/geofencing";
import { GeoPoint } from "../types/domain";

// Conditional import for location - only on native
let Location: any = null;
if (Platform.OS !== 'web') {
  try {
    Location = require("expo-location");
  } catch (e) {
    console.log("expo-location not available");
  }
}

interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export const TeacherClockInScreen = () => {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [classrooms] = useState([
    { id: "class-1", name: "JSS1 - Blue Room" },
    { id: "class-2", name: "SS2 - Gold Room" },
  ]);

  const { clockIn, loading, error, todayAttendance, clearError } = useAttendanceStore();
  const { user } = useAuthStore();

  const schoolLocation: GeoPoint = {
    latitude: env.schoolLatitude,
    longitude: env.schoolLongitude,
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (todayAttendance) {
      setClockedIn(true);
    }
  }, [todayAttendance]);

  const requestLocationPermission = async () => {
    try {
      // On web, use mock location
      if (Platform.OS === 'web') {
        setLocation({
          coords: {
            latitude: env.schoolLatitude + 0.0005,
            longitude: env.schoolLongitude + 0.0005,
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
      // Use mock location on error
      setLocation({
        coords: {
          latitude: env.schoolLatitude,
          longitude: env.schoolLongitude,
          accuracy: 100,
        },
      });
    }
  };

  const handleClockIn = async () => {
    if (!location) {
      Alert.alert("Location not available", "Please enable location services");
      return;
    }

    if (!selectedClassroom) {
      Alert.alert("Classroom required", "Please select your classroom");
      return;
    }

    if (!user?.id) {
      Alert.alert("User not found", "Please log in again");
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
      env.geofenceRadiusMeters
    );

    if (!response.success) {
      Alert.alert("Clock-in failed", response.message);
    }
  };

  const handleRefreshLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, just update with mock location
        setLocation({
          coords: {
            latitude: env.schoolLatitude + Math.random() * 0.001,
            longitude: env.schoolLongitude + Math.random() * 0.001,
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

  const distanceToSchool = location
    ? calculateDistance(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        schoolLocation
      )
    : null;

  const withinGeofence =
    distanceToSchool !== null && distanceToSchool <= env.geofenceRadiusMeters;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Teacher Clock-In</Text>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={clearError}>
              <Text style={styles.dismissButton}>Dismiss</Text>
            </Pressable>
          </View>
        )}

        {/* Location Status */}
        <View style={[styles.card, withinGeofence ? styles.cardSuccess : styles.cardWarning]}>
          <Text style={styles.cardTitle}>Location Status</Text>
          {location ? (
            <>
              <Text style={styles.cardText}>
                📍 {formatDistance(distanceToSchool || 0)} from school
              </Text>
              <Text style={styles.cardText}>
                Geofence: {withinGeofence ? "✅ Within range" : "❌ Outside range"}
              </Text>
            </>
          ) : (
            <Text style={styles.cardText}>📍 Getting location...</Text>
          )}

          <Pressable style={styles.smallButton} onPress={handleRefreshLocation}>
            <Text style={styles.smallButtonText}>Refresh Location</Text>
          </Pressable>
        </View>

        {/* Classroom Selection */}
        {!clockedIn && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Select Classroom</Text>
            {classrooms.map((c: any) => (
              <Pressable
                key={c.id}
                style={[styles.classroomOption, selectedClassroom === c.id && styles.classroomSelected]}
                onPress={() => setSelectedClassroom(c.id)}
              >
                <Text
                  style={[
                    styles.classroomText,
                    selectedClassroom === c.id && styles.classroomTextSelected,
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Clock In Status */}
        {clockedIn && todayAttendance && (
          <View style={styles.card}>
            <Text style={styles.successTitle}>✅ Clocked In Successfully</Text>
            <Text style={styles.statusBadge}>{todayAttendance.status.toUpperCase()}</Text>
            <Text style={styles.cardText}>
              Time: {new Date(todayAttendance.clockInTime).toLocaleTimeString()}
            </Text>
          </View>
        )}

        {/* Clock In Button */}
        {!clockedIn && (
          <Pressable
            style={[
              styles.button,
              (loading || !withinGeofence || !selectedClassroom) && styles.buttonDisabled,
            ]}
            onPress={handleClockIn}
            disabled={loading || !withinGeofence || !selectedClassroom}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Clock In</Text>
            )}
          </Pressable>
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
  cardSuccess: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  cardWarning: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  cardText: {
    fontSize: 13,
    color: "#6B7280",
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  classroomOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginVertical: 4,
  },
  classroomSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  classroomText: {
    fontSize: 14,
    color: "#111827",
  },
  classroomTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 8,
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  dismissButton: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
});
