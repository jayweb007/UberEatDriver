import { View } from "react-native";
import { Marker } from "react-native-maps";
import { Entypo, MaterialIcons } from "@expo/vector-icons";

const CustomMarker = ({ data, type }) => {
  return (
    <Marker
      title={data.name}
      description={data.address}
      coordinate={{
        latitude: data.lat,
        longitude: data.lng,
      }}
    >
      <View
        style={{
          backgroundColor: "#3fc060",
          padding: 5,
          borderRadius: 20,
        }}
      >
        {type === "RESTAURANT" ? (
          <Entypo name="shop" size={44} color="white" />
        ) : (
          <MaterialIcons name="restaurant" size={44} color="white" />
        )}
      </View>
    </Marker>
  );
};

export default CustomMarker;
