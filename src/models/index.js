// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const TransportationMode = {
  "CAR": "CAR",
  "BIKE": "BIKE"
};

const OrderStatus = {
  "NEW": "NEW",
  "ACCEPTED": "ACCEPTED",
  "READY_FOR_PICKUP": "READY_FOR_PICKUP",
  "PICKED_UP": "PICKED_UP",
  "COMPLETED": "COMPLETED",
  "COOKING": "COOKING"
};

const { Driver, Basket, BasketDish, Dish, OrderDish, Order, Restaurant, User } = initSchema(schema);

export {
  Driver,
  Basket,
  BasketDish,
  Dish,
  OrderDish,
  Order,
  Restaurant,
  User,
  TransportationMode,
  OrderStatus
};