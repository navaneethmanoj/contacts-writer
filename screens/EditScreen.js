import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Pressable,
  Alert
} from "react-native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';;
import { REACT_APP_API_KEY } from "@env";

export default EditScreen = ({ route, navigation }) => {
  const { image } = route.params;
  // const [editText, setEditText] = useState(text)
  const [convertedText, setConvertedText] = useState("");
  const [loading, setLoading] = useState(true);

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
      // const base64Image = await FileSystem.readAsStringAsync(image, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });
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
      console.log(data.responses[0].fullTextAnnotation?.text);
      setConvertedText(data.responses[0].fullTextAnnotation?.text);
      // setTimeout(() => {setLoading(false)},1000)
      setLoading(false);
      // navigation.navigate("Edit",{text: convertedText})
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Error analyzing image. Please try again");
    }
  };
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="gray" />
        <Text style={styles.text}>Loading...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.confirmPrompt, styles.text]}>
        Please re-verify the detected text.
      </Text>
      <TextInput
        multiline={true}
        style={styles.textInput}
        value={convertedText}
        onChangeText={setConvertedText}
        numberOfLines={20}
        autoCorrect={false}
        placeholder="No text detected"
      />
      <View style={styles.helpTextContainer}>
        <Text style={styles.helpText}>Please ensure that</Text>
        <Text style={styles.helpText}>{`\u25CF Each contact is on a different line.`}</Text>
        <Text style={styles.helpText}>{`\u25CF Name and numbers are separated by a colon `}</Text>
      </View>
      <Pressable
        style={styles.confirmPressable}
        onPress={() => navigation.navigate("Result", { text: convertedText })}
      >
        <Text style={styles.text}>Proceed to Save </Text>
        <FontAwesome name="arrow-circle-right" size={18} color="white" />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
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
    height: 400,
    width: "90%",
    backgroundColor: "#f5f5f5",
    fontSize: 13,
    borderRadius: 4,
    padding: 8,
    textAlignVertical: "top",
    borderWidth: 3,
    borderColor: "lightblue",
    marginTop: 10,
  },
  helpTextContainer: {
    marginHorizontal: 10,
    alignItems:"flex-start",
    marginTop: 18
  },
  helpText: {
    fontSize: 12,
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
    marginVertical: 30,
    // borderColor: "#cccccc",
    // borderWidth: 1,
  },
});
