import { createPortal } from "react-dom";

const dropdownRoot = document.getElementById("dropdown-root");

export default function DropdownPortal({ children }) {
  if (!dropdownRoot) return null;
  return createPortal(children, dropdownRoot);
}
