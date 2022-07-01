import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { DataStore } from "aws-amplify";

import OrderItem from "../components/OrderItem";
import { Order } from "../models";
import CustomMarker from "../components/CustomMarker";

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const bottomSheetRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const snapPoints = useMemo(() => ["14%", "95%"], []);

  const fetchOrder = () => {
    DataStore.query(Order, (order) =>
      order.status("eq", "READY_FOR_PICKUP")
    ).then(setOrders);
  };

  useEffect(() => {
    fetchOrder();

    const subscription = DataStore.observe(Order).subscribe((msg) => {
      if (msg.opType === "UPDATE") {
        fetchOrder();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (!status === "granted") {
        console.log("ACCESS DENIED");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  //SCREEN LOADING
  if (!orders || orders === [] || !driverLocation) {
    return (
      <ActivityIndicator
        size={"large"}
        color="grey"
        style={{ paddingTop: 400 }}
      />
    );
  }

  //
  return (
    <View style={styles.container}>
      <MapView
        style={{ width, height }}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        followUserLocation
      >
        {orders.map((order) => (
          <CustomMarker
            data={order.Restaurant}
            type="RESTAURANT"
            key={order.id}
          />
        ))}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ width: 100, backgroundColor: "grey" }}
      >
        <View style={styles.contentContainer}>
          <View
            style={{ alignItems: "center", marginBottom: 30, marginTop: 10 }}
          >
            <Text style={styles.title}>You are Online 🎉</Text>
            <Text style={styles.subTitle}>
              Available Nearby Orders {orders?.length}
            </Text>
          </View>

          <BottomSheetFlatList
            data={orders}
            renderItem={({ item }) => <OrderItem order={item} />}
          />
        </View>
      </BottomSheet>
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: "green",
    fontSize: 25,
    fontWeight: "700",
  },
  subTitle: {
    color: "grey",
    fontSize: 18,
    fontWeight: "600",
    // marginTop: 10,
    // paddingTop: 10,
  },
});
