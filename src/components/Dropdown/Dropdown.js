import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import DropdownPortal from '../../DropdownPortal';

const Dropdown = ({ anchorRef, isOpen, onClose, children, maxHeight = 350 }) => {
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState('bottom');
  const [readyToShow, setReadyToShow] = useState(false);

  // Calculate position before paint to avoid flicker
  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current || !dropdownRef.current) return;

    const inputRect = anchorRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;

    const spaceBelow = window.innerHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    setPosition(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight ? 'top' : 'bottom');
    setReadyToShow(true);
  }, [isOpen, children]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  const anchorRect = anchorRef.current.getBoundingClientRect();

  return (
    <DropdownPortal>
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: position === 'bottom'
            ? anchorRect.bottom + 6
            : anchorRect.top - (dropdownRef.current?.offsetHeight ?? maxHeight) - 6,
          left: anchorRect.left + window.scrollX,
          zIndex: 2000,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 8,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          maxHeight: maxHeight,
          overflowY: 'auto',
          opacity: readyToShow ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        {children}
      </div>
    </DropdownPortal>
  );
};

export default Dropdown;
