import React, { useEffect, useState } from "react";
import SidebarPortal from "./../../SidebarPortal";
import styles from "./Sidebar.module.sass";

const Sidebar = ({ isOpen, onClose, width = 300, side = "right", children }) => {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300); // match CSS transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!mounted) return null;

  return (
    <SidebarPortal>
      <div
        className={styles.overlay}
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
        onClick={onClose}
      />
      <div
        className={styles.sidebar}
        style={{
          width,
          [side]: 0, // dynamically set left or right
          transform: visible ? "translateX(0)" : side === "right" ? "translateX(100%)" : "translateX(-100%)",
        }}
      >
        {children}
      </div>
    </SidebarPortal>
  );
};

export default Sidebar;
