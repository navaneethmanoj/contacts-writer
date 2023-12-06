import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';;
// import { REACT_APP_API_KEY } from "@env";

export default EditScreen = ({ route, navigation }) => {
  const { image } = route.params;
  const [convertedText, setConvertedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFocused, setFocused] = useState(false)

  const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.REACT_APP_API_KEY}`;

  useEffect(() => {
    if (image) {
      analyzeImage();
    }
  }, [image]);

  const analyzeImage = async () => {
    try {
      if (!image) {
        Alert.alert("Please select an image");
        return;
      }
      const requestData = {
        requests: [
          {
            image: {
              content: image,
            },
            features: [
              {
                type: "DOCUMENT_TEXT_DETECTION",
              },
            ],
          },
        ],
      };
      const response = await axios.post(apiURL, requestData);
      const data = response.data;
      setConvertedText(data.responses[0].fullTextAnnotation?.text);
      setLoading(false);
    } catch (error) {
      Alert.alert("Error analyzing image. Please try again");
    }
  };
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="gray" />
        <Text style={styles.text}>Loading...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.confirmPrompt, styles.text]}>
        Please re-verify the detected text.
      </Text>
      <TextInput
        multiline={true}
        style={[styles.textInput,{borderColor: isFocused ? "#D0F288" : "#5FBDFF"}]}
        value={convertedText}
        onChangeText={setConvertedText}
        numberOfLines={20}
        autoCorrect={false}
        placeholder="No text detected"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <View style={styles.helpTextContainer}>
        <Text style={styles.helpText}>Please ensure that</Text>
        <Text style={styles.helpText}>{`\u25CF Each contact is on a different line.`}</Text>
        <Text style={styles.helpText}>{`\u25CF Name and numbers are separated by a space`}</Text>
        <Text style={styles.helpText}>{`\u25CF Phone numbers do not contain alphabets`}</Text>
      </View>
      <Pressable
        style={styles.confirmPressable}
        onPress={() => navigation.navigate("Result", { text: convertedText })}
      >
        <Text style={styles.text}>Proceed to Save </Text>
        <FontAwesome name="arrow-circle-right" size={18} color="white" />
      </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
  },
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: "5%"
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#f5f5f5",
  },
  confirmPrompt: {
    fontSize: 14,
    marginTop: 30,
  },
  textInput: {
    height: 380,
    minWidth: "96%",
    maxWidth: 380,
    backgroundColor: "#f5f5f5",
    fontSize: 13,
    borderRadius: 4,
    padding: 8,
    textAlignVertical: "top",
    borderWidth: 3,
    marginTop: 10,
  },
  helpTextContainer: {
    marginHorizontal: 8,
    alignItems:"flex-start",
    marginTop: 18
  },
  helpText: {
    fontSize: 14,
    color: "#f5f5f5",
    lineHeight: 18
  },
  confirmPressable: {
    width: 180,
    height: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    backgroundColor: "#363636",
    marginVertical: 40,
    borderColor: "#cccccc",
    borderWidth: 1,
  },
});
