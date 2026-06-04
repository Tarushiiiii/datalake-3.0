// components/syncStatus.tsx
import { useAttendanceStore } from "@/store/attendanceStore";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { syncPendingAttendance } from "@/services/awsSync";
import { useRef } from "react";

const SyncStatus = () => {
  const records = useAttendanceStore((s) => s.records);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const syncingRef = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const pendingRecords = useMemo(
    () => records.filter((r) => !r.isSynced),
    [records],
  );
  useEffect(() => {
  if (
    !isConnected ||
    pendingRecords.length === 0 ||
    syncingRef.current
  ) {
    return;
  }

  syncingRef.current = true;

  const syncData = async () => {
    try {
      setIsSyncing(true);

      console.log(
        `Starting sync of ${pendingRecords.length} records`
      );

      await syncPendingAttendance();

      await useAttendanceStore.getState().init();

      console.log("Sync completed");
    } catch (error) {
      console.log("Sync failed:", error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  };

  syncData();
}, [isConnected, pendingRecords.length]);

  const status = useMemo(() => {
    if (!isConnected) {
      return {
        text: "Offline mode",
        color: colors.warning,
        icon: "wifi-strength-alert-outline",
      };
    }

    if (isSyncing) {
  return {
    text: "Syncing...",
    color: colors.primary,
    icon: "cloud-sync-outline",
  };
}

if (pendingRecords.length > 0) {
  return {
    text: `${pendingRecords.length} pending`,
    color: colors.warning,
    icon: "cloud-upload-outline",
  };
}

    return {
      text: "Synced",
      color: colors.success,
      icon: "check-circle-outline",
    };
  }, [isConnected, pendingRecords.length, isSyncing]);

  return (
    <View style={[globalStyles.statusBadge, { backgroundColor: status.color }]}>
      <MaterialCommunityIcons name={status.icon as any} size={16} color={colors.white} />
      <Text style={globalStyles.statusText}>Sync Status: {status.text}</Text>
    </View>
  );
};

export default SyncStatus;