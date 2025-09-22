import React from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.sass";
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen , onClose, title, children, modalBody, fullScreen = false, animation = 'fadeIn' }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${fullScreen ? styles.fullScreen : ""} ${styles[animation]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <IoClose />
          </button>
        </div>
        <div className={[styles.modalBody, "modal-body", modalBody].join(" ")}>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
