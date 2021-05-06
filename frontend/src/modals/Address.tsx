import React, { useState, useRef } from "react";
import api from "../api";
import * as unloc from "@unloc/integrator-client-library";

const AddressModal = (props: any) => {
  const {open ,setOpen, lock, lockHolder, runActions} = props;
  const close = () => {setOpen(false)}
  const [street, setStreet] = useState(lock?.address?.street)
  const [postalCode, setPostalCode] = useState(lock?.address?.postalCode)
  const [city, setCity] = useState(lock?.address?.city)
  const [countryIso, setCountryIso] = useState(lock?.address?.countryIso)
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [open])

  React.useEffect(() => {
    if(lock) {
      setStreet(lock.address?.street || "")
      setPostalCode(lock.address?.postalCode || "")
      setCity(lock.address?.city || "")
      setCountryIso(lock.address?.countryIso || "")
    }
  }, [lock])

  const submit = (ev: any) => {
    ev.preventDefault()
  }

  const updateAddress = async () => {
    const address: unloc.Address = {street, postalCode, city, countryIso}
    try {
      await api.updateLock(lockHolder, lock.id, lock.name, undefined, address)
    } catch (err) {
      setErrorMessage(
        err.errorDescription
      );
      return;
    }
    close()
    await runActions()
  }

  return (
    <div className={`modal${open ? " is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <h3 className="is-size-3">Add address</h3>
        </div>
        <div className="modal-card-body">
          <form onSubmit={submit}>
            <label>Street name and number</label>
            <TextInput reference={inputRef} value={street} onChange={(e: any) => setStreet(e.target.value)} />
            <label>Postal code</label>
            <TextInput value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
            <label>City</label>
            <TextInput value={city} onChange={(e: any) => setCity(e.target.value)} />
            <label>Country iso (two letters, eg "NO") </label>
            <TextInput value={countryIso} onChange={(e: any) => setCountryIso(e.target.value)} />
          </form>
          {errorMessage && (
                  <div className="error-message">{errorMessage}</div>
                )}
        </div>
        <div className="modal-card-foot">
          <button className="button is-medium primary" onClick={close} >Cancel</button>
          <button className="button is-medium primary" onClick={updateAddress}>Save</button>
        </div>
      </div>
    </div>
  );
}

const TextInput = (props: any) => {
  return (
    <div className="field">
      <div className="control">
        <input ref={props.reference} className="input is-medium" type="text" {...props} />
      </div>
    </div>
  )
}

export default AddressModal