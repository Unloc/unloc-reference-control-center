import React from "react";

const modalStyle = {
  maxWidth: "1000px",
  width: "100%",
  maxHeight: "50%",
};

const LockHolderPopup = (props: any) => {
  console.log("LockHolderPopup props ", props);

  const { open, close } = props;
  const { name, countryIso, organizationId } = props.lockHolder;

  return (
    <div className={`modal ${open ? "is-active" : ""}`}>
      <div onClick={close} className="modal-background"></div>
      <div style={modalStyle} className="modal-card">
        <div className="modal-card-head">
          <h3>{name}</h3>
        </div>
        <div className="modal-card-body">
          <div>
            Country: <span>{countryIso}</span>
          </div>
          <div>
            Org Id: <span>{organizationId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockHolderPopup;
