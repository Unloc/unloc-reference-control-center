import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faMinusSquare } from "@fortawesome/free-solid-svg-icons";

const KeyModal = (props: any) => {
  const { open, setOpen, userId, lock, keys, revokeKey, createKey } = props;
  const close = () => {
    setOpen(false);
  };
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log(
      "Making key with data: ",
      new Date(startDate),
      new Date(endDate),
      userId,
      lock.id
    );
    createKey(
      lock.id,
      userId,
      new Date(startDate).toISOString(),
      new Date(endDate).toISOString()
    );
  };

  return (
    <div className={`modal${open ? " is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <h3 className="is-size-4">
            Keys for user {userId} on lock {lock.name}
          </h3>
        </div>
        <div className="modal-card-body">
          <form className="unloc-key__new-key" onSubmit={handleSubmit}>
            <h4 className="is-size-5">New Key</h4>
            <div>
              <div className="field">
                <label className="label">Start</label>
                <div className="control">
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">End</label>
                <div className="control">
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="button">
              Add
            </button>
          </form>
          <div>
            {keys.map((e: any) => (
              <Key
                revokeKey={revokeKey}
                key={e.id}
                lockId={lock.id}
                userId={userId}
                {...e}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Key = (props: any) => {
  const { lockId, id, revokeKey } = props;
  const created = new Date(props.created);
  const start = new Date(props.start);
  const end = new Date(props.end);
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const timeOptions = { hour: "2-digit", minute: "2-digit" };
  const handleClick = () => {
    revokeKey(lockId, id, "revoked");
  };
  return (
    <div className="unloc-key">
      <div className="unloc-key__outercolumns columns">
        <div className="column">
          <FontAwesomeIcon icon={faKey} />
        </div>
        <div className="column is-two-thirds">
          <div className="unloc-key__datecolumns columns">
            <div className="column is-narrow">
              <div>
                <b>Created:</b>
              </div>
              <div>
                <b>Start:</b>
              </div>
              {props.end ? (
                <div>
                  <b>End:</b>{" "}
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="column">
              <div>
                {created.toLocaleDateString(undefined, dateOptions)}{" "}
                {created.toLocaleTimeString([], timeOptions)}
              </div>
              <div>
                {start.toLocaleDateString(undefined, dateOptions)}{" "}
                {start.toLocaleTimeString([], timeOptions)}
              </div>
              {props.end ? (
                <div>
                  {end.toLocaleDateString(undefined, dateOptions)}{" "}
                  {end.toLocaleTimeString([], timeOptions)}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        <div className="column">
          <div className="unloc-key__state">
            {props.state}
            {props.state !== "revoked" ? (
              <button className="button" onClick={handleClick}>
                <FontAwesomeIcon icon={faMinusSquare} />
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyModal;
