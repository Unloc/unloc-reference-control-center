import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import * as unloc from "@unloc/integrator-client-library";
import useWindowSize from "./UseWindowSize";
import CreateLockHolderModal from "./modals/CreateLockHolder";
import UpdateLockHolderModal from "./modals/UpdateLockHolder";
import UpdateLockModal from "./modals/UpdateLock";
import AddUserModal from "./modals/AddUser";
import UserModal from "./modals/User";
import Lottie from "lottie-react";
import loadingAnimation from "./assets/Loading.json";
import Loader from "./Loader";
import Key from "./Key";
import Share from "./Share";
import Search from "./assets/search.svg";
import ChevronLeft from "./ChevronLeft";
import ChevronRight from "./ChevronRight";
import {useGlobal} from "./AppContext"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const { state, commands } = useGlobal()
  const {
    lockHolders,
    selectedLockHolder,
    keys,
    locks,
    users,
    roles,
    actions,
    loadingMainData,
  } = state;
  const {
    setSelectedLockHolder,
    updateLockHolderName,
    addRole,
    removeRole,
    revokeKey,
    createKey,
    updateLock,
    undo,
    runActions,
  } = commands;

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [lockHolderIndex, setLockHolderIndex] = useState(-1);
  const [lockHolderModalOpen, setLockHolderModalOpen] = useState(false);
  const [updateLockHolderModalOpen, setUpdateLockHolderModalOpen] = useState(
    false
  );
  const [updateLockModalOpen, setUpdateLockModalOpen] = useState(false);
  const [selectedLock, setSelectedLock] = useState<unloc.Lock>();
  const [filterString, setFilterString] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<any[]>(users);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalData, setUserModalData] = useState<any>({
    userId: "",
    roles: [],
    keys: [],
  });
  const [lockModalData, setLockModalData] = useState({roles: roles, keys: keys, users: users})
  const windowSize = useWindowSize();

  React.useEffect(() => {
    setFilteredUsers(users.sort());
  }, [users]);

  const updateFilter = (ev: any) => {
    setFilterString(ev.target.value);
    setFilteredUsers(
      users.filter((user: any) => user.userId.match(ev.target.value))
    );
  };

  const selectLockHolder = (e: any) => {
    setLockHolderIndex(e.target.value);
    setSelectedLockHolder(lockHolders[e.target.value]);
  };

  const handleKeyClick = async (userId: string, lock: unloc.Lock) => {
    const localKey = keys.find(
      (key) =>
        key.toUser.id === userId &&
        key.lockId === lock.id &&
        key.state !== "revoked"
    );
    if (localKey) {
      revokeKey(lock.id, localKey.id, userId);
    } else {
      createKey(lock.id, userId, null, null);
    }
  };

  const openUserModal = (userId: String, userName: String) => {
    const userKeys = keys.filter(
      (key: unloc.Key) => key.toUser.id === userId && key.state !== "revoked"
    );
    const userRoles = roles.filter(
      (role: unloc.Role) => role.userId === userId
    );
    setUserModalData({
      userId: userId,
      roles: userRoles,
      keys: userKeys,
      userDisplayName: userName,
    });
    setUserModalOpen(true);
  };

  const openLockModal = (lock: unloc.Lock) => {
    const keysToLock = keys.filter((key: unloc.Key) => key.lockId === lock.id && key.state !== "revoked")
    const rolesForLock = roles.filter((role: unloc.Role) => role.lockId === lock.id)
    setLockModalData({keys: keysToLock, roles: rolesForLock, users: users})
    setUpdateLockModalOpen(true)
  }

  const notify = (message: string) => toast(message);

  const mainClassNames = loadingMainData
    ? "unloc-dashboard__main unloc-dashboard__main--loading"
    : "unloc-dashboard__main";

  return (
    <div className="unloc-dashboard">
      <CreateLockHolderModal
        setOpen={setLockHolderModalOpen}
        open={lockHolderModalOpen}
      />
      <UpdateLockHolderModal
        updateLockHolderName={updateLockHolderName}
        setOpen={setUpdateLockHolderModalOpen}
        open={updateLockHolderModalOpen}
        lockHolder={selectedLockHolder}
      />
      <UpdateLockModal
        setOpen={setUpdateLockModalOpen}
        open={updateLockModalOpen}
        lock={selectedLock}
        runActions={runActions}
        lockHolder={selectedLockHolder}
        updateLock={updateLock}
        revokeKey={revokeKey}
        createKey={createKey}
        addRole={addRole}
        removeRole={removeRole}
        notify={notify}
        {...lockModalData}
      />
      <AddUserModal
        setOpen={setAddUserModalOpen}
        open={addUserModalOpen}
        locks={locks}
        selectedLockHolder={selectedLockHolder}
        runActions={runActions}
        notify={notify}
      />
      <UserModal
        setOpen={setUserModalOpen}
        open={userModalOpen}
        runActions={runActions}
        selectedLockHolder={selectedLockHolder}
        locks={locks}
        {...userModalData}
        notify={notify}
      />
      <header className="unloc-dashboard__header">
        <h1>Unloc kontrollsenter</h1>
        {windowSize.width > 1000 && (
          <div className="field">
            <div className="control has-icons-left">
              <input
                className="input is-medium"
                placeholder="Search"
                type="text"
                value={filterString}
                onChange={updateFilter}
              />
              <span className="icon is-small is-left">
                <img src={Search} alt="" />
              </span>
            </div>
          </div>
        )}
        <div className="unloc-dashboard__locks" style={{ height: "100%" }}>
          {loadingMainData && <Loader />}
        </div>
        <div>
          {lockHolders.length === 0 ? (
            <Loader />
          ) : (
            <div className="select is-size-5">
              <select value={lockHolderIndex} onChange={selectLockHolder}>
                <option disabled value="-1">
                  {" "}
                  -- Select a lock holder --{" "}
                </option>
                {lockHolders.map((l: any, index: number) => (
                  <option value={index} key={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>
      <main className={mainClassNames}>
        {loadingMainData && roles && roles.length === 0 && <Loading />}
        {actions.length > 0 && (
          <div className="unloc-dashboard__confirm-undo">
            <button className="button is-primary" onClick={() => undo()}>
              Undo
            </button>
            <button
              className="button is-secondary"
              onClick={() => runActions()}
            >
              Confirm
            </button>
          </div>
        )}
        <div className="unloc-table">
          {locks && locks.length > 4 && windowSize.width > 1000 && (
            <>
              <button
                className="button unloc-dashboard__page-button-left"
                onClick={() =>
                  window.scrollBy({ left: -660, behavior: "smooth" })
                }
              >
                <ChevronLeft />
              </button>
              <button
                className="button unloc-dashboard__page-button-right"
                onClick={() =>
                  window.scrollBy({ left: 660, behavior: "smooth" })
                }
              >
                <ChevronRight />
              </button>
            </>
          )}
          <table>
            <thead>
              {locks && locks.length > 0 && (
                <tr>
                  <td>
                    <div className="unloc-table__users-heading">
                      <h3>Users</h3>
                      <button
                        className="button unloc-dashboard__add-user-button"
                        onClick={() => setAddUserModalOpen(true)}
                      >
                        <FontAwesomeIcon
                          icon={faPlusCircle}
                          color={`"#707070"`}
                        />
                        <span className="unloc-dashboard__button-text">
                          Add user
                        </span>
                      </button>
                    </div>
                  </td>
                  {windowSize.width > 1000 &&
                    locks.map((e: unloc.Lock, i: number) => (
                      <th key={i}>
                        <Lock
                          openModal={() => {
                            setSelectedLock(e);
                            openLockModal(e);
                          }}
                          {...e}
                        />
                      </th>
                    ))}
                </tr>
              )}
            </thead>
            <tbody>
              {filteredUsers.map((user: any, userIndex: number) => {
                const { userId, userDisplayName } = user;
                return (
                  <tr key={userIndex}>
                    <th>
                      <div
                        className="unloc-dashboard__user"
                        onClick={() => openUserModal(userId, userDisplayName)}
                      >
                        <div>{userDisplayName ? userDisplayName : userId}</div>
                      </div>
                    </th>
                    {windowSize.width > 1000 &&
                      locks.map((lock: unloc.Lock, index: number) => (
                        <td key={index}>
                          <Role
                            key={index}
                            userId={userId}
                            lock={lock}
                            keys={keys.filter(
                              (key) =>
                                key.toUser.id === userId &&
                                key.lockId === lock.id
                            )}
                            role={roles.find(
                              (role: any) =>
                                role.lockId === lock.id &&
                                role.userId === userId
                            )}
                            addRole={addRole}
                            handleKeyClick={handleKeyClick}
                          />
                        </td>
                      ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ToastContainer
            position="bottom-center"
            autoClose={10000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </main>
    </div>
  );
};

const Loading = (props: any) => {
  return (
    <div className="unloc-dashboard__loader">
      <Lottie
        style={{ height: "350px", width: "350px" }}
        animationData={loadingAnimation}
        loop={true}
        autoplay={true}
        initialSegment={[50, 800]}
      />
    </div>
  );
};

const Role = (props: any) => {
  const { userId, role, addRole, lock, keys, handleKeyClick } = props;
  const canShare = role && role.canShare ? role.canShare : false;
  const toggleCanShare = () => {
    addRole(lock.id, userId, !canShare);
  };
  const activeKeys = keys.filter((key: unloc.Key) => key.state !== "revoked");
  return (
    <div style={props.style} className="unloc-dashboard__role column">
      <button
        className={`unloc-dashboard__key${
          activeKeys.length > 0 ? " unloc-dashboard__key--active" : ""
        }`}
        onClick={() => handleKeyClick(userId, lock)}
      >
        <Key light={activeKeys.length > 0} />
      </button>
      <button
        className={`unloc-dashboard__canShare${
          canShare ? " unloc-dashboard__canShare--active" : ""
        }`}
        onClick={toggleCanShare}
      >
        <Share light={canShare} />
      </button>
    </div>
  );
};

const Lock = (props: any) => {
  const { name, canCreateKeysCount, keysCreatedCount, openModal } = props;
  return (
    <div className="unloc-dashboard__lock column" onClick={openModal}>
      <div className="unloc-dashboard__lock-name">{name}</div>
      <div className="unloc-dashboard__lock-key-share">
        <div>
          <div>Access</div>
          <div className="unloc-dashboard__lock-key-share-number">
            {" "}
            {keysCreatedCount}
          </div>
        </div>
        <div>
          <div>Key sharing</div>
          <div className="unloc-dashboard__lock-key-share-number">
            {" "}
            {canCreateKeysCount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
