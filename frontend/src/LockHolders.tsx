import React, { useState } from "react";
import LockHolderForm from "./LockHolderForm";
import LockHolder from "./LockHolder";

const LockHolders = (props: any) => {
  const {
    lockHolders,
    getLockHolders,
    addLockHolder,
    selectLockHolder,
  } = props;
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div>
      <button className="button" onClick={getLockHolders}>
        Get Lock Holders
      </button>
      <button className="button" onClick={() => setAddModalOpen(!addModalOpen)}>
        +
      </button>
      <div className={addModalOpen ? "modal is-active" : "modal"}>
        <div
          onClick={() => setAddModalOpen(false)}
          className="modal-background"
        ></div>
        <div className="modal-card">
          <LockHolderForm onSubmit={addLockHolder} />
        </div>
        <button
          className="modal-close is-large"
          onClick={() => setAddModalOpen(false)}
          aria-label="close"
        ></button>
      </div>
      <div className="columns is-multiline">
        {lockHolders.map((e: any) => (
          <div
            className="column is-one-third"
            key={e.name}
            onClick={() => selectLockHolder(e)}
          >
            <LockHolder {...e} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LockHolders;
