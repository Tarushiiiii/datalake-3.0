import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { fonts } from "./fonts";

export const globalStyles = StyleSheet.create({
  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
  },

  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.35)",
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

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
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
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 32,
    padding: 28,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  cardTitle: {
    fontSize: fonts.cardTitle,
    fontWeight: "800",
    marginBottom: 24,
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

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10, // optional spacing
    marginVertical: 20,
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
    backgroundColor: "#1A3C2E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  syncText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },

  // Profile
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: "#ddd",
  },
  profileInfo: {
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  profileRole: {
    fontSize: 13,
    color: "#555",
  },
  profileId: {
    fontSize: 12,
    color: "#888",
  },
  qrButton: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  // Main card
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  cardDate: {
    fontSize: 13,
    color: "#777",
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
  statusIconDanger: {
    backgroundColor: "#FDECEA",
  },
  statusIconSuccess: {
    backgroundColor: "#E8F5EE",
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: "700",
  },
  statusLabelDanger: {
    color: "#C0392B",
  },
  statusLabelSuccess: {
    color: "#1A6B3C",
  },
  statusDescription: {
    fontSize: 13,
    color: "#666",
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
    borderTopColor: "#F0F0F0",
  },
  siteName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  gpsAccuracy: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  gpsHigh: {
    color: "#1A8A4A",
    fontWeight: "600",
  },

  // CTA
  ctaButton: {
    backgroundColor: "#1A2A4A",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statCardRight: {},
  statLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  statSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});
