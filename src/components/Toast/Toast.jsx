import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./Toast.module.sass";

function Toast({ type = "success", message, duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>
        {type === "success" ? "🟢" : "🔴"}
      </span>
      <span className={styles.message}>{message}</span>
      <button className={styles.closeBtn} onClick={onClose}>
        ×
      </button>
    </div>
  );
}

// Create or reuse toast root
let toastRoot = document.getElementById("toast-root");
if (!toastRoot) {
  toastRoot = document.createElement("div");
  toastRoot.id = "toast-root";
  document.body.appendChild(toastRoot);

  // Ensure toast root is fixed to top-right
  Object.assign(toastRoot.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 9999,
  });
}

let currentToast = null;

export function showToast(type, message, duration = 3000) {
  // remove old toast if exists
  if (currentToast) {
    ReactDOM.unmountComponentAtNode(toastRoot);
    currentToast = null;
  }

  const handleClose = () => {
    ReactDOM.unmountComponentAtNode(toastRoot);
    currentToast = null;
  };

  const toastElement = (
    <Toast
      type={type}
      message={message}
      duration={duration}
      onClose={handleClose}
    />
  );

  ReactDOM.render(toastElement, toastRoot);
  currentToast = toastElement;
}
