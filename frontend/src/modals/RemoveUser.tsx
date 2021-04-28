import React from "react";
import api from "../api";

const RemoveUserModal = (props: any) => {
  const {
    open,
    setOpen,
    selectedLockHolder,
    roles,
    keys,
    user,
    runActions,
    closeUserModal,
    notify,
  } = props;
  const close = () => {
    setOpen(false);
  };

  const deleteUser = async () => {
    keys.forEach(async (key: any) => {
      await api.updateKey(selectedLockHolder, key.lockId, key.id, "revoked");
    });

    roles.forEach(async (role: any) => {
      await api.createOrUpdateRole(
        selectedLockHolder,
        role.lockId,
        user.userId,
        false
      );
    });

    await api.deleteSharedKeys(selectedLockHolder, user.userId);

    close();
    closeUserModal();
    notify(user.userDisplayName ? user.userDisplayName : user.userId + " and all shared keys was deleted.");
    await runActions();
  };

  return (
    <div className={`modal${open ? " is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <h3 className="is-size-3">Remove user</h3>
        </div>
        <div className="modal-card-body">
          <div>
            {user.userDisplayName ? user.userDisplayName : user.userId} will no longer be able to access{" "}
            {selectedLockHolder.name}. Accesses shared by {user.userDisplayName ? user.userDisplayName : user.userId} will
            be lost.
          </div>
          <button className="button is-medium primary" onClick={close}>
            Cancel
          </button>
          <button className="button is-medium primary" onClick={deleteUser}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveUserModal;
