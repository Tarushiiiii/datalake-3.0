import { useAttendanceStore } from "@/store/attendanceStore";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

type LocationState = {
  permission: string | null;
  accuracy: number | null;
  siteName: string | null;
  error: string | null;
};

function getGpsInfo(state: LocationState): { label: string; style: object } {
  if (state.error)
    return { label: state.error, style: { color: colors.danger } };
  if (state.accuracy === null)
    return { label: "Fetching...", style: { color: colors.warning } };
  if (state.accuracy <= 10)
    return {
      label: `High (${state.accuracy}m)`,
      style: { color: colors.success },
    };
  if (state.accuracy <= 30)
    return {
      label: `Medium (${state.accuracy}m)`,
      style: { color: colors.warning },
    };
  return { label: `Low (${state.accuracy}m)`, style: { color: colors.danger } };
}

function buildSiteName(geocode: Location.LocationGeocodedAddress[]): string {
  const place = geocode[0];
  if (!place) return "Unknown Site";
  const parts = [place.name, place.street, place.district, place.city].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(", ") : "Unknown Site";
}

export default function GetLocation() {
  const setCurrentSiteName = useAttendanceStore((s) => s.setCurrentSiteName);

  const [locationState, setLocationState] = useState<LocationState>({
    permission: null,
    accuracy: null,
    siteName: null,
    error: null,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationState({
          permission: status,
          accuracy: null,
          siteName: null,
          error: "Location permission denied",
        });
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        const siteName = buildSiteName(geocode);

        setLocationState({
          permission: status,
          accuracy: Math.round(location.coords.accuracy ?? 0),
          siteName,
          error: null,
        });

        setCurrentSiteName(siteName);
      } catch {
        setLocationState({
          permission: status,
          accuracy: null,
          siteName: null,
          error: "Unable to get location",
        });
      }
    })();
  }, []);

  const gpsInfo = getGpsInfo(locationState);

  return (
    <View style={globalStyles.siteRow}>
      <Ionicons
        name="navigate-outline"
        size={18}
        color={colors.auxiliary2}
        style={{ marginRight: 8 }}
      />
      <View>
        <Text style={globalStyles.siteName}>
          Site: {locationState.siteName ?? "Loading..."}
        </Text>
        <Text style={globalStyles.gpsAccuracy}>
          GPS Accuracy: <Text style={gpsInfo.style}>{gpsInfo.label}</Text>
        </Text>
      </View>
    </View>
  );
}
