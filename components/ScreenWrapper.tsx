import { ReactNode } from "react";

import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";

type Props = {
  children: ReactNode;
};

export default function ScreenWrapper({ children }: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
