import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import {
  FontAwesome5,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";

import * as env from "../../env";
import { useOrderContext } from "../contexts/OrderContext";
import CustomMarker from "../components/CustomMarker";

const driver = {
  latitude: 6.506935, //DRIVER
  longitude: 3.388953,
};
const foodOwner = {
  latitude: 6.508551, //DRIVER
  longitude: 3.367546,
};

const canteen = {
  latitude: 6.507934, //Cummerata Terrace | Thiel Group
  longitude: 3.372653,
};

const STATUS_TO_TITLE = {
  READY_FOR_PICKUP: "Accept Order",
  ACCEPTED: "Pick-Up Order",
  PICKED_UP: "Complete Delivery",
};

const OrderDetailsScreen = () => {
  const {
    order,
    user,
    dishes,
    acceptOrder,
    fetchOrder,
    pickUpOrder,
    completeOrder,
  } = useOrderContext();

  const [driverLocation, setDriverLocation] = useState(null);
  const [totalKM, setTotalKM] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const driverIsHere = totalKM < 1;

  const navigation = useNavigation();
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const snapPoints = useMemo(() => ["15%", "95%"], []);
  const route = useRoute();
  const id = route.params?.id;

  useEffect(() => {
    fetchOrder(id);
  }, [id]);

  const forgroundSubscription = async () => {
    let watchingDriver = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 500,
      },
      (updatedLocation) => {
        setDriverLocation({
          latitude: updatedLocation.coords.latitude,
          longitude: updatedLocation.coords.longitude,
        });
      }
    );
    return watchingDriver;
  };

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

    forgroundSubscription();
  }, []);

  const onButtonPress = async () => {
    const { status } = order;
    if (status === "READY_FOR_PICKUP") {
      bottomSheetRef.current?.collapse();
      mapRef.current.animateToRegion({
        latitude: driverLocation.latitude, //Ozone cinema
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      acceptOrder();
    }
    if (status === "ACCEPTED") {
      bottomSheetRef.current?.collapse();
      pickUpOrder();
    }
    if (status === "PICKED_UP") {
      await completeOrder();
      bottomSheetRef.current?.collapse();
      navigation.goBack();
    }
  };

  const buttonDisabled = () => {
    const { status } = order;
    if (status === "READY_FOR_PICKUP") {
      return false;
    }
    if ((status === "ACCEPTED" || status === "PICKED_UP") && driverIsHere) {
      return false;
    }
    return true;
  };

  const deliveryLocation = {
    latitude: user?.lat, //FOOD OWNER or USER
    longitude: user?.lng,
  };

  const restaurantLocation = {
    latitude: order?.Restaurant?.lat, //RESTAURANT or Canteen
    longitude: order?.Restaurant?.lng,
  };

  //SCREEN LOADING
  if (!order || !user || !dishes || !driverLocation) {
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
        ref={mapRef}
        style={{ width, height }}
        initialRegion={{
          latitude: driverLocation.latitude, //Ozone cinema
          longitude: driverLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        followUserLocation
      >
        <MapViewDirections
          origin={driverLocation}
          destination={
            order.status === "ACCEPTED" ? restaurantLocation : deliveryLocation
          }
          waypoints={
            order.status === "READY_FOR_PICKUP" ? [restaurantLocation] : []
          }
          strokeWidth={8}
          strokeColor={"#3fc060"}
          apikey={env.GOOGLE_MAPS_APIKEY}
          onReady={(result) => {
            setTotalKM(result.distance);
            setTotalTime(result.duration);
          }}
          lineDashPattern={[0]}
        />
        <Marker
          title="Driver"
          description="Driver Location"
          coordinate={{
            latitude: driverLocation.latitude, //Ozone cinema
            longitude: driverLocation.longitude,
          }}
        >
          <View
            style={{
              backgroundColor: "#3fc060",
              padding: 5,
              borderRadius: 20,
            }}
          >
            <MaterialCommunityIcons
              name="truck-delivery"
              size={44}
              color="white"
            />
          </View>
        </Marker>

        <CustomMarker data={user} type="USER" />
        <CustomMarker data={order?.Restaurant} type="RESTAURANT" />
      </MapView>
      {order.status === "READY_FOR_PICKUP" && (
        <Ionicons
          onPress={() => navigation.goBack()}
          name="arrow-back-circle"
          size={40}
          color="black"
          style={styles.arrow}
        />
      )}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ width: 100, backgroundColor: "grey" }}
      >
        <View style={styles.contentContainer}>
          <View
            style={{
              alignItems: "center",
              // marginVertical: 25,
            }}
          >
            <Text style={styles.title}>
              {totalKM.toFixed(0)} min &nbsp;&nbsp;
              <FontAwesome5 name="shopping-bag" size={24} color="#3fc060" />
              &nbsp;&nbsp;{totalTime.toFixed(1)} km
            </Text>
          </View>
          <View
            style={{ borderWidth: 2, borderColor: "lightgrey", marginTop: 50 }}
          />
          <View
            style={{
              flexDirection: "column",
              marginHorizontal: 20,
            }}
          >
            <Text style={styles.rtitle}>{order?.Restaurant?.name} </Text>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <Fontisto name="shopping-store" size={24} color="grey" />
                <Ionicons
                  name="location"
                  size={34}
                  color="grey"
                  style={{ marginTop: 20 }}
                />
              </View>
              <View>
                <Text style={styles.rsubTitle}>
                  {order?.Restaurant?.address}
                </Text>
                <Text style={styles.csubTitle}>{user?.address}</Text>
              </View>
            </View>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: "lightgrey",
              marginTop: 20,
              marginHorizontal: 20,
            }}
          />
          <View
            style={{
              flexDirection: "column",
              marginHorizontal: 20,
              marginTop: 10,
            }}
          >
            {dishes?.map((item) => (
              <Text style={{ marginBottom: 5, fontSize: 18 }} key={item.id}>
                {item.Dish.name} x{item.quantity}
              </Text>
            ))}
          </View>
          <Pressable
            onPress={onButtonPress}
            style={{
              alignItems: "center",
              marginHorizontal: 10,
              marginTop: "auto",
              marginBottom: 50,
              backgroundColor: buttonDisabled() ? "gray" : "#3fc060",
              padding: 15,
              borderRadius: 5,
            }}
            disabled={buttonDisabled()}
          >
            <Text style={{ color: "white", fontWeight: "500", fontSize: 23 }}>
              {STATUS_TO_TITLE[order.status]}
            </Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue",
  },
  contentContainer: {
    flex: 1,
    // alignItems: "center",
  },
  title: {
    color: "black",
    fontSize: 25,
    fontWeight: "700",
    marginTop: 30,
  },
  subTitle: {
    color: "grey",
    fontSize: 18,
    fontWeight: "600",
  },
  rtitle: {
    color: "black",
    fontSize: 25,
    fontWeight: "700",
    marginVertical: 20,
  },
  rsubTitle: {
    color: "grey",
    fontSize: 18,
    fontWeight: "600",
  },
  csubTitle: {
    color: "grey",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 25,
  },
  arrow: {
    position: "absolute",
    top: 40,
    left: 10,
  },
});
