import React, { useState } from "react";

const Locks = (props: any) => {
  const { locks, getLocks, lockHolders, setSelectedLockHolder } = props;
  const [lockHolderIndex, setLockHolderIndex] = useState(0);

  const selectLockHolder = (e: any) => {
    setLockHolderIndex(e.target.value);
    console.log("{FRONTEND}[selectLockHolder] ", lockHolders[e.target.value]);
    setSelectedLockHolder(lockHolders[e.target.value]);
  };

  return (
    <div>
      <button className="button" onClick={getLocks}>
        Get Locks
      </button>
      <select value={lockHolderIndex} onChange={selectLockHolder}>
        {lockHolders.map((l: any, index: number) => (
          <option value={index} key={l.name}>
            {l.name}
          </option>
        ))}
      </select>
      <div className="columns is-multiline">
        {locks.map((lock: any) => (
          <div className="column is-one-third">
            <Lock {...lock} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Lock = (props: any) => {
  const {
    name,
    vendor,
    imageUrl,
    canCreateKeysCount,
    keysCreatedCount,
  } = props;
  return (
    <div className="card lock">
      <div className="card-content">
        <h3>
          {name} | {vendor}
        </h3>
        {imageUrl !== "" ? <img src={imageUrl} /> : ""}
        <div>
          <h5>Can create keys count: {canCreateKeysCount}</h5>
        </div>
        <div>
          <h5>Keys created count: {keysCreatedCount}</h5>
        </div>
      </div>
    </div>
  );
};

export default Locks;
