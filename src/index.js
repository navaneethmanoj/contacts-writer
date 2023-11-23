import { View, Text, StyleSheet, Button, Image, Pressable } from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
//import * as FileSystem from "expo-file-system";
import { useState, useEffect } from "react";

import { REACT_APP_API_KEY } from "@env";

export default DetectText = () => {
  const [imageBase64, setImageBase64] = useState(null);
  // const [image, setImage] = useState(null);
  const [convertedText, setConvertedText] = useState("");

  const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${REACT_APP_API_KEY}`;

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
  const analyzeImage = async () => {
    try {
      if (!imageBase64) {
        alert("Please select an image");
        return;
      }
      // const base64Image = await FileSystem.readAsStringAsync(image, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });
      const requestData = {
        requests: [
          {
            image: {
              content: imageBase64,
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
      console.log(data.responses[0].fullTextAnnotation.text);
      setConvertedText(data.responses[0].fullTextAnnotation.text);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Error analyzing image. Please try again");
    }
  };

  return (
    <View>
      <Text style={styles.text}>Pick image to import contacts</Text>
      <View style={styles.pickContainer}>
        <Pressable style={styles.pickPressable} onPress={pickFromGallery}>
          <Text>From gallery</Text>
        </Pressable>
        <Pressable style={styles.pickPressable} onPress={pickFromCamera}>
          <Text>From camera</Text>
        </Pressable>
      </View>
      {imageBase64 && (
        <Image
          source={{ uri: "data:image/jpeg;base64," + imageBase64 }}
          style={{ width: 200, height: 200 }}
        />
      )}
      <Button title="Analyze image" onPress={analyzeImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: "500",
    color: "#f5f5f5",
  },
  pickContainer: {
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickPressable: {
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "#393E46",
    borderStyle: "dashed",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
