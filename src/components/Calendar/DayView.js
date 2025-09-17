import React, { useMemo } from "react";
import moment from "moment";

function AppointmentBlock({ appt, dayDate, hourHeight }) {
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

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 8,
        right: 8,
        height,
        borderRadius: 6,
        background: "#F0FDF4",
        borderLeft: `4px solid ${appt.statusColor || "#3b82f6"}`,
        padding: "8px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
        {appt.title}
      </div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        {visibleStart.format("h:mm A")} - {visibleEnd.format("h:mm A")}
      </div>
      {appt.location && (
        <div style={{ fontSize: 12, color: "#6b7280" }}>{appt.location}</div>
      )}
    </div>
  );
}

export default function DayView({
  dayDate,
  appointments = [],
  hourHeight = 48,
  labelColWidth = 64,
}) {
  const dayAppointments = useMemo(() => {
    if (!dayDate) return [];
    return appointments.filter((a) =>
      moment(a.startTime).isSame(dayDate, "day")
    );
  }, [appointments, dayDate]);

  const timeLabel = (halfIndex) => {
    const minutes = halfIndex * 30;
    const hour = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return mins === 0
      ? `${displayHour} ${period}`
      : `${displayHour}:30 ${period}`;
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

  const labelColStyle = {
    position: "relative",
  };

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
  };

  // Draw a line at every half-hour; darker for full hour
  const slotStyle = (isHalf) => ({
    borderTop: `1px solid ${isHalf ? "#e5e7eb" : "#d1d5db"}`,
    height: `${hourHeight / 2}px`,
    boxSizing: "border-box",
  });

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

          {dayAppointments.map((appt) => (
            <AppointmentBlock
              key={appt.appointmentId}
              appt={appt}
              dayDate={dayDate}
              hourHeight={hourHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
