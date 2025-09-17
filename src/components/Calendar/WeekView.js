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

export default function WeekView({
  weekDate,
  appointments = [],
  hourHeight = 48,
  labelColWidth = 64,
}) {
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
    boxSizing: "border-box",
  };

  const headerGridStyle = {
    display: "grid",
    gridTemplateColumns: `${labelColWidth}px repeat(7, minmax(0, 1fr))`,
    columnGap: "8px",
    alignItems: "center",
    padding: "0 0 8px 0",
  };

  const headerCellStyle = {
    textAlign: "center",
    fontWeight: 600,
    color: "#6b7280",
    fontSize: 12,
    padding: "8px 0",
  };

  const bodyGridStyle = {
    display: "grid",
    gridTemplateColumns: `${labelColWidth}px repeat(7, minmax(0, 1fr))`,
    columnGap: "8px",
    alignItems: "stretch",
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

  const slotStyle = (isHalf) => ({
    borderTop: `1px solid ${isHalf ? "#e5e7eb" : "#d1d5db"}`,
    height: `${hourHeight / 2}px`,
    boxSizing: "border-box",
  });

  const dayHeaderStyle = (isToday) => ({
    textAlign: "center",
    fontWeight: 700,
    fontSize: 12,
    color: isToday ? "#2563eb" : "#111827",
  });

  return (
    <div style={containerStyle}>
      {/* Header row: empty label column + 7 day labels */}
      <div style={headerGridStyle}>
        <div />
        {days.map((d, i) => {
          const isToday = d.isSame(moment(), "day");
          return (
            <div key={i} style={headerCellStyle}>
              <div style={dayHeaderStyle(isToday)}>
                {d.format("ddd")}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                {d.format("D MMM")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Body grid: time labels + day columns */}
      <div style={bodyGridStyle}>
        {/* Time labels column */}
        <div style={labelColStyle}>
          {Array.from({ length: 48 }, (_, i) => {
            const isHalf = i % 2 === 1;

            const minutes = i * 30;
            const hour = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const period = hour < 12 ? "AM" : "PM";
            const displayHour = hour % 12 === 0 ? 12 : hour % 12;
            const label =
              mins === 0 ? `${displayHour} ${period}` : `${displayHour}:30 ${period}`;

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
                <span style={labelStyle(isHalf)}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Seven day columns */}
        {days.map((d, idx) => {
          // Appointments that touch this day
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

          return (
            <div key={idx} style={dayColStyle}>
              {/* Half-hour lines */}
              {Array.from({ length: 48 }, (_, i) => {
                const isHalf = i % 2 === 1;
                return <div key={i} style={slotStyle(isHalf)} />;
              })}

              {/* Appointments for the day */}
              {dayAppointments.map((appt) => (
                <AppointmentBlock
                  key={`${appt.appointmentId}-${idx}`}
                  appt={appt}
                  dayDate={d}
                  hourHeight={hourHeight}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}