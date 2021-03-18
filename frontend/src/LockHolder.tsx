import React from "react";

const LockHolder = (props: any) => {
  const { name, countryIso, organizationId } = props;
  return (
    <div className="card lockHolder">
      <div className="card-content">
        <h3>{name}</h3>
        <div>
          Country: <span>{countryIso}</span>
        </div>
        <div>
          Org Id: <span>{organizationId}</span>
        </div>
      </div>
    </div>
  );
};

export default LockHolder;
