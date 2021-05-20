import React, { useState } from "react";
import api from "../api";
import * as unloc from "@unloc/integrator-client-library";
import RemoveUserModal from "./RemoveUser";
import Key from "../Key";
import Share from "../Share";

const UserModal = (props: any) => {
  const {
    open,
    setOpen,
    locks,
    user,
    keys,
    roles,
    selectedLockHolder,
    addRole,
    createKey,
    runActions,
    notify,
  } = props;
  const [removeUserModalOpen, setRemoveUserModalOpen] = useState(false);
  const keysShared = roles
    .map((role: unloc.Role) => role.createdKeys)
    .reduce(
      (keysShared: number, createdKeys: number) => createdKeys? keysShared + createdKeys : keysShared + 0,
      0
    );
  const close = () => {
    setOpen(false);
  };

  const createKeysForAllLocks = async (notifyOfSharing?: string) => {
    locks.forEach(async (lock: unloc.Lock) => {
      if (!keys.find((key: unloc.Key) => key.lockId === lock.id)) {
        createKey(lock.id, user.userId, null, null, false)
      }
    });
    close();
    if (notifyOfSharing) {
      notify(
        user.userDisplayName ? user.userDisplayName : user.userId +
          " has been given access to all doors" +
          notifyOfSharing
      );
    } else {
      notify(user.userDisplayName ? user.userDisplayName : user.userId + " has been given access to all doors");
    }
  };

  const createKeysAndRolesForAllLocks = async () => {
    createKeysForAllLocks(" with sharing");
    locks.forEach(async (lock: unloc.Lock) => {
      if (!roles.find((role: unloc.Role) => role.lockId === lock.id)) {
        addRole(lock.id, user.userId, true)
      }
    });
    close();
  };

  const save = async () => {
    close();
    await runActions();
  };

  return (
    <div className={`modal${open ? " is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card unloc-edit-user">
        <RemoveUserModal
          setOpen={setRemoveUserModalOpen}
          open={removeUserModalOpen}
          selectedLockHolder={selectedLockHolder}
          keys={keys}
          roles={roles}
          user={user}
          runActions={runActions}
          closeUserModal={close}
          notify={notify}
        />
        <div className="modal-card-head">
          <h3 className="is-size-3">Edit user</h3>
        </div>
        <div className="modal-card-body">
          {user.userDisplayName && (
            <>
              <h3>Name</h3>
              {user.userDisplayName}
            </>
          )}
          <h3>Phone number</h3>
          <span className="unloc-edit-user__phone-number">{user.userId}</span>
          <div className="unloc-edit-user__helper-text">
            If you want to change this users phone number you have to first
            remove them, and then add them with the new number.
          </div>
          <div>
            {user.profilePicture && <h3>Profile picture</h3>}
            {user.profilePicture && <img src={user.profilePicture} alt="User." />}
          </div>
          <div className="unloc-edit-user__sharing-text">
            <span>Currently sharing access with </span>
            <b>
              &nbsp;
              {keysShared}
              {keysShared === 1 ? " person." : " people."}
            </b>
          </div>
          <div>
            <h3>All doors</h3>
            <div style={{ display: "flex" }}>
              <button
                className="unloc-button unloc-button--dark-green"
                onClick={(_) => createKeysForAllLocks()}
              >
                <Key light />
                Give access
              </button>
              <button
                className="unloc-button unloc-button--light-green"
                onClick={createKeysAndRolesForAllLocks}
              >
                <Share />
                Access with sharing
              </button>
            </div>
              {/*
            <div className="add-user__lock-grid">
              <h3>Access settings for users added</h3>
                {locks.map((lock: any) => (
                    <Lock lock={lock} selectedRoles={selectedRoles} selectedLocks={selectedLocks} handleKeyClick={handleKeyClick} toggleCanShare={toggleCanShare}/>
                ))}
            </div>
              */}
          </div>
        </div>
        <div className="modal-card-foot">
          <div>
            <button
              className="unloc-button unloc-button--red-inverted"
              onClick={(_) => setRemoveUserModalOpen(true)}
            >
              Delete user
            </button>
          </div>
          <div>
            <button className="unloc-button" onClick={close}>
              Cancel
            </button>
            <button
              className="unloc-button unloc-button--light-green"
              onClick={save}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
