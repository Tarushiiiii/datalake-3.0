import { useAttendanceStore } from "@/store/attendanceStore";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";

const SyncStatus = () => {
  const records = useAttendanceStore((s) => s.records);
  const markAsSynced = useAttendanceStore((s) => s.markAsSynced);

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // prevents multiple sync loops running together
  const syncingRef = useRef(false);

  const pendingRecords = useMemo(
    () => records.filter((r) => !r.isSynced),
    [records],
  );

  // internet listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // auto sync when internet returns
  useEffect(() => {
    const syncData = async () => {
      if (!isConnected || pendingRecords.length === 0 || syncingRef.current) {
        return;
      }

      try {
        syncingRef.current = true;
        setIsSyncing(true);

        for (const record of pendingRecords) {
          // simulate API upload delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // future AWS sync:
          // await uploadAttendance(record);

          markAsSynced(record.checkInTime);
        }

        // future:
        // purge synced records here
      } catch (error) {
        console.log("Sync failed:", error);
      } finally {
        syncingRef.current = false;
        setIsSyncing(false);
      }
    };

    syncData();
  }, [isConnected, pendingRecords, markAsSynced]);

  const status = useMemo(() => {
    // no internet
    if (!isConnected) {
      return {
        text: "Internet awaited",
        color: colors.warning,
        icon: "wifi-strength-alert-outline",
      };
    }

    // syncing in progress
    if (isSyncing) {
      return {
        text: "Syncing...",
        color: colors.warning,
        icon: "cloud-sync-outline",
      };
    }

    // internet available but still pending
    if (pendingRecords.length > 0) {
      return {
        text: "Pending sync",
        color: colors.warning,
        icon: "cloud-upload-outline",
      };
    }

    // all synced
    return {
      text: "Up to date",
      color: colors.success,
      icon: "check-circle-outline",
    };
  }, [isConnected, isSyncing, pendingRecords]);

  return (
    <View style={[globalStyles.statusBadge, { backgroundColor: status.color }]}>
      <MaterialCommunityIcons
        name={status.icon as any}
        size={16}
        color={colors.white}
      />

      <Text style={globalStyles.statusText}>Sync Status: {status.text}</Text>
    </View>
  );
};

export default SyncStatus;
