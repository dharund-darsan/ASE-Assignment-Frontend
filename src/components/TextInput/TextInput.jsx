import React, { useRef, useState } from 'react';
import styles from './TextInput.module.sass';

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
  displayValue, // 👈 formatted date text
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hiddenInputRef = useRef(null);

  const inputClass = [
    styles.input,
    error && styles.inputError,
    success && styles.inputSuccess,
    isFocused && styles.inputFocus, // mimic focus style
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

  return (
    <div className={containerClass}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      {type === 'date' && displayValue ? (
        <>
          {/* Fake input div */}
          <div
            tabIndex={0}
            className={inputClass}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onClick={() => hiddenInputRef.current?.showPicker?.()} // 👈 open calendar
            style={{textAlign: 'left'}}
          >
            {displayValue || placeholder}
          </div>

          {/* Hidden real input for calendar */}
          <input
            ref={hiddenInputRef}
            type="date"
            value={value}
            onChange={onChange}
            style={{ 
                position: 'absolute',
                opacity: 0,
                right: 0,         // 👈 anchor to right
                bottom: 0,        // 👈 anchor to bottom
                height: '100%',   // keep same height as fake input
                width: '100%',    // align with fake input box
                pointerEvents: 'none',
            }}
            tabIndex={-1}
          />
        </>
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
