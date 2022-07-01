import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OrdersScreen from "../screens/OrdersScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";
import { useAuthContext } from "../contexts/AuthContext";
import AccountScreen from "../screens/AccountScreen";
import { ActivityIndicator } from "react-native";

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const { dbDriver } = useAuthContext();

  //SCREEN LOADING
  if (dbDriver === null) {
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {dbDriver ? (
        <>
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="Order Delivery" component={OrderDetailsScreen} />
        </>
      ) : (
        <Stack.Screen name="Profile Details" component={AccountScreen} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigation;
