// src/components/SidebarPortal.jsx
import { createPortal } from "react-dom";
import React from "react";

const SidebarPortal = ({ children }) => {
  const portalRoot = document.getElementById("sidebar-root") || document.body;
  return createPortal(children, portalRoot);
};

export default SidebarPortal;
