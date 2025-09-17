import React from "react";
import styles from "./Divider.module.sass";

const Divider = ({ px = 1, type = "horizontal", className = "", style = {} }) => {
  const dividerStyle =
    type === "vertical"
      ? { width: `${px}px`, height: "100%" }
      : { height: `${px}px`, width: "100%" };

  return (
    <div
      className={`${styles.divider} ${styles[type]} ${className}`}
      style={{ ...dividerStyle, ...style }}
    />
  );
};

export default Divider;
