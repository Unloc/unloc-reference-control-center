import React, { useState } from "react";
import Dashboard from "./Dashboard";
import api from "./api";
import * as unloc from "@unloc/integrator-client-library";

const useApp = () => {
  const [lockHolders, setLockHolders] = useState<unloc.LockHolder[]>([]);
  const [selectedLockHolder, setSelectedLockHolder] = useState<any>({
    name: "",
  });
  const [users, setUsers] = useState<any>([]);
  const [locks, setLocks] = useState<unloc.Lock[]>([]);
  const [roles, setRoles] = useState<unloc.Role[]>([]);
  const [keys, setKeys] = useState<unloc.Key[]>([]);
  const [loadingMainData, setLoadingMainData] = useState(false);
  const [actions, setActions] = useState<Function[]>([]);
  const [backupState, setBackupState] = useState({
    users: [],
    roles: [],
    keys: [],
    locks: [],
    lockHolders: [],
  });

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
    setUsers(uniqueUsers.sort());
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
    setLockHolders(newLockHolders);
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
        setLockHolders(newLockHolders);
      } catch (err) {
        alert(
          `Could not update lock holder name ${err.error} ${err.errorDescription}`
        );
      }
    });
  };

  const updateLockName = async (
    lockId: string,
    name: string,
    image: string
  ) => {
    setLocks(
      locks.map((lock) => (lock.id === lockId ? { ...lock, name } : lock))
    );
    addAction(
      async () => await api.updateLock(selectedLockHolder, lockId, name, image)
    );
  };

  const revokeKey = async (lockId: string, keyId: string, userId: string) => {
    const localKey = keys.find(
      (key: any) =>
        key.lockId === lockId && key.id === keyId && key.state !== "revoked"
    );
    if (localKey) {
      setKeys(
        keys.map((key: unloc.Key) =>
          key.toUser.id === userId &&
          key.lockId === lockId &&
          key.id === localKey.id
            ? { ...key, state: "revoked" }
            : key
        )
      );
    }
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
    setKeys([...keys, newKey]);
    addAction(async () =>
      api.createKey(
        selectedLockHolder,
        lockId,
        userId,
        start,
        end,
        skipInviteNotification ? skipInviteNotification : false
      )
    );
  };

  const deleteSharedKeys = async (userId: string) => {
    addAction(async () => api.deleteSharedKeys(selectedLockHolder, userId));
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
      setRoles([...roles, newRole]);
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
    setLoadingMainData(true);
    try {
      await Promise.all(actions.map((e) => e()));
    } catch (err) {
      console.log(err);
      console.log(`${err.error} ${err.errorDescription}`);
    }
    setActions([]);
    await getAllDataForLockHolder();
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
    setActions([...actions, action]);
  };

  const state: any = {
    lockHolders,
    selectedLockHolder,
    users,
    locks,
    roles,
    keys,
    loadingMainData,
    actions,
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
    updateLockName,
    revokeKey,
    addRole,
    createKey,
    deleteSharedKeys,
    uniqueUsersFromRolesAndKeys,
  };

  return [state, commands];
};

const App = () => {
  const [state, commands] = useApp();
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
      <Dashboard {...state} {...commands} />
    </div>
  );
};

export default App;
