import React, { useState } from "react";
import api from "../api";

const CreateLockHolderModal = (props: any) => {
  const { open, setOpen } = props;
  const close = () => {
    setOpen(false);
    setName("");
    setCountryIso("");
    setOrganizationId("");
    setOrganizationIdSuffix("");
    setCreateVendorAccount(false);
    setVendor("");
    setEmail("");
    setPassword("");
  };
  const [name, setName] = useState("");
  const [countryIso, setCountryIso] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizationIdSuffix, setOrganizationIdSuffix] = useState("");
  const [createVendorAccount, setCreateVendorAccount] = useState(false);
  const [vendor, setVendor] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (ev: any) => {
    ev.preventDefault();
    const lockHolder: any = {
      name,
      countryIso,
      organizationId,
    };
    if (organizationIdSuffix.length > 0) {
      lockHolder["organizationIdSuffix"] = organizationIdSuffix;
    }
    const data: any = {
      lockHolder,
    };
    if (createVendorAccount) {
      data["createVendorAccount"] = true;
      data["vendor"] = vendor;
      data["email"] = email;
      data["password"] = password;
    }
    close();
    try {
      await api.createLockHolder(data);
    } catch (err) {
      alert(
        `Could not create lock holder ${err.error} ${err.errorDescription}`
      );
    }
  };
  return (
    <div className={`modal${open ? " is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <h3 className="is-size-3">Create Lock Holder</h3>
        </div>
        <div className="modal-card-body">
          <div className="unloc-modal-form">
            <form onSubmit={handleSubmit}>
              <TextInput
                placeholder="Name"
                value={name}
                required
                onChange={(e: any) => setName(e.target.value)}
              />
              <TextInput
                placeholder="Country ISO"
                value={countryIso}
                required
                onChange={(e: any) => setCountryIso(e.target.value)}
              />
              <TextInput
                placeholder="Organization ID"
                value={organizationId}
                required
                onChange={(e: any) => setOrganizationId(e.target.value)}
              />
              <TextInput
                placeholder="Organization ID Suffix"
                value={organizationIdSuffix}
                onChange={(e: any) => setOrganizationIdSuffix(e.target.value)}
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={createVendorAccount}
                  onChange={(e: any) =>
                    setCreateVendorAccount(!createVendorAccount)
                  }
                />
                Create vendor account?
              </label>
              {createVendorAccount ? (
                <>
                  <TextInput
                    placeholder="Vendor"
                    value={vendor}
                    required
                    onChange={(e: any) => setVendor(e.target.value)}
                  />
                  <TextInput
                    placeholder="Email"
                    type="email"
                    value={email}
                    required
                    onChange={(e: any) => setEmail(e.target.value)}
                  />
                  <TextInput
                    placeholder="Password"
                    type="password"
                    value={password}
                    required
                    onChange={(e: any) => setPassword(e.target.value)}
                  />
                </>
              ) : (
                ""
              )}
              <button className="button" type="submit">
                +
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
        <input className="input is-medium" type="text" {...props} />
      </div>
    </div>
  );
};

export default CreateLockHolderModal;
