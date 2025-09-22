import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import styles from './TextInput.module.sass';
import TimePicker from '../TimePicker/TimePicker';
import Dropdown from '../Dropdown/Dropdown';
import { RxAvatar } from "react-icons/rx";
import { IoClose } from "react-icons/io5";



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
  avatar = false,
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

  const [calculatedPosition, setCalculatedPosition] = useState('bottom');
  const [readyToShow, setReadyToShow] = useState(false);


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

  if (!openDropdown && inputRef.current) {
    setReadyToShow(false); // hide until positioned
    setOpenDropdown(true);
  } else {
    setOpenDropdown(false);
  }
};



useLayoutEffect(() => {
  if (!openDropdown || !inputRef.current || !dropdownRef.current) return;

  const inputRect = inputRef.current.getBoundingClientRect();
  const dropdownHeight = dropdownRef.current.offsetHeight;

  const spaceBelow = window.innerHeight - inputRect.bottom;
  const spaceAbove = inputRect.top;

  setCalculatedPosition(
    spaceBelow < dropdownHeight && spaceAbove > dropdownHeight ? 'top' : 'bottom'
  );

  // now ready to show
  setReadyToShow(true);
}, [openDropdown, filteredOptions.length]);



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
      onClick={() => toggleDropdown()} // toggle dropdown
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

    <Dropdown
      anchorRef={inputRef}
      isOpen={openDropdown}
      onClose={() => setOpenDropdown(false)}
    >
      <TimePicker
        value={value}
        onSave={(m) => { onChange?.(m); setOpenDropdown(false); }}
        onCancel={() => setOpenDropdown(false)}
        hour12={hour12}
      />
    </Dropdown>
  </>
)
      
      : type === 'select' ? (
  <>
    <div
      ref={inputRef}
      id={id}
      role="button"
      tabIndex={0}
      className={inputClass}
      onClick={toggleDropdown}
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
      {multiple
        ? (selectedItems || []).map(item => (
            <span key={item.value} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
              background: '#f0f0f0',
              fontSize: 16,
              marginLeft: 4,

            }}>
              <RxAvatar />
              {item.label}
              {!readOnly && !disabled && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeTag(item.value); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
                ><IoClose /></button>
              )}
            </span>
          ))
        : <span style={{ flex: 1, textAlign: 'left', color: selectedItems ? 'inherit' : '#888' }}>
            {selectedItems ? selectedItems.label : (placeholder || 'Select...')}
          </span>
      }
    </div>

    <Dropdown
      anchorRef={inputRef}
      isOpen={openDropdown}
      onClose={() => setOpenDropdown(false)}
    >
      {searchable && !multiple && (
        <div style={{ padding: 8, borderBottom: '1px solid #eee' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', outline: 'none' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div>
        {filteredOptions.length === 0
          ? <div style={{ padding: 12, color: '#888' }}>{noOptionsText}</div>
          : filteredOptions.map(opt => {
              const isSelected = multiple
                ? selectedValues.includes(opt.value)
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
                  {multiple && <input type="checkbox" checked={isSelected} readOnly style={{ pointerEvents: 'none' }} />}
                  <span>{opt.label}</span>
                </div>
              );
          })}
      </div>
    </Dropdown>
  </>
)
      
      : (
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
