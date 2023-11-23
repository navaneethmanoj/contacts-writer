import { View, Text, StyleSheet, SafeAreaView, Image } from "react-native";

export default ConfirmScreen = ({ route, navigation }) => {
  const { finalImage64 } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      {finalImage64 && (
        <Image
          source={{ uri: "data:image/jpeg;base64," + finalImage64 }}
          style={{ width: 200, height: 200 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222831",
  },
});
