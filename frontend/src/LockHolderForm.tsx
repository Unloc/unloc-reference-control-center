import React, { useState } from "react";

interface LockHolderFormProps {
  onSubmit: Function;
}

const LockHolderForm = (props: LockHolderFormProps) => {
  const [name, setName] = useState("");
  const [countryIso, setCountryIso] = useState("");
  const [organizationId, setOrganizationId] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onSubmit({ name, countryIso, organizationId });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="modal-card-head">
        <p className="modal-card-title">Add Lock Holder</p>
      </div>
      <div className="modal-card-body">
        <input
          className="input"
          placeholder="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Country Iso"
          type="text"
          value={countryIso}
          onChange={(e) => setCountryIso(e.target.value)}
        />
        <input
          className="input"
          placeholder="Organization Id"
          type="text"
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
        />
      </div>
      <div className="modal-card-foot">
        <button className="button" type="submit">
          +
        </button>
      </div>
    </form>
  );
};

export default LockHolderForm;
