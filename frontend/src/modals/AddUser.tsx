import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Key from "../Key";
import Share from "../Share";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import api from "../api";
import * as unloc from "@unloc/integrator-client-library";

const AddUserModal = (props: any) => {
  const {
    open,
    setOpen,
    selectedLockHolder,
    locks,
    runActions,
    notify,
  } = props;
  const close = () => {
    setOpen(false);
  };
  const user: any = { userId: "", errorInUserForm: false };
  const [usersState, setUsersState] = useState([{ ...user }]);
  const [selectedRoles, setRoles] = useState<unloc.Lock[]>([]);
  const [selectedKeys, setKeys] = useState<unloc.Lock[]>([]);

  const submit = (ev: any) => {
    ev.preventDefault();
  };

  const handleUserChange = (e: any) => {
    const updatedUsers = [...usersState];
    updatedUsers[e.target.dataset.idx][e.target.name] = e.target.value;
    setUsersState(updatedUsers);
    if (
      isValidPhoneNumber(usersState[usersState.length - 1].userId)
    ) {
      addUserFields();
    }
  };

  const handleIdChange = (idx: number, value: string) => {
    const updatedUsers = [...usersState];
    updatedUsers[idx].userId = value;
    setUsersState(updatedUsers);
    if (
      isValidPhoneNumber(usersState[usersState.length - 1].userId)
    ) {
      addUserFields();
    }
  };

  const showErrorIfInvalidPhone = (idx: number) => {
    setUsersState(
      usersState.map((user, index) =>
        index === idx ? { ...user, errorInUserForm: true } : user
      )
    );
  };

  const addUserFields = () => {
    setUsersState([...usersState, { ...user }]);
  };

  const handleKeyClick = (selectedLock: unloc.Lock) => {
    const selected = selectedKeys.find(
      (lock: unloc.Lock) => lock.id === selectedLock.id
    );
    if (selected) {
      setKeys((selectedKeys) =>
      selectedKeys.filter((lock: unloc.Lock) => lock !== selected)
      );
    } else {
      setKeys((selectedKeys) => [...selectedKeys, selectedLock]);
    }
  };

  const toggleCanShare = (selectedLock: unloc.Lock) => {
    const selectedRole = selectedRoles.find(
      (lock: unloc.Lock) => lock === selectedLock
    );
    if (selectedRole) {
      setRoles((selectedRoles) =>
        selectedRoles.filter((lock: unloc.Lock) => lock !== selectedRole)
      );
    } else {
      setRoles((selectedRoles) => [...selectedRoles, selectedLock]);
      const activeKey = selectedKeys.find(
        (l: unloc.Lock) => l === selectedLock
      );
      if (!activeKey) {
        setKeys((selectedKeys) => [...selectedKeys, selectedLock]);
      }
    }
  };

  const selectAll = () => {
    setKeys(locks)
    setRoles(locks)
  }

  const selectAllKeys = () => {
    setKeys(locks)
  }

  const addUsers = async () => {
    usersState.forEach((user) => {
      if (isValidPhoneNumber(user.userId)) {
        selectedKeys.forEach(async (lock: unloc.Lock) => {
          await api.createKey(
            selectedLockHolder,
            lock.id,
            user.userId,
            null,
            null,
            true
          );
        });

        selectedRoles.forEach(async (lock: unloc.Lock) => {
          await api.createOrUpdateRole(
            selectedLockHolder,
            lock.id,
            user.userId,
            true,
            ""
          );
        });
      }
    });
    close();
    notify(usersState.length - 1 + " user(s) was added");
    await runActions();
  };

  return (
    <div className={`modal${open ? " is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card add-user">
        <div className="modal-card-body">
          <div className="add-user">
            <form className="add-user__form" onSubmit={submit}>
              <h3>Add new users</h3>
              {usersState.map((val: any, idx: number) => (
                <UserInputs
                  key={idx}
                  idx={idx}
                  usersState={usersState}
                  handleUserChange={handleUserChange}
                  handleIdChange={handleIdChange}
                  showErrorIfInvalidPhone={showErrorIfInvalidPhone}
                />
              ))}
              {usersState.length < 3 && (
                <DisabledInputs handleIdChange={handleIdChange} />
              )}
            </form>
            <div className="add-user__lock-grid">
              <h3>Access settings for users added</h3>
              <div style={ { display:"flex", marginTop:"15px", marginBottom:"15px"} }>
                <div style={{marginTop:"auto", marginBottom:"auto"}}>Select all: </div>
                <button className="unloc-button" onClick={selectAllKeys}>Access</button>
                <button className="unloc-button" onClick={selectAll}>Access with sharing</button>
              </div>
              {locks.map((lock: any, i: number) => (
                <Lock
                  key={i}
                  lock={lock}
                  selectedRoles={selectedRoles}
                  selectedKeys={selectedKeys}
                  handleKeyClick={handleKeyClick}
                  toggleCanShare={toggleCanShare}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-card-foot">
          <button className="unloc-button" onClick={close}>
            Cancel
          </button>
          <button
            className="unloc-button unloc-button--dark-green"
            onClick={addUsers}
            disabled={usersState.length < 2 || (selectedKeys.length < 1 && selectedRoles.length < 1)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const UserInputs = (props: any) => {
  const {
    idx,
    usersState,
    handleIdChange,
    showErrorIfInvalidPhone,
  } = props;
  return (
    <div className="add-user__user-input" key={idx}>
      <label>Phone number* </label>
      <div className="add-user__input-field">
        <PhoneInput
          className="add-user__input"
          international
          defaultCountry="NO"
          value={usersState[idx].userId}
          onChange={(value) => handleIdChange(idx, value)}
          onBlur={(e) => showErrorIfInvalidPhone(idx)}
        />
        {isValidPhoneNumber(usersState[idx].userId) && (
          <FontAwesomeIcon icon={faCheck} />
        )}
      </div>
      {usersState[idx].errorInUserForm ? (
        isValidPhoneNumber(usersState[idx].userId) ? undefined : (
          <div className="add-user__error-message">Invalid phone number</div>
        )
      ) : undefined}
    </div>
  );
};

const DisabledInputs = (props: any) => {
  return (
    <div className="add-user__user-input add-user__user-input--disabled">
      <label>Phone number* </label>
      <TextInput className="add-user__input" disabled={true} />
    </div>
  );
};

const TextInput = (props: any) => {
  return (
    <div className="field">
      <div className="control">
        <input
          ref={props.reference}
          className="add-user__input"
          type="text"
          {...props}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

const Lock = (props: any) => {
  const {
    lock,
    selectedRoles,
    selectedKeys,
    handleKeyClick,
    toggleCanShare,
  } = props;
  const canShare = selectedRoles.find((s: unloc.Lock) => s === lock);
  const activeKey = selectedKeys.find((l: unloc.Lock) => l === lock);
  return (
    <div className="add-user__lock-column">
      <div className="add-user__lock-heading">{lock.name}</div>
      <div className="unloc-vertical-line"></div>
      <button
        className={`unloc-dashboard__key${
          activeKey ? " unloc-dashboard__key--active" : ""
        }`}
        onClick={() => handleKeyClick(lock)}
      >
        <Key light={activeKey} />
      </button>
      <div className="unloc-vertical-line"></div>
      <button
        className={`unloc-dashboard__canShare${
          canShare ? " unloc-dashboard__canShare--active" : ""
        }`}
        onClick={() => toggleCanShare(lock)}
      >
        <Share light={canShare} />
      </button>
    </div>
  );
};

export default AddUserModal;
