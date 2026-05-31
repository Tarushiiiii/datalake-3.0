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
});
