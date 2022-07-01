import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OrdersScreen from "../screens/OrdersScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";
import { useAuthContext } from "../contexts/AuthContext";
import AccountScreen from "../screens/AccountScreen";

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const { dbDriver } = useAuthContext();
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
