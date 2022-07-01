import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { DataStore } from "aws-amplify";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { User } from "../models";

const OrderItem = ({ order }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    DataStore.query(User, order.userID).then(setUser);
  }, []);

  const onPress = () => {
    navigation.navigate("Order Delivery", { id: order?.id });
  };

  //
  return (
    <Pressable onPress={onPress} style={styles.orderBox}>
      <Image style={styles.image} source={{ uri: order.Restaurant?.image }} />
      <View style={styles.box}>
        <Text style={styles.rName}>{order.Restaurant?.name}</Text>
        <Text style={styles.Address}>{order.Restaurant?.address}</Text>
        <Text style={styles.cTitle}>Delivery Details:</Text>
        <Text style={styles.cName}>{user?.name}</Text>
        <Text style={styles.Address}>{user?.address}</Text>
      </View>
      <View style={styles.markBox}>
        <Entypo name="check" size={34} color="white" />
      </View>
    </Pressable>
  );
};

export default OrderItem;

const styles = StyleSheet.create({
  orderBox: {
    flexDirection: "row",
    margin: 10,
    borderColor: "#3fc060",
    borderWidth: 3,
    borderRadius: 10,
  },
  image: {
    width: "25%",
    height: "100%",
    borderRadius: 10,
  },
  box: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 10,
    paddingVertical: 5,
  },
  rName: {
    fontSize: 18,
    fontWeight: "800",
  },
  Address: {
    color: "grey",
    fontSize: 15,
    fontWeight: "600",
  },
  cTitle: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    letterSpacing: 0.6,
  },
  cName: {
    color: "grey",
    fontSize: 15,
    fontWeight: "600",
  },
  markBox: {
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: "#3fc060",
    marginLeft: "auto",
  },
});
