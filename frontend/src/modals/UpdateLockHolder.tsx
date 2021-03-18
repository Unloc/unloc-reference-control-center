import React, { useState, useRef } from "react";

const UpdateLockHolderModal = (props: any) => {
  const { open, setOpen, lockHolder, updateLockHolderName } = props;
  const close = () => {
    setOpen(false);
  };
  const [name, setName] = useState(lockHolder.name);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [open]);

  React.useEffect(() => {
    if (lockHolder) {
      setName(lockHolder.name);
    }
  }, [lockHolder]);

  const submit = (ev: any) => {
    ev.preventDefault();
    updateLockHolderName(name);
    close();
  };

  return (
    <div className={`modal${open ? " is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <h3 className="is-size-3">Update {lockHolder.name}</h3>
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
              <button className="button" type="submit">
                Update
              </button>
            </form>
          </div>
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

export default UpdateLockHolderModal;
