import React, {useState} from "react";
import * as unloc from "@unloc/integrator-client-library";
import api from "./api";

interface Action {
  type: ActionType
  data: any
}

interface AppState {
  lockHolders: unloc.LockHolder[]
  selectedLockHolder: unloc.LockHolder
  users: unloc.User[]
  locks: unloc.Lock[]
  roles: unloc.Role[]
  keys: unloc.Key[]
  loadingMainData: boolean
  actions: Function[]
  backupState: {
    users: unloc.User[],
    roles: unloc.Role[],
    keys: unloc.Key[],
    locks: unloc.Lock[],
    lockHolders: unloc.LockHolder[],
  }
}
interface App {
  state: AppState
  commands: {
    getAllDataForLockHolder: Function,
    runActions: Function,
    undo: Function,
    addAction: Function,
    setLocks: Function,
    setKeys: Function,
    setRoles: Function,
    setUsers: Function,
    getAllRoles: Function,
    setSelectedLockHolder: Function,
    setLoadingMainData: Function,
    updateLockHolderName: Function,
    setLockHolders: Function,
    updateLock: Function,
    revokeKey: Function,
    addRole: Function,
    removeRole: Function,
    createKey: Function,
    deleteSharedKeys: Function,
    deleteSharedKeysForLock: Function,
    uniqueUsersFromRolesAndKeys: Function
  }
}

const getUniqueUsers = (users: unloc.User[]) => {
  let uniqueValues: unloc.User[] = [];
  users.forEach((user) => {
    const existingValue = uniqueValues.find(
      (it) => it.userId === user.userId
    );
    if (!existingValue) {
      uniqueValues.push(user);
    }
  });
  return uniqueValues;
};

const uniqueUsersFromRolesAndKeys = (
  roles: unloc.Role[],
  keys: unloc.Key[]
) => {
  let users = [
    ...roles.map((role: any) => ({
      userId: role.userId,
      userDisplayName: role.userName,
      keysCount: 0,
      rolesCount: 0,
    })),
    ...keys
      .filter((key: any) => key.state !== "revoked")
      .map((key: any) => ({
        userId: key.toUser.id,
        userDisplayName: key.toUser.userName,
        keysCount: 0,
        rolesCount: 0,
      })),
  ];
  const uniqueUsers = getUniqueUsers(users);
  return uniqueUsers.sort()
};


enum ActionType {
  GET_ALL_DATA_FOR_LOCKHOLDER,
  UPDATE_LOCKHOLDERS,
  UPDATE_LOCKS,
  UPDATE_USERS,
  UPDATE_ROLES,
  UPDATE_KEYS,
  UPDATE_ACTIONS,
  UPDATE_LOADING_MAIN_DATA,
  UPDATE_SELECTED_LOCKHOLDER,
  UPDATE_BACKUP_STATE,
  ADD_ACTION,
  ADD_KEY,
  REVOKE_KEY,
  ADD_ROLE,
  REMOVE_ROLE,
  RUN_ACTIONS
}

interface Action {
  type: ActionType
  data: any
}


interface AppState {
  lockHolders: unloc.LockHolder[]
  selectedLockHolder: unloc.LockHolder
  users: unloc.User[]
  locks: unloc.Lock[]
  roles: unloc.Role[]
  keys: unloc.Key[]
  loadingMainData: boolean
  actions: Function[]
}

const initialState: AppState = {
  lockHolders: [],
  selectedLockHolder: {id: "", name: "", countryIso: "", organizationId: ""},
  users: [],
  locks: [],
  roles: [],
  keys: [],
  loadingMainData: false,
  actions: [],
  backupState: {
    users: [],
    roles: [],
    keys: [],
    locks: [],
    lockHolders: []
  }
}

