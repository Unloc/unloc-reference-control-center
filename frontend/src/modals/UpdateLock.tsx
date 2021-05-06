import React, { useState, useRef } from "react";
import * as unloc from "@unloc/integrator-client-library";
import Key from "../Key";
import Share from "../Share";
import AddressModal from "./Address";
/* import {useGlobal} from "../AppContext" */

const UpdateLockModal = (props: any) => {
  const {
    open,
    setOpen,
    lock,
    lockHolder,
    updateLock,
    runActions,
    createKey,
    revokeKey,
    addRole,
    removeRole,
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
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [open]);

  React.useEffect(() => {
    if(lock) {
      setName(lock.name)
      setImage(lock.imageUrl)
      setAddress(lock.address || "")
    }
  }, [lock]);

  const submit = (ev: any) => {
    ev.preventDefault();
    update();
  };


  const update = async () => {
    if (image !== lock.imageUrl) {
      try {
        updateLock(lock.id, name, image, address)
      } catch (err) {
        setImageErrorMessage(
          err.errorDescription + ". Check that the file is an image."
        );
        return;
      }
    } else {
      updateLock(lock.id, name, undefined, address)
    }
  };

  const onImageChange = (ev: any) => {
    const file = ev.target.files[0];

    if (file) {
      if (file.size > 3000000) {
        setImageErrorMessage("Image is too large.");
      }
      const reader = new FileReader();

      reader.onload = async () => {
        if (reader.result) {
          setImage(reader.result.toString());
          try {
            updateLock(lockHolder, lock.id, name, reader.result.toString());
          } catch (err) {
            setImageErrorMessage(
              err.errorDescription + ". Check that the file is an image."
            );
            return;
          }
          await runActions();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const createKeysForAllUsers = async (notifyOfRoles?: string) => {
    for(let user of users) {
      if (!keys.find((key: unloc.Key) => key.toUser.id === user.userId)) {
        createKey(
          lock.id,
          user.userId,
          null,
          null,
          false
        );
      }
    }
    close();
  };

  const createKeysAndRolesForAllUsers = async () => {
    createKeysForAllUsers(" with sharing rights.");
    for(let user of users) {
      if (!roles.find((role: unloc.Role) => role.userId === user.userId)) {
        addRole(lock.id, user.userId, true)
      }
    }
    close();
  };

  const revokeAccesses = async () => {
    (keys.map((key: unloc.Key) => revokeKey(lock.id, key.id, key.toUser.id)));
    (roles.map((role: unloc.Role) => 
       removeRole(lock.id, role.userId)
    ));
    close();
    notify(
      "All accesses to " + lock.name + " have been removed from all users."
    );
  };

  return (
    <div className={`modal${open ? " is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <h3 className="is-size-3">Edit {lock && lock.name}</h3>
        </div>
        <div className="modal-card-body">
          <AddressModal setOpen={setAddressModalOpen} open={addressModalOpen} lock={lock} lockHolder={lockHolder} runActions={runActions} />
          <div className="unloc-modal-form">
            <h3>Lock name</h3>
            <form onSubmit={submit}>
              <TextInput
                reference={inputRef}
                placeholder="Name"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
              />
              <button className="unloc-button" type="submit"> Save name </button>
            </form>
              <h3>Address</h3>
              <div>
                {address && (
                  <div>
                    {address.street} {address.postalCode} {address.city}
                  </div>
                )}
              </div>
              <button className="unloc-button" onClick={(_ => setAddressModalOpen(true))}> {address != undefined ? "Edit address" : "Add address"} </button>
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
