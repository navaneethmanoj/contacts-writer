import { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import * as Contacts from "expo-contacts";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

export default ResultScreen = ({ route, navigation }) => {
  const { text } = route.params;
  var contacts = {};
  const [contactIds, setContactIds] = useState([]);
  const [savedContacts, setSavedContacts] = useState([]);
  const [errContacts, setErrContacts] = useState([]);
  const [saving, setSaving] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!text) {
        return Alert.alert("Nothing to save there!", "Please re-select image", [
          { text: "Go Back", onPress: () => navigation.navigate("Home") },
        ]);
      }
      processText();
      saveContacts();
    }, [])
  );

  const handleOpenSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };
  const processText = () => {
    const lines = text.split(/[\r\n]+/); // [] means any of the characters in between; newline is \r\n in windows
    var contactCount = 0;
    var prevCount;
    lines.forEach((line) => {
      if (!line.trim().length) 
        return;
      prevCount = contactCount;
      for (idx = 0; idx < line.length; idx++) {
        if (line[idx] === ":" || line[idx] === " ") {
          const value = line.substring(idx + 1);
          if (!/[a-zA-z]+/.test(value)) {
            // TODO: if one out of many phone numbers has an alphabet,it gets rejected
            const key = line.substring(0, idx).trim();
            contacts[key] = value.replace(/[:\s]/g, "").split(",");
            contactCount += 1;
            break;
          }
        }
      }
      if (prevCount === contactCount) {
        setErrContacts((errContacts) => [...errContacts, line]);
      }
    });
    // console.log("Contacts:", contacts);
  };
  const saveContacts = async () => {
    if (!contacts) {
      return;
    }
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      for (key in contacts) {
        // console.log("Key:", key, " Value:", contacts[key]);
        if (!key || !contacts[key] || contacts[key][0] === "") {
          setErrContacts((errContacts) => [
            ...errContacts,
            `${key} ${contacts[key] || ""}`,
          ]); //changes undefined to "" and saves in errContacts
          //console.log("Error saving contact:", key, contacts[key]);
          continue;
        }
        try {
          let phoneNumbers = [];
          contacts[key].forEach((number) => {
            // if (!(/[a-zA-z]+/.test(number))) { //TEST ALREADY PERFORMED IN processText fn
            //   phoneNumbers.push({
            //     label: "mobile",
            //     number: number,
            //   });
            // } else {
            //   setErrContacts((errContacts) => [
            //     ...errContacts,
            //     `${key}: ${number}`,
            //   ]);
            //   console.log("Error saving contact:", key, number);
            // }
            phoneNumbers.push({
              label: "mobile",
              number: number,
            });
          });
          // console.log(phoneNumbers);
          const contact = {
            [Contacts.Fields.FirstName]: key,
            // [Contacts.Fields.ContactType]: [Contacts.ContactTypes.Person],
            [Contacts.Fields.PhoneNumbers]: phoneNumbers,
          };
          // console.log("saving contact:", contact);
          Contacts.addContactAsync(contact).then((contactId) => {
            setContactIds((contactIds) => [...contactIds, contactId]);
            setSavedContacts((savedContacts) => [
              ...savedContacts,
              {
                id: contactId,
                name: contact.firstName,
                phoneNumbers: phoneNumbers,
              },
            ]);
          });
        } catch (error) {
          setErrContacts((errContacts) => [
            ...errContacts,
            key + contacts[key],
          ]);
          // console.log("Error saving contact:", key, contacts[key]);
          // console.log(error);
        }
      }
    } else {
      Alert.alert(
        "Permission required",
        "ContactWriter needs permission to save contacts",
        [
          {
            text: "Go to Settings",
            onPress: () => handleOpenSettings(),
          },
        ]
      );
      setPermissionError(true);
    }
    setSaving(false);
  };
  const handleEdit = async (id) => {
    try {
      await Contacts.presentFormAsync(id);
      try {
        const editedContact = await Contacts.getContactByIdAsync(id, [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
        ]);
        setSavedContacts((savedContacts) =>
          savedContacts.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                name: editedContact.name,
                phoneNumbers: editedContact.phoneNumbers,
              };
            }
            return item;
          })
        );
      } catch (error) {
        Alert.alert("Unable to display edited contact");
        // console.log("Error fetching edited contact:", error);
      }
    } catch (error) {
      // console.log("Error editing contact:", error);
      return Alert.alert(
        "Unable to edit contact",
        "Please try from the contacts app"
      );
    }
  };
  if (saving) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="gray" />
        <Text style={styles.text}>Saving contacts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {permissionError ? (
          <View style={styles.resultContainer}>
            <Entypo name="emoji-sad" size={100} color="#9BA4B5" />
            <Text style={styles.resultText}>Unable to save contacts</Text>
          </View>
        ) : null}
        {savedContacts?.length ? (
          <View style={styles.resultContainer}>
            <FontAwesome name="check-circle" size={70} color="#9BA4B5" />
            <Text style={styles.resultText}>Successfully saved contacts</Text>
            {savedContacts.map((item) => (
              <View key={item.id} style={styles.contactContainer}>
                <FontAwesome name="user-o" size={24} color="black" />
                <View style={{ marginLeft: "4%" }}>
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                  {item.phoneNumbers.map((eachNum, idx) => (
                    <Text key={idx} style={{ alignSelf: "flex-start" }}>
                      {eachNum?.number}
                    </Text>
                  ))}
                </View>
                <Pressable
                  onPress={() => handleEdit(item.id)}
                  style={{ position: "absolute", right: "5%" }}
                >
                  <FontAwesome name="edit" size={24} color="black" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        {errContacts?.length ? (
          <View style={styles.resultContainer}>
            <Entypo name="emoji-sad" size={70} color="#9BA4B5" />
            <Text style={styles.resultText}>Unable to save the following</Text>
            {errContacts.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.contactContainer,
                  { backgroundColor: "#FF8F8F" },
                ]}
              >
                <Text style={{ fontWeight: "bold" }}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Pressable
          style={styles.homePressable}
          onPress={() => navigation.navigate("Home")}
        >
          <FontAwesome name="home" size={18} color="white" />
          <Text style={styles.text}> Back Home </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
  },
  text: {
    color: "#f5f5f5",
  },
  resultText: {
    color: "#9BA4B5",
    marginTop: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  resultContainer: {
    alignItems: "center",
    marginTop: 18,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A6CF98",
    minWidth: "90%",
    padding: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
    marginVertical: 8,
  },
  homePressable: {
    width: 180,
    height: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    backgroundColor: "#363636",
    marginVertical: 30,
    alignSelf: "center",
    borderColor: "#cccccc",
    borderWidth: 1,
  },
});