const reducer = (state: AppState, action: Action): AppState => {
  switch(action.type) {
    case ActionType.UPDATE_KEYS: {
      return {
        ...state,
        keys: action.data
      }
    }
    case ActionType.ADD_KEY: {
      const keyExists = state.keys.find(key => key.lockId === action.data.lockId && key.toUser.id === action.data.toUser.id)
      if(keyExists) {
        return {
          ...state,
          keys: state.keys.map(key => key.lockId === action.data.lockId && key.toUser.id === action.data.toUser.id ? action.data : key)
        }
      } else {
        return {
          ...state,
          keys: [...state.keys, action.data]
        }
      }
    }
    case ActionType.ADD_ROLE: {
      const roleExists = state.roles.find(role => role.lockId === action.data.lockId && role.userId === action.data.userId)
      if(roleExists) {
        return {
          ...state,
          roles: state.roles.map(role => role.lockId === action.data.lockId && role.userId === action.data.userId ? action.data : role)
        }
      } else {
        return {
          ...state,
          roles: [...state.roles, action.data]
        }
      }
    }
    case ActionType.REMOVE_ROLE: {
      return {
        ...state,
        roles: state.roles.map(role => role.userId === action.data.userId && role.lockId === action.data.lockId ? {...role, canShare: false} : role)
      }
    }
    case ActionType.REVOKE_KEY: {
      return {
        ...state,
        keys: state.keys.map((key: unloc.Key) => key.id === action.data.id ? {...key, state: "revoked"} : key)
      }
    }
    case ActionType.UPDATE_ROLES: {
      return {
        ...state,
        roles: action.data
      }
    }
    case ActionType.UPDATE_USERS: {
      return {
        ...state,
        users: action.data
      }
    }
    case ActionType.UPDATE_LOCKS: {
      return {
        ...state,
        locks: action.data
      }
    }
    case ActionType.UPDATE_LOCKHOLDERS: {
      return {
        ...state,
        lockHolders: action.data
      }
    }
    case ActionType.UPDATE_BACKUP_STATE: {
      return {
        ...state,
        backupState: action.data
      }
    }
    case ActionType.UPDATE_ACTIONS: {
      return {
        ...state,
        actions: action.data
      }
    }
    case ActionType.ADD_ACTION: {
      return {
        ...state,
        actions: [...state.actions, action.data]
      }
    }
    case ActionType.UPDATE_LOADING_MAIN_DATA: {
      return {
        ...state,
        loadingMainData: action.data
      }
    }
    case ActionType.UPDATE_SELECTED_LOCKHOLDER: {
      return {
        ...state,
        selectedLockHolder: action.data
      }
    }
  default:
    return state
  }
}


const AppContext = React.createContext<App>({
  state: initialState, 
  commands: {
    getAllDataForLockHolder: () => {},
    runActions: () => {},
    undo: () => {},
    addAction: () => {},
    setLocks: () => {},
    setKeys: () => {},
    setRoles: () => {},
    setUsers: () => {},
    getAllRoles: () => {},
    setSelectedLockHolder: () => {},
    setLoadingMainData: () => {},
    updateLockHolderName: () => {},
    setLockHolders: () => {},
    updateLock: () => {},
    revokeKey: () => {},
    addRole: () => {},
    removeRole: () => {},
    createKey: () => {},
    deleteSharedKeys: () => {},
    deleteSharedKeysForLock: () => {},
    uniqueUsersFromRolesAndKeys: () => {}
  }
})



export const useGlobal = () => React.useContext(AppContext)

