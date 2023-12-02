import { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Pressable,
  ScrollView,
} from "react-native";
import * as Contacts from "expo-contacts";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

export default ResultScreen = ({ route, navigation }) => {
  const { text } = route.params;
  var contacts = {};
  const [contactIds, setContactIds] = useState([]);
  const [savedContacts, setSavedContacts] = useState([]);
  const [saving, setSaving] = useState(true);
  const [success, setSuccess] = useState(true);

  useEffect(() => {
    if (!text) {
      return Alert.alert(
        "Nothing there to save there!",
        "Please re-select an image",
        [{ text: "Go Back", onPress: () => navigation.navigate("Home") }]
      );
    }
    processText();
    saveContacts();
  }, []);
  useEffect(() => {
    if (!saving) {
      console.log("contact IDS here:", contactIds);
      console.log("Saved contacts: ", savedContacts);
      // fetchContacts();
    }
  }, [saving]);
  // useEffect(() => {
  //   if(!fetching){
  //     console.log("results arr:", resultsArr);

  //   }
  // },[fetching])
  // const fetchContacts = async () => {
  //   const { status } = await Contacts.requestPermissionsAsync();
  //   if (status === "granted") {
  //     contactIds.forEach(async (id) => {
  //       try {
  //         console.log("Fetching contact:", id);
  //         Contacts.getContactByIdAsync(id, {
  //           fields: [Contacts.Fields.Name],
  //         }).then((data) => {
  //           console.log(data);
  //           setResultsArr((resultsArr) => [...resultsArr, data]);
  //         });
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     });
  //     setFetching(false)
  //   }
  // };
  const processText = () => {
    const lines = text.split(/[\r\n]+/); // [] means any of the characters in between; newline is \r\n in windows
    // console.log("Lines:", lines);
    lines.forEach((item) => {
      const keyValue = item.split(/[:.]\s+/);
      contacts[keyValue[0].trim()] = keyValue[1]
        ?.replace(/[/.-\s]/g, "")
        .split(","); // g - match every ocurrence
    });
    console.log("Contacts:", contacts);
  };
  const saveContacts = async () => {
    if (!contacts) {
      return;
    }
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      for (key in contacts) {
        console.log("Key:", key, " Value:", contacts[key]);
        try {
          if (!key || !contacts[key]) {
            setSuccess(false);
            continue;
          }

          let phoneNumbers = [];
          contacts[key].forEach((number) => {
            if (/^[0-9+\-]+$/.test(number)) {
              phoneNumbers.push({
                label: "mobile",
                number: number,
              });
            }
          });
          if (!phoneNumbers.length) continue;
          console.log(phoneNumbers);
          const contact = {
            [Contacts.Fields.FirstName]: key,
            // [Contacts.Fields.ContactType]: [Contacts.ContactTypes.Person],
            [Contacts.Fields.PhoneNumbers]: phoneNumbers,
          };
          console.log("saving contact:", contact);
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
          setSuccess(false);
          console.error("Error saving contact:", key, contacts[key]);
          console.error(error);
        }
      }
    } //FIXME: else set success state to false
    // setTimeout(() => {
    //   setSaving(false);
    // }, 1000);
    setSaving(false);
  };
  const handleEdit = async (id) => {
    try {
      await Contacts.presentFormAsync(id);
    } catch (error) {
      console.log("Error editing contact:", error);
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
      {success ? (
        <View style={styles.resultContainer}>
          <FontAwesome name="check-circle" size={50} color="#9BA4B5" />
          <Text style={styles.resultText}>Successfully saved contacts</Text>
          <FlatList
            data={savedContacts}
            renderItem={({ item }) => (
              <View style={styles.contactContainer}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                  <Pressable onPress={() => handleEdit(item.id)}>
                    <FontAwesome name="edit" size={24} color="black" />
                  </Pressable>
                </View>
                {item.phoneNumbers.map((eachNum, idx) => (
                  <Text key={idx} style={{ alignSelf: "flex-start" }}>
                    {eachNum?.number}
                  </Text>
                ))}
              </View>
            )}
            keyExtractor={(item) => item.id}
            extraData={savedContacts}
            ListHeaderComponent={<View style={{ height: 20 }} />}
            ItemSeparatorComponent={<View style={{ height: 16 }} />}
            ListFooterComponent={
              <Pressable
                style={styles.homePressable}
                onPress={() => navigation.navigate("Home")}
              >
                <FontAwesome name="home" size={18} color="white" />

                <Text style={styles.text}> Back Home </Text>
              </Pressable>
            }
          />
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Entypo name="emoji-sad" size={100} color="#9BA4B5" />
          <Text style={styles.resultText}>Unable to save contacts</Text>
          <Pressable
            style={styles.homePressable}
            onPress={() => navigation.navigate("Home")}
          >
            <FontAwesome name="backward" size={16} color="white" />
            <Text style={styles.text}> Try again</Text>
          </Pressable>
        </View>
      )}
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
  resultContainer: {
    alignItems: "center",
  },
  contactContainer: {
    backgroundColor: "#A6CF98",
    minWidth: "90%",
    padding: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#9BA4B5",
  },
  resultText: {
    color: "#9BA4B5",
    marginVertical: 20,
    fontSize: 18,
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
    // borderColor: "#cccccc",
    // borderWidth: 1
  },
});
