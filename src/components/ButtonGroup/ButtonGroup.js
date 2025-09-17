import React, { useState, Fragment, useEffect } from "react";
import Divider from "../Divider/DIvider";
import styles from "./ButtonGroup.module.sass";

const ButtonGroup = ({ items = [], onSelect, className = "", buttonClassName = "", selectedItem = ""}) => {
  const [selected, setSelected] = useState(null);

  const handleClick = (item) => {
    setSelected(item);
    if (onSelect) onSelect(item);
  };

  useEffect(() => {
    if(selectedItem) setSelected(selectedItem);
  }, []);

  return (
    <div className={`${styles.buttonGroup} ${className}`} role="group" >
      {items.map((item, idx) => (
        <Fragment key={idx}>
          <button
            type="button"
            className={`${styles.button} ${selected === item ? styles.active : ""} ${buttonClassName}`}
            onClick={() => handleClick(item)}
          >
            {item}
          </button>
          {idx < items.length - 1 && (
            <div className={{flex: 1}}>
              <Divider type="vertical" px={1} className={styles.divider} />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default ButtonGroup;