export const AppProvider = (props: any) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const contextValue = React.useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);
  const {selectedLockHolder, lockHolders, users, locks, roles, keys, actions, backupState} = state
  /* console.log("PROVIDER ", actions); */

  const setUsers = (newUsers: unloc.User[]) => {
    dispatch({type: ActionType.UPDATE_USERS, data: newUsers})
  }
  const setLocks = (newLocks: unloc.Lock[]) => {
    dispatch({type: ActionType.UPDATE_LOCKS, data: newLocks})
  }
  const setKeys = (newKeys: unloc.Key[]) => {
    dispatch({type: ActionType.UPDATE_KEYS, data: newKeys})
  }
  const addKey = (newKey: unloc.Key) => {
    dispatch({type: ActionType.ADD_KEY, data: newKey})
  }
  const createRole = (newRole: unloc.Role) => {
    dispatch({type: ActionType.ADD_ROLE, data: newRole})
  }
  const removeRole = async (lockId: string, userId: string) => {
    dispatch({type: ActionType.REMOVE_ROLE, data: {lockId, userId}})
    addAction(async () =>
    api.createOrUpdateRole(selectedLockHolder, lockId, userId, false)
    );
  }
  const setLockHolders = (newLockHolders: unloc.LockHolder[]) => {
    dispatch({type: ActionType.UPDATE_LOCKHOLDERS, data: newLockHolders})
  }
  const setRoles = (newRoles: unloc.Role[]) => {
    dispatch({type: ActionType.UPDATE_ROLES, data: newRoles})
  }
  const setActions = (newActions: Function[]) => {
    dispatch({type: ActionType.UPDATE_ACTIONS, data: newActions})
  }
  const setBackupState = (newBackupState: any) => {
    dispatch({type: ActionType.UPDATE_BACKUP_STATE, data: newBackupState})
  }
  const setLoadingMainData = (newLoadingMainData: boolean) => {
    dispatch({type: ActionType.UPDATE_LOADING_MAIN_DATA, data: newLoadingMainData})
  }
  const setSelectedLockHolder = (newSelectedLockHolder: boolean) => {
    dispatch({type: ActionType.UPDATE_SELECTED_LOCKHOLDER, data: newSelectedLockHolder})
  }

  const uniqueUsersFromRolesAndKeys = (
    roles: unloc.Role[],
    keys: unloc.Key[]
  ) => {
    let users = [
      ...keys
        .filter((key: any) => key.state !== "revoked")
        .map((key: any) => ({
          userId: key.toUser.id,
          userDisplayName: key.toUser.name,
          keysCount: 0,
          rolesCount: 0,
          profilePicture: key.toUser.imageUrl,
        })),
        ...roles.map((role: any) => ({
          userId: role.userId,
          userDisplayName: role.userName,
          keysCount: 0,
          rolesCount: 0,
        })),
    ];
    const uniqueUsers = getUniqueUsers(users);
    setUsers(uniqueUsers.sort((a, b) => (a.userDisplayName > b.userDisplayName) ? 1 : ((b.userDisplayName > a.userDisplayName) ? -1 : 0)));
  };

  const getUniqueUsers = (users: unloc.User[]) => {
    let uniqueValues: unloc.User[] = [];
    users.forEach((user) => {
      const existingValue = uniqueValues.find(
        (it) => it.userId === user.userId
      );
      if (!existingValue) {
        uniqueValues.push(user);
      }
    });
    return uniqueValues;
  };

  const getAllDataForLockHolder = async () => {
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
        alert(
          `Could not get locks/keys/roles for lock holder ${err.error} ${err.errorDescription}`
        );
      }
    }
  };

  const getAllRoles = async () => {
    if (selectedLockHolder.name) {
      await api.getToken(selectedLockHolder);
      try {
        setRoles(await api.getRoles(selectedLockHolder));
      } catch (err) {
        alert(`Could not get all roles ${err.error} ${err.errorDescription}`);
      }
    }
  };

  const updateLockHolderName = async (newName: string) => {
    let newLockHolders = lockHolders.map((lockHolder) => {
      if (lockHolder.name === selectedLockHolder.name) {
        lockHolder.name = newName;
      }
      return lockHolder;
    });
    setLockHolders(newLockHolders)
    addAction(async () => {
      try {
        const {
          name,
          countryIso,
          organizationId,
          organizationIdSuffix,
        } = await api.updateLockHolder(selectedLockHolder, newName);
        newLockHolders = lockHolders.map((lockHolder) => {
          if (
            lockHolder.countryIso === countryIso &&
            lockHolder.organizationId === organizationId &&
            lockHolder?.organizationIdSuffix === organizationIdSuffix
          ) {
            lockHolder.name = name;
          }
          return lockHolder;
        });
        dispatch({type: ActionType.UPDATE_LOCKHOLDERS, data: newLockHolders})
      } catch (err) {
        alert(
          `Could not update lock holder name ${err.error} ${err.errorDescription}`
        );
      }
    });
  };

  const updateLock = async (
    lockId: string,
    name: string,
    image: string,
    address: unloc.Address
  ) => {
    setLocks(
      locks.map((lock) => (lock.id === lockId ? { ...lock, name, image, address } : lock))
    );
    addAction(
      () => api.updateLock(selectedLockHolder, lockId, name, image, address)
    );
  };

  const revokeKey = async (lockId: string, keyId: string) => {
    dispatch({type: ActionType.REVOKE_KEY, data: {id: keyId}})
    addAction(async () =>
      api.updateKey(selectedLockHolder, lockId, keyId, "revoked")
    );
  };

  const createKey = async (
    lockId: string,
    userId: string,
    start: string,
    end: string,
    skipInviteNotification?: boolean
  ) => {
    const newKey: unloc.Key = {
      id: "temp",
      lockId,
      toUser: { id: userId },
      start: "null",
      end: "null",
      state: "creating",
    };
    addKey(newKey);
    addAction(async () => {
      const keyResponse = await api.createKey(
        selectedLockHolder,
        lockId,
        userId,
        start,
        end,
        skipInviteNotification ? skipInviteNotification : false
      )
      addKey(keyResponse)
    });
  };

  const deleteSharedKeys = async (userId: string) => {
    addAction(async () => api.deleteSharedKeys(selectedLockHolder, userId));
  };
  const deleteSharedKeysForLock = async (lockId: string, userId: string) => {
    addAction(async () => api.deleteSharedKeysForLock(selectedLockHolder, lockId, userId));
  };

  const addRole = async (lockId: string, userId: string, canShare: boolean) => {
    let role = roles.find(
      (role) => role.lockId === lockId && role.userId === userId
    );
    if (role) {
      setRoles(
        roles.map((role) =>
          role.userId === userId && role.lockId === lockId
            ? { ...role, canShare }
            : role
        )
      );
    } else {
      let newRole: unloc.Role = {
        lockId,
        userId,
        canShare,
        created: "0",
        createdKeys: 0,
      };
      createRole(newRole)
      
      /* setRoles([...roles, newRole]); */
    }
    addAction(async () => {
      await api.createOrUpdateRole(
        selectedLockHolder,
        lockId,
        userId,
        canShare
      );
    });
  };

  const runActions = async () => {
    console.log("Running actions ", actions);
    setLoadingMainData(true);
    try {
      await Promise.all(actions.map((e) => e()));
    } catch (err) {
      console.log(`${err.error} ${err.errorDescription}`);
    }
    setActions([]);
    /* await getAllDataForLockHolder(); */
    setLoadingMainData(false);
  };

  const undo = async () => {
    setUsers(backupState.users);
    setLocks(backupState.locks);
    setKeys(backupState.keys);
    setRoles(backupState.roles);
    setLockHolders(backupState.lockHolders);
    setActions([]);
  };

  const addAction = (action: Function) => {
    if (actions.length === 0) {
      setBackupState(
        JSON.parse(
          JSON.stringify({
            users,
            keys,
            roles,
            locks,
            lockHolders,
          })
        )
      );
    }
    dispatch({type: ActionType.ADD_ACTION, data: action})
  };

  const commands: any = {
    getAllDataForLockHolder,
    runActions,
    undo,
    addAction,
    setLocks,
    setKeys,
    setRoles,
    setUsers,
    getAllRoles,
    setSelectedLockHolder,
    setLoadingMainData,
    updateLockHolderName,
    setLockHolders,
    updateLock,
    revokeKey,
    addRole,
    removeRole,
    createKey,
    deleteSharedKeys,
    deleteSharedKeysForLock,
    uniqueUsersFromRolesAndKeys,
  };

  return (
    <AppContext.Provider value={{state: contextValue.state, commands}}>
      {props.children}
    </AppContext.Provider>
  )
}


