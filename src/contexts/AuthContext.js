import { createContext, useState, useEffect, useContext } from "react";
import { Auth, DataStore } from "aws-amplify";
import { Driver } from "../../src/models";

const AuthContext = createContext({});

const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [dbDriver, setDbDriver] = useState(null);
  const sub = authUser?.attributes?.sub;

  useEffect(() => {
    Auth.currentAuthenticatedUser({ bypassCache: true }).then(setAuthUser);
  }, []);

  useEffect(() => {
    if (!sub) {
      return;
    }
    DataStore.query(Driver, (driver) => driver.sub("eq", sub)).then((drivers) =>
      setDbDriver(drivers[0])
    );
  }, [sub]);

  useEffect(() => {
    if (!dbDriver) {
      return;
    }
    const subscription = DataStore.observe(Driver, dbDriver.id).subscribe(
      (msg) => {
        if (msg.opType === "UPDATE") {
          setDbDriver(msg.element);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setDbDriver, dbDriver, sub }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuthContext = () => useContext(AuthContext);
