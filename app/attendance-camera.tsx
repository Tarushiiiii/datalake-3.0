import { useAttendanceStore } from "@/store/attendanceStore";
import { globalStyles } from "@/styles/globalStyles";

import { CameraType, CameraView, useCameraPermissions } from "expo-camera";

import { router } from "expo-router";

import { useEffect, useState } from "react";

import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AttendanceCamera() {
  const [facing] = useState<CameraType>("front");

  const [permission, requestPermission] = useCameraPermissions();

  const [scanning, setScanning] = useState(true);

  const checkIn = useAttendanceStore((s) => s.checkIn);

  const checkOut = useAttendanceStore((s) => s.checkOut);

  const isCheckedInToday = useAttendanceStore((s) => s.isCheckedInToday());

  useEffect(() => {
    if (!permission?.granted) return;

    const timer = setTimeout(() => {
      setScanning(false);

      if (isCheckedInToday) {
        checkOut();

        Alert.alert("Checked Out", "Attendance marked successfully.");
      } else {
        checkIn();

        Alert.alert("Checked In", "Attendance marked successfully.");
      }

      router.replace("/(tabs)");
    }, 5000);

    return () => clearTimeout(timer);
  }, [permission]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <>
        {" "}
        <Text style={globalStyles.text}>Camera permission required</Text>
        <TouchableOpacity
          style={globalStyles.button}
          onPress={requestPermission}
        >
          <Text style={globalStyles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <>
      <CameraView style={styles.camera} facing={facing} />

      <View style={styles.overlay}>
        <View style={styles.faceGuide} />

        <Text style={styles.helpText}>
          {scanning ? "Scanning Face..." : "Face Verified"}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  faceGuide: {
    width: 240,
    height: 320,
    borderWidth: 3,
    borderColor: "white",
    borderRadius: 150,
    marginBottom: 30,
  },

  helpText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
});
