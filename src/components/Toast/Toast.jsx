import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import styles from "./Toast.module.sass"

function Toast({ type = "success", message, isLoading = false, onClose }) {
  const [loading, setLoading] = useState(isLoading)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!loading) {
      setDone(true)
      const timer = setTimeout(() => onClose?.(), 1500)
      return () => clearTimeout(timer)
    }
  }, [loading, onClose])

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading])

  let iconElement
  if (loading) {
    iconElement = (
      <span
        className={`${styles.icon} ${styles.loader}`}
        style={{ borderTopColor: "#2c2f2dff" }}
      ></span>
    )
  } else {
    iconElement =
      type === "success" ? (
        <div className={styles["tick-circle"]}>
          <div className={styles.tick}></div>
        </div>
      ) : (
        <div className={styles["alert-circle"]}>!</div>
      )
  }

  return (
    <div className={`${styles.toast} ${done ? styles[type] : ""}`}>
      {iconElement}
      <span className={styles.message}>{message}</span>
      <button className={styles.closeBtn} onClick={onClose}>
        ×
      </button>
    </div>
  )
}

// --- Toast Portal Setup ---
let toastRoot = document.getElementById("toast-root")
if (!toastRoot) {
  toastRoot = document.createElement("div")
  toastRoot.id = "toast-root"
  Object.assign(toastRoot.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  })
  document.body.appendChild(toastRoot)
}

// ✅ Create root only once
const root = createRoot(toastRoot)

export function showToast(message, type = "success", isLoading = true) {
  const handleClose = () => {
    root.render(null) // just clear instead of unmounting root
  }

  const render = (msg, toastType, loading) => {
    root.render(
      <Toast
        type={toastType}
        message={msg}
        isLoading={loading}
        onClose={handleClose}
      />
    )
  }

  render(message, type, isLoading)

  return {
    update: (loading, newMessage, newType) => {
      render(newMessage || message, newType || type, loading)
    },
    close: handleClose,
  }
}
