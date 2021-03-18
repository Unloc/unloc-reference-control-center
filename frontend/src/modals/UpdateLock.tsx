import React, { useState, useRef } from "react";
import * as unloc from "@unloc/integrator-client-library";
import api from "../api";
import Key from "../Key";
import Share from "../Share";

const UpdateLockModal = (props: any) => {
  const {
    open,
    setOpen,
    lock,
    lockHolder,
    runActions,
    users,
    keys,
    roles,
    notify,
  } = props;
  const close = () => {
    setOpen(false);
    setAddress(undefined);
  };
  const [name, setName] = useState((lock && lock.name) || "");
  const [image, setImage] = useState<string | undefined>();
  const [imageErrorMessage, setImageErrorMessage] = useState("");
  const [address, setAddress] = useState<unloc.Address | undefined>(
    lock?.address
  );
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [open]);

  React.useEffect(() => {
    if (lock) {
      setName(lock.name);
      setImage(lock.imageUrl);
      setAddress(lock.address);
    }
  }, [lock]);

  const submit = (ev: any) => {
    ev.preventDefault();
  };

  const update = async () => {
    if (image !== lock.imageUrl) {
      try {
        await api.updateLock(lockHolder, lock.id, name, image);
      } catch (err) {
        setImageErrorMessage(
          err.errorDescription + ". Check that the file is an image."
        );
        return;
      }
    } else {
      await api.updateLock(lockHolder, lock.id, name, undefined, address);
    }
    close();
    notify();
    await runActions();
  };

  const onImageChange = (ev: any) => {
    const file = ev.target.files[0];

    if (file) {
      if (file.size > 3000000) {
        setImageErrorMessage("Image is too large.");
      }
      const reader = new FileReader();

      reader.onload = function () {
        if (reader.result) {
          setImage(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const createKeysForAllUsers = async (notifyOfRoles?: string) => {
    users.forEach(async (user: unloc.User) => {
      if (!keys.find((key: unloc.Key) => key.toUser.id === user.userId)) {
        await api.createKey(
          lockHolder,
          lock.id,
          user.userId,
          null,
          null,
          false
        );
      }
    });
    close();
    if (notifyOfRoles) {
      notify(
        "All users have been given access to " + lock.name + notifyOfRoles
      );
    } else {
      notify("All users have been given access to " + lock.name);
    }
    await runActions();
  };

  const createKeysAndRolesForAllUsers = async () => {
    createKeysForAllUsers(" with sharing rights.");
    users.forEach(async (user: unloc.User) => {
      if (!roles.find((role: unloc.Role) => role.userId === user.userId)) {
        await api.createOrUpdateRole(lockHolder, lock.id, user.userId, true);
      }
    });
    close();
    await runActions();
  };

  const revokeAccesses = async () => {
    keys.forEach(async (key: unloc.Key) => {
      await api.deleteSharedKeysForLock(lockHolder, lock.id, key.toUser.id);
      await api.updateKey(lockHolder, lock.id, key.id, "revoked");
    });

    roles.forEach(async (role: unloc.Role) => {
      await api.deleteSharedKeysForLock(lockHolder, lock.id, role.userId);
      await api.createOrUpdateRole(lockHolder, lock.id, role.userId, false);
    });
    close();
    notify(
      "All accesses to " + lock.name + " have been removed from all users."
    );
    await runActions();
  };

  return (
    <div className={`modal${open ? " is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <h3 className="is-size-3">Edit {lock && lock.name}</h3>
        </div>
        <div className="modal-card-body">
          <div className="unloc-modal-form">
            <form onSubmit={submit}>
              <TextInput
                reference={inputRef}
                placeholder="Name"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
              />
              <h3>Address</h3>
              <div>
                {address && (
                  <div>
                    {address.street} {address.postalCode} {address.city}
                  </div>
                )}
              </div>
              <button className="unloc-button">
                {" "}
                {address !== undefined ? "Edit address" : "Add address"}{" "}
              </button>
              <h3>Image</h3>
              <div>
                {image && <img alt="Lock" src={image} />}
                <button className="unloc-button">
                  <label>
                    {image ? "Edit image" : "Add image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImageChange}
                    />
                  </label>
                </button>
                {imageErrorMessage && (
                  <div className="error-message">{imageErrorMessage}</div>
                )}
              </div>
            </form>
            <h3>All users</h3>
            <div style={{ display: "flex" }}>
              <button
                className="unloc-button unloc-button--dark-green"
                onClick={(_) => createKeysForAllUsers()}
              >
                <Key light />
                Give access
              </button>
              <button
                className="unloc-button unloc-button--light-green"
                onClick={createKeysAndRolesForAllUsers}
              >
                <Share />
                Access with sharing
              </button>
            </div>
            <button
              className="unloc-button unloc-button--red"
              onClick={revokeAccesses}
            >
              Remove access
            </button>
          </div>
        </div>
        <div className="modal-card-foot">
          <button className="unloc-button unloc-button--big" onClick={close}>
            Cancel
          </button>
          <button className="unloc-button unloc-button--big unloc-button--light-green" onClick={update}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const TextInput = (props: any) => {
  return (
    <div className="field">
      <div className="control">
        <input
          ref={props.reference}
          className="input is-medium"
          type="text"
          {...props}
        />
      </div>
    </div>
  );
};

export default UpdateLockModal;
