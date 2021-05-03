import React, { useState } from "react";
import Dashboard from "./Dashboard";
import api from "./api";
import * as unloc from "@unloc/integrator-client-library";
import {useGlobal} from "./AppContext"

const App = () => {
  const {state, commands} = useGlobal();
  unloc.init("https://api-sandbox.unloc.app");

  const {
    setRoles,
    setKeys,
    setLocks,
    setLoadingMainData,
    setLockHolders,
    uniqueUsersFromRolesAndKeys,
  } = commands;
  const { selectedLockHolder } = state;

  React.useEffect(() => {
    (async () => {
      setLoadingMainData(true);
      if (selectedLockHolder.name) {
        await api.getToken(selectedLockHolder);
        try {
          let [locks, roles, keys] = await Promise.all([
            api.getLocks(selectedLockHolder),
            api.getRoles(selectedLockHolder),
            api.getKeys(selectedLockHolder),
          ]);

          setLocks(locks.sort((el1, el2) => el1.name.localeCompare(el2.name)));
          setKeys(keys);
          setRoles(roles);

          uniqueUsersFromRolesAndKeys(roles, keys);
        } catch (err) {
          console.log(err);
        }
      }
      setLoadingMainData(false);
    })();
  }, [selectedLockHolder]);

  React.useEffect(() => {
    (async () => {
      try {
        setLockHolders(await api.getLockHolders());
      } catch (err) {
        alert(
          `Could not get lock holders ${err.error} ${err.errorDescription}`
        );
        console.error(err);
      }
    })();
  }, []);

  return (
    <div className="app">
      <Dashboard/>
    </div>
  );
};

export default App;
