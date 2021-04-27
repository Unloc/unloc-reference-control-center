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
    userId,
    userDisplayName,
    keys,
    roles,
    selectedLockHolder,
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
        await api.createKey(
          selectedLockHolder,
          lock.id,
          userId,
          null,
          null,
          false
        );
      }
    });
    close();
    if (notifyOfSharing) {
      notify(
        userDisplayName +
          " has been given access to all doors" +
          notifyOfSharing
      );
    } else {
      notify(userDisplayName + " has been given access to all doors");
    }
    await runActions();
  };

  const createKeysAndRolesForAllLocks = async () => {
    createKeysForAllLocks(" with sharing");
    locks.forEach(async (lock: unloc.Lock) => {
      if (!roles.find((role: unloc.Role) => role.lockId === lock.id)) {
        await api.createOrUpdateRole(selectedLockHolder, lock.id, userId, true);
      }
    });
    close();
    await runActions();
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
          userId={userId}
          userDisplayName={userDisplayName}
          runActions={runActions}
          closeUserModal={close}
          notify={notify}
        />
        <div className="modal-card-head">
          <h3 className="is-size-3">Edit user</h3>
        </div>
        <div className="modal-card-body">
          {userDisplayName && (
            <>
              <h3>Name</h3>
              {userDisplayName}
            </>
          )}
          <h3>Phone number</h3>
          <span className="unloc-edit-user__phone-number">{userId}</span>
          <div className="unloc-edit-user__helper-text">
            If you want to change this users phone number you have to first
            remove them, and then add them with the new number.
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
