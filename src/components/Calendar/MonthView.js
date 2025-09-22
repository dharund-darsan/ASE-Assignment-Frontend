// MonthView.jsx
import React, { useMemo } from "react";
import moment from "moment";

export default function MonthView({
  monthDate,
  appointments = [],
  cellMinHeight = 40,
  onDayClick = () => {},
  maxVisibleRows = 3,
  onAppointmentClick = () => {},
}) {
  const monthStart = useMemo(() => monthDate.clone().startOf("month"), [monthDate]);
  const monthEnd = useMemo(() => monthDate.clone().endOf("month"), [monthDate]);
  const calendarStart = useMemo(() => monthStart.clone().startOf("week"), [monthStart]);
  const calendarEnd = useMemo(() => monthEnd.clone().endOf("week"), [monthEnd]);

  // Generate all days in the calendar
  const days = useMemo(() => {
    const d = [];
    const cur = calendarStart.clone();
    while (cur.isBefore(calendarEnd) || cur.isSame(calendarEnd, "day")) {
      d.push(cur.clone());
      cur.add(1, "day");
    }
    return d;
  }, [calendarStart, calendarEnd]);

  // Split days into weeks
  const weeks = useMemo(() => {
    const result = [];
    let week = [];
    days.forEach((d, i) => {
      week.push(d);
      if ((i + 1) % 7 === 0) {
        result.push(week);
        week = [];
      }
    });
    return result;
  }, [days]);

  const weekdayLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      calendarStart.clone().add(i, "days").format("ddd")
    );
  }, [calendarStart]);

  // ---- Styles ----
  const containerStyle = { width: "100%", maxWidth: "100%", overflow: "hidden", padding: "16px", boxSizing: "border-box", fontFamily: "sans-serif" };
  const headerStyle = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" };
  const headerCellStyle = { textAlign: "center", fontWeight: 600, color: "#6b7280", fontSize: 12, padding: "6px 0" };
  const weekRowStyle = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", position: "relative", minHeight: cellMinHeight, marginBottom: 8 };
  const dayCellStyle = { border: "1px solid #e5e7eb", minHeight: cellMinHeight, position: "relative", cursor: "pointer", background: "#fff", height: 120 };
  const apptBarStyle = (color) => ({
    position: "absolute",
    height: 20,
    background: color || "#3b82f6",
    color: "#fff",
    fontSize: 12,
    padding: "0 4px",
    borderRadius: 4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "pointer",
  });
  const todayStyle = { fontWeight: 600, color: "#2563eb", fontSize: 12 };

  return (
    <div style={containerStyle}>
      {/* Weekday Header */}
      <div style={headerStyle}>
        {weekdayLabels.map((label, i) => (
          <div key={i} style={headerCellStyle}>{label}</div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((weekDays, weekIdx) => {
        const weekStart = weekDays[0];
        const weekEnd = weekDays[6];

        // Filter appointments that overlap this week
        const weekAppointments = appointments.filter((a) => {
          const start = moment(a.startTime);
          const end = moment(a.endTime);
          return end.isAfter(weekStart.startOf("day")) && start.isBefore(weekEnd.endOf("day"));
        });

        // Track rows to avoid overlap
        const rows = [];

        return (
          <div key={weekIdx} style={weekRowStyle}>
            {/* Day cells */}
            {weekDays.map((d, i) => (
  <div
    key={i}
    style={{
      ...dayCellStyle,
      padding: 2,
      boxSizing: "border-box",
    }}
    onClick={() => onDayClick(d)}
  >
    {/* Day number */}
    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
      {d.date()}
      {d.isSame(moment(), "day") && " Today"}
    </div>
  </div>
))}

            {/* Appointment bars */}
            {weekAppointments.map((appt) => {
              const start = moment.max(moment(appt.startTime), weekStart.clone().startOf("day"));
              const end = moment.min(moment(appt.endTime), weekEnd.clone().endOf("day"));

              // Find start/end column indices
              const startIndex = weekDays.findIndex((d) => start.isSameOrBefore(d.clone().endOf("day")) && start.isSameOrAfter(d.clone().startOf("day")));
              const endIndex = weekDays.findIndex((d) => end.isSameOrBefore(d.clone().endOf("day")) && end.isSameOrAfter(d.clone().startOf("day")));

              // Find available row to avoid overlap
              let row = 0;
              while (rows[row]?.some(r => r.startIndex <= endIndex && r.endIndex >= startIndex)) {
                row++;
              }
              if (!rows[row]) rows[row] = [];
              rows[row].push({ startIndex, endIndex });

              console.log(rows);

              const maxVisibleRows = 3; // maximum rows to display

// Only render if row < maxVisibleRows
if (row < maxVisibleRows) {
  return (
    <div
      key={appt.appointmentId}
      onClick={(e) => {
        e.stopPropagation();
        onAppointmentClick(appt);
      }}
      style={{
        ...apptBarStyle(appt.statusColor),
        top: row * 24 + 20,
        left: `${(startIndex / 7) * 100}%`,
        width: `${((endIndex - startIndex + 1) / 7) * 100}%`,
      }}
      title={`${appt.title} | ${moment(appt.startTime).format("MMM D, h:mm A")} - ${moment(appt.endTime).format("MMM D, h:mm A")}`}
    >
      {appt.title}
    </div>
  );
} else {
  // track hidden rows for "+X more"
  if (!rows.hidden) rows.hidden = [];
  rows.hidden.push(appt);
  return null;
}

            })}
            {rows.hidden && rows.hidden.length > 0 && (
  <div
    style={{
      position: "absolute",
      top: maxVisibleRows * 24 + 20,
      left: 2,
      fontSize: 11,
      color: "#2563eb",
      fontWeight: 600,
      cursor: "pointer",
      border: "1px solid #2563eb",
      borderRadius: 11,
      padding: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    +{rows.hidden.length} more
  </div>
)}


          </div>
        );
      })}
    </div>
  );
}
