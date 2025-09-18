import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './TextInput.module.sass';
import TimePicker from '../TimePicker/TimePicker'; // add custom time picker
import DropdownPortal from '../../DropdownPortal';

const TextInput = function TextInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  helperText,
  disabled,
  readOnly,
  name,
  fullWidth = false,
  className,
  displayValue,
  rows = 3,
  hour12 = true,
  options = [],
  multiple = false,
  searchable = true,
  noOptionsText = 'No options',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hiddenInputRef = useRef(null);

  const inputRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom"); // "bottom" or "top"


  const inputClass = [
    styles.input,
    error && styles.inputError,
    success && styles.inputSuccess,
    isFocused && styles.inputFocus,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClass = [
    styles.container,
    fullWidth && styles.fullWidth,
  ]
    .filter(Boolean)
    .join(' ');

  const [openTimePicker, setOpenTimePicker] = useState(false);

  const timeWrapperStyle = (disabled || readOnly)
    ? { opacity: 0.6, pointerEvents: 'none' }
    : undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef(null);

  const selectedValues = useMemo(() => {
    if (multiple) return Array.isArray(value) ? value : [];
    return value === undefined || value === null ? null : value;
  }, [value, multiple]);

  const selectedItems = useMemo(() => {
    if (multiple) {
      const sv = new Set(selectedValues);
      return options.filter(o => sv.has(o.value));
    }
    return options.find(o => o.value === selectedValues) || null;
  }, [options, selectedValues, multiple]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, searchable, query]);

  const toggleDropdown = () => {
    if (disabled || readOnly) return;
    setIsOpen(v => !v);
  };

  const closeDropdown = () => setIsOpen(false);

  const handleSelect = (opt) => {
    if (multiple) {
      const sv = new Set(selectedValues);
      if (sv.has(opt.value)) {
        sv.delete(opt.value);
      } else {
        sv.add(opt.value);
      }
      onChange?.(Array.from(sv));
    } else {
      onChange?.(opt.value);
      closeDropdown();
    }
  };

  const removeTag = (val) => {
    if (!multiple) return;
    const sv = (Array.isArray(selectedValues) ? selectedValues : []).filter(v => v !== val);
    onChange?.(sv);
  };

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current) return;
      if (dropdownRef.current.contains(e.target)) return;
      closeDropdown();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
  function handleClickOutside(e) {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      setOpenTimePicker(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

// close when clicking outside
useEffect(() => {
  function handleClickOutside(e) {
    if (
      inputRef.current &&
      !inputRef.current.contains(e.target) &&
      !document.getElementById("dropdown-root")?.contains(e.target)
    ) {
      setOpenDropdown(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

// close on scroll
useEffect(() => {
  // find the closest modal body (if inside a modal)
  const scrollableContainer =
    inputRef.current?.closest('.modal-body') || window;

  const handleScroll = () => setOpenDropdown(false);

  scrollableContainer.addEventListener("scroll", handleScroll);
  return () => scrollableContainer.removeEventListener("scroll", handleScroll);
}, []);

useEffect(() => {
  if (!openDropdown || !inputRef.current) return;

  const timer = setTimeout(() => {
    const dropdownEl = dropdownRef.current;
    if (!dropdownEl) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownEl.offsetHeight || 250;

    const spaceBelow = window.innerHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    setDropdownPosition(
      spaceBelow < dropdownHeight && spaceAbove > dropdownHeight ? "top" : "bottom"
    );
  }, 0);

  return () => clearTimeout(timer);
}, [openDropdown]);




  return (
    <div className={containerClass}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      {type === 'date' && displayValue ? (
        <>
          <div
            tabIndex={0}
            className={inputClass}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onClick={() => !disabled && hiddenInputRef.current?.showPicker?.()}
            style={{ textAlign: 'left' }}
          >
            {displayValue || placeholder}
          </div>

          <input
            ref={hiddenInputRef}
            type="date"
            value={value}
            onChange={onChange}
            id={id}
            name={name}
            disabled={disabled}
            readOnly={readOnly}
            style={{
              position: 'absolute',
              opacity: 0,
              right: 0,
              bottom: 0,
              height: '100%',
              width: '100%',
              pointerEvents: 'none',
            }}
            tabIndex={-1}
          />
        </>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClass}
          rows={rows}
          {...props}
          style={{ resize: 'vertical', ...props.style }}
        />
      ) : type === 'time' ? (
        <>
    <div
      ref={inputRef}
      id={id}
      role="button"
      tabIndex={0}
      className={inputClass}
      onClick={() => {setOpenDropdown((o) => !o); console.log(openDropdown)}}   // 👈 toggle dropdown
      style={{
        minHeight: 42,
        display: "flex",
        alignItems: "center",
        cursor: disabled || readOnly ? "not-allowed" : "pointer",
        opacity: disabled || readOnly ? 0.6 : 1,
      }}
    >
      <span style={{ flex: 1, textAlign: "left" }}>
        {value
          ? value.format(hour12 ? "hh:mm A" : "HH:mm")
          : placeholder || "Select time"}
      </span>
    </div>

    {openDropdown && !disabled && (
  <DropdownPortal>
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top:
          dropdownPosition === "bottom"
            ? (inputRef.current?.getBoundingClientRect().bottom ?? 0) + 6
            : (inputRef.current?.getBoundingClientRect().top ?? 0) -
              (dropdownRef.current?.offsetHeight ?? 250) -
              6,
        left:
          (inputRef.current?.getBoundingClientRect().left ?? 0) +
          window.scrollX,
        zIndex: 2000,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      }}
    >
      <TimePicker
        value={value}
        onSave={(m) => {
          onChange?.(m);
          setOpenDropdown(false);
        }}
        onCancel={() => setOpenDropdown(false)}
        hour12={hour12}
      />
    </div>
  </DropdownPortal>
)}
  </>

      ) : type === 'select' ? (
        <div ref={dropdownRef} style={{ position: 'relative' }} >
    <div
      id={id}
      role="button"
      tabIndex={0}
      className={inputClass}
      onClick={toggleDropdown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        minHeight: 42,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        cursor: disabled || readOnly ? 'not-allowed' : 'pointer',
        padding: multiple ? '0px' : '0.6rem 0.75rem'
      }}
    >
      {/* Selected items */}
      {multiple ? (
  <div
    ref={inputRef}
    // className={`${styles.input} ${isFocused ? styles.inputFocus : ''}`}
    // style={{
    //   display: 'flex',
    //   flexWrap: 'wrap',
    //   alignItems: 'center',
    //   gap: 4,
    //   minHeight: 42,
    //   cursor: disabled || readOnly ? 'not-allowed' : 'text',
    //   opacity: disabled || readOnly ? 0.6 : 1,
    //   backgroundColor: 'black'
    // }}
    // onClick={() => {
    //   if (!disabled && !readOnly) {
    //     setIsOpen(true);
    //     inputRef.current?.focus();
    //   }
    // }}
    // onFocus={() => setIsFocused(true)}
    // onBlur={() => setIsFocused(false)}
    style={{width: '100%'}}
  >
    {/* Selected tags */}
    {(selectedItems || []).map(item => (
      <span
        key={`tag-${item.value}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          borderRadius: 12,
          background: '#f0f0f0',
          fontSize: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.label}
        {!readOnly && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeTag(item.value);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ×
          </button>
        )}
      </span>
    ))}

    {/* Search input */}
    {searchable && !readOnly && !disabled && (
      <input
      // ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        placeholder={(selectedItems || []).length ? '' : placeholder}
        style={{
          border: 'none',
          outline: 'none',
          flex: 1,
          padding: 4,
          background: 'transparent',
          margin: 2,
          width: '100%'

        }}
        // onClick={(e) => e.stopPropagation()}
        onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      />
    )}
  </div>
) : (
  <span style={{ flex: 1, textAlign: 'left', color: selectedItems ? 'inherit' : '#888' }}>
    {selectedItems ? selectedItems.label : (placeholder || 'Select...')}
  </span>
)}


    </div>

    {/* Dropdown */}
    {isOpen && (
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 8,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          maxHeight: 200,
          overflowY: 'auto',
        }}
      >
        {/* Search bar for single select */}
        {!multiple && searchable && (
          <div style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid #ddd',
                outline: 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Options */}
        <div>
          {filteredOptions.length === 0 ? (
            <div style={{ padding: 12, color: '#888' }}>{noOptionsText}</div>
          ) : (
            filteredOptions.map(opt => {
              const isSelected = multiple
                ? (selectedValues || []).includes(opt.value)
                : selectedValues === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    background: isSelected ? '#f5f7ff' : 'transparent',
                    color: isSelected ? '#2f54eb' : 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ pointerEvents: 'none' }}
                      
                    />
                  )}
                  <span>{opt.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    )}
  </div>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClass}
          {...props}
        />
      )}

      {helperText && (
        <div
          className={`${styles.helperText} ${
            error ? styles.errorText : success ? styles.successText : ''
          }`}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

export default TextInput;
