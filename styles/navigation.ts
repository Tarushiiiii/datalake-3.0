import { colors } from "./colors";

export const stackScreenOptions = {
  headerShown: true,

  headerStyle: {
    backgroundColor: colors.primary,
  },

  headerTintColor: colors.white,

  headerTitleStyle: {
    fontWeight: "bold" as const,
  },

  headerRightContainerStyle: {
    paddingRight: 15,
  },
};

export const tabScreenOptions = {
  tabBarActiveTintColor: colors.primary,

  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 6,
  },

  // Tab screens also need header options
  ...stackScreenOptions,
};
