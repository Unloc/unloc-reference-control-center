import React from "react";
import tailSpin from "./assets/svg-loaders/tail-spin.svg";

const Loader = () => {
  return (
    <span className="unloc-loader">
      <img src={tailSpin} alt="Spinning circles" />
    </span>
  );
};

export default Loader;
