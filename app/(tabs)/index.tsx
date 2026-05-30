import { Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.text}>Home Screen</Text>
      <Link href="/about" asChild>
        <TouchableOpacity style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>About</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
