import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  Pressable,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { EvilIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
//import * as FileSystem from "expo-file-system";
import { useState, useEffect } from "react";

import { REACT_APP_API_KEY } from "@env";

// import DetectText from "../src/index";

export default function App({ navigation }) {
  const [imageBase64, setImageBase64] = useState(null);
  // const [image, setImage] = useState(null);
  const [convertedText, setConvertedText] = useState("");

  const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${REACT_APP_API_KEY}`;

  useEffect(() => {
    if (imageBase64) {
      navigation.navigate("Edit", { image: imageBase64 });
    }
  }, [imageBase64]);
  const pickFromGallery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });
      if (!result.canceled) {
        // console.log(result.assets[0].uri);
        setImageBase64(result.assets[0].base64);
      }
      // navigation.navigate("Edit",{imageBase64: imageBase64})
    } catch (error) {
      console.error("Error in selecting image from gallery:", error);
    }
  };
  const pickFromCamera = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        base64: true,
      });
      if (!result.canceled) {
        //console.log(result.assets[0].uri);
        setImageBase64(result.assets[0].base64);
      }
    } catch (error) {
      console.error("Error selecting image from camera", error);
    }
  };
  // const analyzeImage = async () => {
  //   try {
  //     if (!imageBase64) {
  //       alert("Please select an image");
  //       return;
  //     }
  //     // const base64Image = await FileSystem.readAsStringAsync(image, {
  //     //   encoding: FileSystem.EncodingType.Base64,
  //     // });
  //     const requestData = {
  //       requests: [
  //         {
  //           image: {
  //             content: imageBase64,
  //           },
  //           features: [
  //             {
  //               type: "DOCUMENT_TEXT_DETECTION",
  //             },
  //           ],
  //         },
  //       ],
  //     };
  //     const response = await axios.post(apiURL, requestData);
  //     const data = response.data;
  //     console.log(data.responses[0].fullTextAnnotation.text);
  //     setConvertedText(data.responses[0].fullTextAnnotation.text);
  //     navigation.navigate("Edit",{text: convertedText})
  //   } catch (error) {
  //     console.error("Error analyzing image:", error);
  //     alert("Error analyzing image. Please try again");
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Pick image to import contacts</Text>
      <View style={styles.pickContainer}>
        <Pressable style={styles.pickPressable} onPress={pickFromGallery}>
          <FontAwesome name="picture-o" size={22} color="#f5f5f5" />
          <Text style={styles.pressableText}>From gallery</Text>
        </Pressable>
        <Pressable style={styles.pickPressable} onPress={pickFromCamera}>
          <EvilIcons name="camera" size={35} color="#f5f5f5" />
          <Text style={styles.pressableText}>From camera</Text>
        </Pressable>
      </View>
      
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1e1e", //#1B262C or #222831 or #282828
  },
  text: {
    fontSize: 18,
    fontWeight: "500",
    color: "#f5f5f5",
  },
  pickContainer: {
    height: 200,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickPressable: {
    width: "45%",
    marginHorizontal: 6,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "#393E46",
    borderStyle: "dashed",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  pressableText: {
    fontSize: 12,
    fontWeight: "200",
    color: "#EEEEEE",
  },
});
