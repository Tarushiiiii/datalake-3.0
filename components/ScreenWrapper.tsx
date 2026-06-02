import { ReactNode } from "react";

import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

type Props = {
  children: ReactNode;

  scroll?: boolean;
};

export default function ScreenWrapper({ children, scroll = true }: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            padding: 12,
          }}
        >
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
