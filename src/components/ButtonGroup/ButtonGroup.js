import React, { useState, Fragment, useEffect, useRef } from "react";
import Divider from "../Divider/Divider";
import Dropdown from "../Dropdown/Dropdown";
import styles from "./ButtonGroup.module.sass";

const ButtonGroup = ({
  items = [],
  onSelect,
  className = "",
  buttonClassName = "",
  selectedItem = "",
  changeResolution = false, // if true, show as collapsed dropdown
}) => {
  const [selected, setSelected] = useState(items[0] || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef(null);

  const handleButtonClick = () => {
    if (changeResolution) {
      setDropdownOpen((prev) => !prev);
    }
  };

  const handleSelect = (item) => {
    setSelected(item);
    onSelect?.(item);
    setDropdownOpen(false);
  };

  useEffect(() => {
    if (selectedItem) setSelected(selectedItem);
  }, [selectedItem]);

  // If changeResolution is true, show a single button + dropdown
  if (changeResolution) {
    return (
      <div className={`${styles.buttonGroup} ${className}`} role="group">
        <button
          ref={buttonRef}
          type="button"
          className={`${styles.button} ${buttonClassName}`}
          onClick={handleButtonClick}
        >
          {selected}
        </button>
        <Dropdown
          anchorRef={buttonRef}
          isOpen={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "0.5rem 1rem",
                cursor: "pointer",
                background: selected === item ? "#eee" : "#fff",
              }}
              onClick={() => handleSelect(item)}
            >
              {item}
            </div>
          ))}
        </Dropdown>
      </div>
    );
  }

  // Normal ButtonGroup if changeResolution is false
  return (
    <div className={`${styles.buttonGroup} ${className}`} role="group">
      {items.map((item, idx) => (
        <Fragment key={idx}>
          <button
            type="button"
            className={`${styles.button} ${selected === item ? styles.active : ""} ${buttonClassName}`}
            onClick={() => handleSelect(item)}
          >
            {item}
          </button>
          {idx < items.length - 1 && (
            <div style={{ flex: 1 }}>
              <Divider type="vertical" px={1} className={styles.divider} />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default ButtonGroup;
