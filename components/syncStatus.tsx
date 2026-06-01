import { useAttendanceStore } from "@/store/attendanceStore";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";

type SyncState =
  | "awaiting-wifi"
  | "pending"
  | "syncing"
  | "synced"
  | "up-to-date";

const SyncStatus = () => {
  const records = useAttendanceStore((s) => s.records);
  const markAsSynced = useAttendanceStore((s) => s.markAsSynced);

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [syncState, setSyncState] = useState<SyncState>("up-to-date");

  const syncingRef = useRef(false);

  const pendingRecords = useMemo(
    () => records.filter((r) => !r.isSynced),
    [records],
  );

  // always keep ref in sync so the effect reads fresh data
  const pendingRecordsRef = useRef(pendingRecords);
  useEffect(() => {
    pendingRecordsRef.current = pendingRecords;

    // if no pending records, reflect that immediately
    if (pendingRecords.length === 0 && !syncingRef.current) {
      setSyncState("up-to-date");
    } else if (pendingRecords.length > 0 && isConnected === false) {
      setSyncState("awaiting-wifi");
    } else if (pendingRecords.length > 0 && !syncingRef.current) {
      setSyncState("pending");
    }
  }, [pendingRecords, isConnected]);

  // internet listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // trigger sync only when connectivity changes
  useEffect(() => {
    if (isConnected === null) return;

    if (!isConnected) {
      if (pendingRecordsRef.current.length > 0) {
        setSyncState("awaiting-wifi");
      }
      return;
    }

    const syncData = async () => {
      const pending = pendingRecordsRef.current;
      if (pending.length === 0 || syncingRef.current) {
        setSyncState("up-to-date");
        return;
      }

      try {
        syncingRef.current = true;
        setSyncState("syncing");

        for (const record of pending) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // await uploadAttendance(record);
          markAsSynced(record.checkInTime);
        }

        setSyncState("synced");

        // show "synced" briefly then settle to "up to date"
        setTimeout(() => setSyncState("up-to-date"), 2000);
      } catch (error) {
        console.log("Sync failed:", error);
        setSyncState("pending");
      } finally {
        syncingRef.current = false;
      }
    };

    syncData();
  }, [isConnected]);

  const status = useMemo(() => {
    switch (syncState) {
      case "awaiting-wifi":
        return {
          text: "Wifi awaited",
          color: colors.warning,
          icon: "wifi-strength-alert-outline",
        };
      case "pending":
        return {
          text: "Pending sync",
          color: colors.warning,
          icon: "cloud-upload-outline",
        };
      case "syncing":
        return {
          text: "Syncing...",
          color: colors.warning,
          icon: "cloud-sync-outline",
        };
      case "synced":
        return {
          text: "Synced",
          color: colors.success,
          icon: "check-circle-outline",
        };
      case "up-to-date":
      default:
        return {
          text: "Up to date",
          color: colors.success,
          icon: "check-circle-outline",
        };
    }
  }, [syncState]);

  return (
    <View style={[globalStyles.statusBadge, { backgroundColor: status.color }]}>
      <MaterialCommunityIcons
        name={status.icon as any}
        size={16}
        color={colors.white}
      />
      <Text style={globalStyles.syncText}>Sync Status: {status.text}</Text>
    </View>
  );
};

export default SyncStatus;
