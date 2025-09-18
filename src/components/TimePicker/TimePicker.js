import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import styles from "./TimePicker.module.sass";
import Button from "../Button/Button";

const TimePicker = ({
  value,
  onSave,
  onCancel,
  hour12 = true,
  minuteStep = 15,
  initialMode = "picker", // "picker" | "list"
}) => {
  const initial = useMemo(() => (value ? moment(value) : moment()), [value]);

  const [selected, setSelected] = useState(initial.clone());
  const [hour, setHour] = useState(hour12 ? initial.format("hh") : initial.format("HH"));
  const [minute, setMinute] = useState(initial.format("mm"));
  const [ampm, setAmPm] = useState(initial.format("A"));
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    const i = value ? moment(value) : moment();
    setSelected(i.clone());
    setHour(hour12 ? i.format("hh") : i.format("HH"));
    setMinute(i.format("mm"));
    setAmPm(i.format("A"));
  }, [value, hour12]);

  const hours = hour12
    ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
    : Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")),
    []
  );

  const ampmOptions = ["AM", "PM"];

  const buildMoment = (hStr, mStr, ampmStr) => {
    let h = parseInt(hStr, 10);
    if (hour12) {
      if (ampmStr === "PM" && h !== 12) h += 12;
      if (ampmStr === "AM" && h === 12) h = 0;
    }
    return moment(selected).hour(h).minute(parseInt(mStr, 10)).second(0).millisecond(0);
  };

  const handlePickerChange = (newHour, newMinute, newAmPm) => {
    const next = buildMoment(newHour, newMinute, newAmPm);
    setHour(newHour);
    setMinute(newMinute);
    setAmPm(newAmPm);
    setSelected(next);
  };

  const listOptions = useMemo(() => {
    const opts = [];
    const start = moment().startOf("day");
    for (let m = 0; m < 24 * 60; m += minuteStep) {
      const t = start.clone().add(m, "minutes");
      const label = hour12 ? t.format("hh:mm A") : t.format("HH:mm");
      opts.push({ label, time: t });
    }
    return opts;
  }, [hour12, minuteStep]);

  const onListSelect = (t) => {
    setSelected(t.clone());
    setHour(hour12 ? t.format("hh") : t.format("HH"));
    setMinute(t.format("mm"));
    setAmPm(t.format("A"));
  };

  return (
    <div className={styles.timePicker} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 600 }}>{selected.format(hour12 ? "hh:mm A" : "HH:mm")}</div>
        <Button variant="ghost" onClick={() => setMode((m) => (m === "picker" ? "list" : "picker"))}>
          {mode === "picker" ? "Switch to List" : "Switch to Picker"}
        </Button>
      </div>

      {mode === "picker" ? (
        <div style={{ display: "flex", gap: 12 }}>
          <div className={styles.column}>
            {hours.map((h) => (
              <div
                key={h}
                className={`${styles.item} ${h === hour ? styles.selected : ""}`}
                onClick={() => handlePickerChange(h, minute, ampm)}
              >
                {h}
              </div>
            ))}
          </div>

          <div className={styles.column}>
            {minutes.map((m) => (
              <div
                key={m}
                className={`${styles.item} ${m === minute ? styles.selected : ""}`}
                onClick={() => handlePickerChange(hour, m, ampm)}
              >
                {m}
              </div>
            ))}
          </div>

          {hour12 && (
            <div className={styles.column}>
              {ampmOptions.map((a) => (
                <div
                  key={a}
                  className={`${styles.item} ${a === ampm ? styles.selected : ""}`}
                  onClick={() => handlePickerChange(hour, minute, a)}
                >
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            maxHeight: 240,
            overflowY: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 8,
          }}
          
        >
          {listOptions.map((opt) => {
            const isActive =
              selected.format("HH:mm") === opt.time.format("HH:mm");
            return (
              <div
                key={opt.time.format("HH:mm")}
                onClick={() => onListSelect(opt.time)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  background: isActive ? "rgba(59,130,246,0.1)" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                }}
                className={styles.slotItem}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(selected.clone())}>Save</Button>
      </div>
    </div>
  );
};

TimePicker.propTypes = {
  value: PropTypes.object,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  hour12: PropTypes.bool,
  minuteStep: PropTypes.number,
  initialMode: PropTypes.oneOf(["picker", "list"]),
};

export default TimePicker;
