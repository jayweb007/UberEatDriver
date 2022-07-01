import { createContext, useState, useEffect, useContext } from "react";
import { DataStore } from "aws-amplify";

import { Order, OrderDish, User } from "../../src/models";
import { useAuthContext } from "./AuthContext";

const OrderContext = createContext({});

const OrderContextProvider = ({ children }) => {
  const { dbDriver } = useAuthContext();
  const [order, setOrder] = useState();
  const [user, setUser] = useState();
  const [dishes, setDishes] = useState();

  const fetchOrder = async (id) => {
    if (!id) {
      setOrder(null);
      return;
    }
    const fetchedOrder = await DataStore.query(Order, id);
    setOrder(fetchedOrder);

    DataStore.query(User, fetchedOrder.userID).then(setUser);

    DataStore.query(OrderDish, (dish) =>
      dish.orderID("eq", fetchedOrder.id)
    ).then(setDishes);
  };

  const acceptOrder = () => {
    //Update Order, Change status and assign driver
    DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "ACCEPTED";
        updated.Driver = dbDriver;
      })
    ).then(setOrder);
  };

  const pickUpOrder = () => {
    //Update Order, Change status
    DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "PICKED_UP";
      })
    ).then(setOrder);
  };

  const completeOrder = () => {
    //Update Order, Change status
    DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "COMPLETED";
      })
    ).then(setOrder);
  };

  //
  return (
    <OrderContext.Provider
      value={{
        order,
        user,
        dishes,
        acceptOrder,
        fetchOrder,
        pickUpOrder,
        completeOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;

export const useOrderContext = () => useContext(OrderContext);
