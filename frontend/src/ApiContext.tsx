import React from "react";
import * as unloc from "@unloc/integrator-client-library";

const initialContextState = {
  lockHolders: [],
  selectedLockHolder: {},
  users: [],
  userData: { locks: [], keys: [], roles: [] },
};

export const Api = React.createContext<any>({});

/* export const useGlobal = () => { */
/*   const context = React.useContext(Api) */
/*   if(!context) { */
/*     throw new Error("Must be used in a ApiProvider") */
/*   } */

/*   /1* const [data, setData] = context *1/ */

/*   const selectLockHolder = (lockHolder: unloc.LockHolder) => { */
/*     setData({...data, selectedLockHolder: lockHolder}) */
/*   } */

/*   return { */
/*     data, */
/*     selectLockHolder */
/*   } */
/* } */

export const ApiProvider = (props: any) => {
  const context = React.useContext(Api);
  if (!context) {
    throw new Error("Must be used in a ApiProvider");
  }
  const [data, setData] = React.useState(initialContextState);
  const actions = {
    setSelectedLockHolder: (lockHolder: unloc.LockHolder) =>
      setData({ ...data, selectedLockHolder: lockHolder }),
  };

  return (
    <Api.Provider value={{ data, actions }}>{...props.children}</Api.Provider>
  );
};

const Comp = () => {
  const ctx = React.useContext(Api);
  ctx.actions.selectLockHolder(ctx.data.lockHolders[0]);
  return <div></div>;
};
