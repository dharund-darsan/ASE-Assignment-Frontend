import React, { useMemo, useEffect, useState } from "react";
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

  // Adjust font size dynamically
  let titleFont = 10;
  let timeFont = 12;
  let padding = "6px";

  if (height < 30) {
    titleFont = 10;
    timeFont = 9;
    padding = "2px 4px";
  } else if (height < 40) {
    titleFont = 12;
    timeFont = 10;
    padding = "4px 6px";
  }

  return (
    <div
      onClick={() => onClick && onClick(appt)}
      style={{
        position: "absolute",
        top,
        left: 8,
        right: 8,
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

// Main Day View
export default function DayView({ dayDate, appointments = [], hourHeight = 48, labelColWidth = 64, onAppointmentClick }) {
  const [now, setNow] = useState(moment());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter appointments for the day
  const dayAppointments = useMemo(() => {
  if (!dayDate) return [];
  return appointments.filter((a) => {
    const start = moment(a.startTime);
    const end = moment(a.endTime);
    const dayStart = dayDate.clone().startOf("day");
    const dayEnd = dayDate.clone().endOf("day");

    // Return true if the appointment overlaps the day
    return end.isAfter(dayStart) && start.isBefore(dayEnd);
  });
}, [appointments, dayDate]);


  // Time label helper
  const timeLabel = (halfIndex) => {
    const minutes = halfIndex * 30;
    const hour = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return mins === 0 ? `${displayHour} ${period}` : `${displayHour}:30 ${period}`;
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "100%",
    overflowY: "auto",
    padding: "32px 0",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `${labelColWidth}px 1fr`,
    alignItems: "stretch",
    columnGap: "8px",
  };

  const labelColStyle = { position: "relative" };
  const dayColStyle = { position: "relative" };

  const labelStyle = (isHalf) => ({
    position: "absolute",
    right: 8,
    transform: "translateY(-50%)",
    fontSize: isHalf ? "11px" : "12px",
    color: isHalf ? "#9ca3af" : "#6b7280",
    textAlign: "right",
    lineHeight: 1,
  });

  const slotStyle = (isHalf) => ({
    borderTop: `1px solid ${isHalf ? "#e5e7eb" : "#d1d5db"}`,
    height: `${hourHeight / 2}px`,
    boxSizing: "border-box",
  });

  // Current time line
  const currentTop = now.isSame(dayDate, "day")
    ? (now.diff(dayDate.clone().startOf("day"), "minutes") / 60) * hourHeight
    : null;

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
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

        {/* Calendar column */}
        <div style={dayColStyle}>
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
                  left: -14,
                  top: -6,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid white",
                  boxShadow: "0 0 2px rgba(0,0,0,0.2)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: -60,
                  top: -10,
                  background: "#ef4444",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: 4,
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                {now.format("h:mm A")}
              </div>
            </div>
          )}

          {/* Appointments */}
          {dayAppointments.map((appt) => (
            <AppointmentBlock
              key={appt.appointmentId}
              appt={appt}
              dayDate={dayDate}
              hourHeight={hourHeight}
              onClick={onAppointmentClick} // Return whole object to parent
            />
          ))}
        </div>
      </div>
    </div>
  );
}
