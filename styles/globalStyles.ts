import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { fonts } from "./fonts";

// Reusable shadow style — apply via spread: { ...shadowStyle }
const shadowStyle = {
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 8,
};

// Lighter shadow for cards/stat blocks
const shadowStyleSm = {
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 1,
};

export const globalStyles = StyleSheet.create({
  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
  },

  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    margin: 12,
  },

  overlay: {
    flex: 1,
    backgroundColor: colors.auxiliary,
  },

  text: {
    color: colors.black,
  },

  footer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  footerText: {
    fontSize: fonts.footerText,
    color: colors.black,
    fontWeight: "500",
  },

  // Base button — override backgroundColor per variant
  button: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 50,
    alignItems: "center",
    ...shadowStyle,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    marginVertical: 20,
  },

  buttonDanger: {
    backgroundColor: colors.danger,
  },

  buttonText: {
    color: colors.white,
    fontSize: fonts.buttonText,
    fontWeight: "700",
  },

  imageContainer: {
    flex: 1,
  },

  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },

  backgroundImage: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  menuIcon: {
    fontSize: fonts.menuIcon,
    color: colors.black,
  },

  heroContainer: {
    paddingHorizontal: 30,
    marginTop: 80,
  },

  heroSubtitle: {
    fontSize: fonts.heroSubtitle,
    fontWeight: "300",
    color: colors.black,
    lineHeight: 58,
  },

  heroTitle: {
    fontSize: fonts.heroTitle,
    fontWeight: "800",
    color: colors.black,
    lineHeight: 68,
  },

  card: {
    marginVertical: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    width: "100%",
    padding: 14,
    ...shadowStyleSm,
  },

  cardTitle: {
    fontSize: fonts.cardTitle,
    fontWeight: "800",
  },

  label: {
    marginBottom: 10,
    color: colors.black,
    fontSize: fonts.label,
  },

  input: {
    borderWidth: 1.5,
    borderColor: colors.shadow,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    fontSize: fonts.input,
    marginBottom: 28,
    backgroundColor: colors.white,
  },

  helpLink: {
    color: colors.shadow,
  },

  helpText: {
    textAlign: "center",
    marginTop: 36,
    fontSize: fonts.helpText,
  },

  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: colors.shadow,
    borderRadius: 10,
    textAlign: "center",
    fontSize: fonts.helpText,
  },

  syncBanner: {
    backgroundColor: colors.sync,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
    borderRadius: 8,
    marginBottom: 16,
  },

  syncText: {
    color: colors.white,
    fontSize: fonts.sm,
    fontWeight: "500",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },

  // Profile
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadowStyleSm,
  },

  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.shadow,
  },

  profileInfo: {
    gap: 2,
  },

  profileName: {
    fontSize: fonts.normal,
    fontWeight: "700",
    color: colors.auxiliary2,
  },

  profileRole: {
    fontSize: fonts.sm,
    color: colors.auxiliary,
  },

  profileId: {
    fontSize: fonts.xs,
    color: colors.auxiliary,
  },

  qrButton: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.shadow,
  },

  // Main card

  cardDate: {
    fontSize: fonts.sm,
    color: colors.auxiliary,
  },

  // Status
  statusBlock: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },

  statusIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  statusLabel: {
    fontSize: fonts.mainLabel,
    fontWeight: "700",
  },

  statusDescription: {
    fontSize: fonts.sm,
    color: colors.auxiliary,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 8,
  },

  // Site GPS row
  siteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.shadow,
  },

  siteName: {
    fontSize: fonts.sm,
    fontWeight: "600",
    color: colors.auxiliary2,
  },

  gpsAccuracy: {
    fontSize: fonts.xs,
    color: colors.auxiliary,
    marginTop: 2,
  },

  gpsHigh: {
    color: colors.success,
    fontWeight: "600",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    ...shadowStyleSm,
  },

  statLabel: {
    fontSize: fonts.xs,
    color: colors.auxiliary,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  statValue: {
    fontSize: fonts.mainLabel2,
    fontWeight: "800",
    color: colors.auxiliary2,
  },

  statSub: {
    fontSize: fonts.xs,
    color: colors.auxiliary,
    marginTop: 2,
  },
});
