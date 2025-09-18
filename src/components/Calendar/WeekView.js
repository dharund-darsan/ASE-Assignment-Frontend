import React, { useMemo, useState, useEffect } from "react";
import moment from "moment";

// Single Appointment block
function AppointmentBlock({ appt, dayDate, hourHeight, onClick }) {
  const start = moment(appt.startTime);
  const end = moment(appt.endTime);

  const dayStart = dayDate.clone().startOf("day");
  const dayEnd = dayDate.clone().endOf("day");

  const visibleStart = moment.max(start, dayStart);
  const visibleEnd = moment.min(end, dayEnd);

  const startMinutes = visibleStart.diff(dayStart, "minutes");
  const durationMinutes = Math.max(15, visibleEnd.diff(visibleStart, "minutes"));

  const top = (startMinutes / 60) * hourHeight;
  const height = (durationMinutes / 60) * hourHeight;

  // Dynamic sizing
  let titleFont = 10;
  let timeFont = 12;
  let padding = "4px";

  if (height < 24) {
    titleFont = 10;
    timeFont = 9;
    padding = "2px 4px";
  } else if (height < 40) {
    titleFont = 12;
    timeFont = 10;
    padding = "4px";
  }

  return (
    <div
      onClick={() => onClick && onClick(appt)}
      style={{
        position: "absolute",
        top,
        left: 4,
        right: 4,
        height,
        borderRadius: 6,
        background: "#F0FDF4",
        borderLeft: `4px solid ${appt.statusColor || "#3b82f6"}`,
        padding,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        overflow: "hidden",
        display: "flex",
        alignItems: height > 24 ? "start" : "center",
        flexDirection: height > 24 ? "column" : "row",
        gap: height > 24 ? "" : 6,
        cursor: "pointer",
        justifyContent: 'end'
      }}
      title={`${appt.title} | ${visibleStart.format("h:mm A")} - ${visibleEnd.format("h:mm A")}`}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: titleFont,
          color: "#111827",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {appt.title}
      </div>
      <div style={{ fontSize: timeFont, color: "#6b7280", whiteSpace: "nowrap" }}>
        {visibleStart.format("h:mm A")} - {visibleEnd.format("h:mm A")}
      </div>
    </div>
  );
}

// Main Week View
export default function WeekView({
  weekDate,
  appointments = [],
  hourHeight = 48,
  labelColWidth = 64,
  onAppointmentClick,
}) {
  const [now, setNow] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 60000);
    return () => clearInterval(timer);
  }, []);

  const weekStart = useMemo(() => weekDate.clone().startOf("week"), [weekDate]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => weekStart.clone().add(i, "days"));
  }, [weekStart]);

  const containerStyle = {
    width: "100%",
    maxWidth: "100%",
    overflowX: "auto",
    overflowY: "auto",
    padding: "16px 0",
    fontFamily: "sans-serif",
  };

  const headerGridStyle = {
    display: "grid",
    gridTemplateColumns: `${labelColWidth}px repeat(7, 1fr)`,
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
  };

  const headerCellStyle = {
    textAlign: "center",
    fontSize: 12,
    fontWeight: 500,
    color: "#6b7280",
    padding: "6px 0",
    borderLeft: "1px solid #e5e7eb",
  };

  const bodyGridStyle = {
    display: "grid",
    gridTemplateColumns: `${labelColWidth}px repeat(7, 1fr)`,
    alignItems: "stretch",
  };

  const labelColStyle = { position: "relative" };

  const labelStyle = (isHalf) => ({
    position: "absolute",
    right: 8,
    transform: "translateY(-50%)",
    fontSize: isHalf ? "11px" : "12px",
    color: isHalf ? "#9ca3af" : "#6b7280",
    textAlign: "right",
    lineHeight: 1,
  });

  const dayColStyle = {
    position: "relative",
    borderLeft: "1px solid #e5e7eb", // vertical lines
    background: "#fff",
  };

  const slotStyle = (isHalf) => ({
    borderTop: `1px solid ${isHalf ? "#f3f4f6" : "#d1d5db"}`,
    height: `${hourHeight / 2}px`,
    boxSizing: "border-box",
  });

  const dayHeaderStyle = (isToday) => ({
    fontWeight: 600,
    fontSize: 12,
    color: isToday ? "#2563eb" : "#111827",
  });

  // Time label helper
  const timeLabel = (halfIndex) => {
    const minutes = halfIndex * 30;
    const hour = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return mins === 0 ? `${displayHour} ${period}` : `${displayHour}:30 ${period}`;
  };

  return (
    <div style={containerStyle}>
      {/* Header row */}
      <div style={headerGridStyle}>
        <div /> {/* Empty label column */}
        {days.map((d, i) => {
          const isToday = d.isSame(moment(), "day");
          return (
            <div key={i} style={headerCellStyle}>
              <div style={dayHeaderStyle(isToday)}>{d.format("ddd")}</div>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>
                {d.format("D MMM")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Body grid */}
      <div style={bodyGridStyle}>
        {/* Time labels */}
        <div style={labelColStyle}>
          {Array.from({ length: 48 }, (_, i) => {
            const isHalf = i % 2 === 1;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: (i * hourHeight) / 2,
                  height: hourHeight / 2,
                  width: "100%",
                }}
              >
                <span style={labelStyle(isHalf)}>{timeLabel(i)}</span>
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        {days.map((d, idx) => {
          const dayStart = d.clone().startOf("day");
          const dayEnd = d.clone().endOf("day");
          const dayAppointments = appointments.filter((a) => {
            const start = moment(a.startTime);
            const end = moment(a.endTime);
            return (
              start.isSame(d, "day") ||
              end.isSame(d, "day") ||
              (start.isBefore(dayEnd) && end.isAfter(dayStart))
            );
          });

          const currentTop = now.isSame(d, "day")
            ? (now.diff(dayStart, "minutes") / 60) * hourHeight
            : null;

          return (
            <div key={idx} style={dayColStyle}>
              {Array.from({ length: 48 }, (_, i) => {
                const isHalf = i % 2 === 1;
                return <div key={i} style={slotStyle(isHalf)} />;
              })}

              {/* Current time indicator */}
              {currentTop !== null && (
                <div
                  style={{
                    position: "absolute",
                    top: currentTop,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      borderTop: "2px solid #ef4444",
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: -6,
                      top: -6,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "2px solid white",
                      boxShadow: "0 0 2px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              )}

              {/* Appointments */}
              {dayAppointments.map((appt) => (
                <AppointmentBlock
                  key={`${appt.appointmentId}-${idx}`}
                  appt={appt}
                  dayDate={d}
                  hourHeight={hourHeight}
                  onClick={onAppointmentClick}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
