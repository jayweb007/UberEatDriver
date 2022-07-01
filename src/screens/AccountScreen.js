import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Text,
  TextInput,
  StyleSheet,
  Button,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Auth, DataStore } from "aws-amplify";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";

import { Driver, TransportationMode } from "../../src/models";
import { useAuthContext } from "../contexts/AuthContext";

const AccountScreen = () => {
  const { dbDriver, setDbDriver, sub } = useAuthContext();
  const navigation = useNavigation();

  const [name, setName] = useState(dbDriver?.name || "");
  const [transportationMode, setTransportationMode] = useState(
    TransportationMode.BIKE
  );

  const onSave = async () => {
    if (dbDriver) {
      await updateDriver();
    } else {
      await createDriver();
    }
  };

  const updateDriver = async () => {
    try {
      const driver = await DataStore.save(
        Driver.copyOf(dbDriver, (updated) => {
          updated.name = name;
          updated.transportationMode = transportationMode;
        })
      );

      setDbDriver(driver);

      Alert.alert("Profile Updated Successfully!");
    } catch (e) {
      Alert.alert("Oopss!", e.message);
    }
  };

  const createDriver = async () => {
    try {
      const driver = await DataStore.save(
        new Driver({
          name,
          transportationMode,
          sub,
          lat: 0,
          lng: 0,
        })
      );

      setDbDriver(driver);
      Alert.alert("Profile Saved Successfully!");
      navigation.navigate("Orders");
    } catch (e) {
      Alert.alert("Oopss!", e.message);
    }
  };

  //SCREEN LOADING
  // if (!dbDriver) {
  //   return (
  //     <ActivityIndicator
  //       size={"large"}
  //       color="grey"
  //       style={{ paddingTop: 400 }}
  //     />
  //   );
  // }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.title}>Profile</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={styles.input}
      />
      <View
        style={{
          flexDirection: "row",
          margin: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable
          onPress={() => setTransportationMode(TransportationMode.BIKE)}
          style={[
            {
              ...styles.bg,
              marginRight: 20,
              backgroundColor:
                transportationMode === TransportationMode.BIKE
                  ? "#3fc060"
                  : "white",
            },
          ]}
        >
          <FontAwesome5 name="motorcycle" size={50} color="black" />
        </Pressable>
        <Pressable
          onPress={() => setTransportationMode(TransportationMode.CAR)}
          style={[
            {
              ...styles.bg,
              marginRight: 20,
              backgroundColor:
                transportationMode === TransportationMode.CAR
                  ? "#3fc060"
                  : "white",
            },
          ]}
        >
          <FontAwesome name="automobile" size={50} color="black" />
        </Pressable>
      </View>

      <Button onPress={onSave} title="Save" color="#007AFF" />
      <Button onPress={() => Auth.signOut()} title="Sign Out" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderRadius: 10,
    borderColor: "lightgrey",
    borderWidth: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
  input: {
    margin: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
  },
});

export default AccountScreen;
