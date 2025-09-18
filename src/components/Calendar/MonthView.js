import React, { useMemo } from "react";
import moment from "moment";

export default function MonthView({
  monthDate,
  appointments = [],
  cellMinHeight = 120,
  maxAppointmentsPerDay = 3,
}) {
  const monthStart = useMemo(() => monthDate.clone().startOf("month"), [monthDate]);
  const monthEnd = useMemo(() => monthDate.clone().endOf("month"), [monthDate]);
  const calendarStart = useMemo(() => monthStart.clone().startOf("week"), [monthStart]);
  const calendarEnd = useMemo(() => monthEnd.clone().endOf("week"), [monthEnd]);

  const days = useMemo(() => {
    const d = [];
    const cur = calendarStart.clone();
    while (cur.isBefore(calendarEnd) || cur.isSame(calendarEnd, "day")) {
      d.push(cur.clone());
      cur.add(1, "day");
    }
    return d;
  }, [calendarStart, calendarEnd]);

  const weekdayLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      calendarStart.clone().add(i, "days").format("ddd")
    );
  }, [calendarStart]);

  const apptsByDay = (day) => {
    return appointments.filter((a) => {
      const start = moment(a.startTime);
      const end = moment(a.endTime);
      return (
        start.isSame(day, "day") ||
        end.isSame(day, "day") ||
        (start.isBefore(day, "day") && end.isAfter(day, "day"))
      );
    });
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    padding: "16px",
    boxSizing: "border-box",
    fontFamily: "sans-serif",
  };

  const headerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: "4px",
    marginBottom: "8px",
  };

  const headerCellStyle = {
    textAlign: "center",
    fontWeight: 600,
    color: "#6b7280",
    fontSize: 12,
    padding: "6px 0",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gridAutoRows: "1fr",
    gap: "4px",
  };

  const dayCellStyle = (isCurrentMonth) => ({
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    background: "#fff",
    minHeight: cellMinHeight,
    display: "flex",
    flexDirection: "column",
    padding: 6, // tighter padding like Day/Week cells
    boxSizing: "border-box",
    opacity: isCurrentMonth ? 1 : 0.55,
  });

  const dayHeaderStyle = (isToday) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 12,
    fontWeight: 600,
    color: isToday ? "#2563eb" : "#111827",
  });

  const todayBadgeStyle = {
    marginLeft: "auto",
    fontSize: 10,
    color: "#2563eb",
    background: "#dbeafe",
    padding: "2px 6px",
    borderRadius: 999,
    fontWeight: 600,
  };

  const appointmentsListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginTop: 2,
    overflow: "hidden",
  };

  const apptPillStyle = (color) => ({
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 4px", // smaller pill like DayView when tight
    borderRadius: 4,
    background: "#F9FAFB",
    borderLeft: `3px solid ${color || "#3b82f6"}`,
    fontSize: 11,
    fontWeight: 500,
    color: "#111827",
    minHeight: 20,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  });

  const apptTimeStyle = {
    color: "#6b7280",
    fontSize: 10,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        {weekdayLabels.map((label, i) => (
          <div key={i} style={headerCellStyle}>
            {label}
          </div>
        ))}
      </div>

      <div style={gridStyle}>
        {days.map((d, idx) => {
          const isCurrentMonth = d.isSame(monthStart, "month");
          const isToday = d.isSame(moment(), "day");
          const dayAppts = apptsByDay(d);
          const visibleAppts = dayAppts.slice(0, maxAppointmentsPerDay);
          const moreCount = Math.max(0, dayAppts.length - visibleAppts.length);

          return (
            <div key={idx} style={dayCellStyle(isCurrentMonth)}>
              <div style={dayHeaderStyle(isToday)}>
                <span>{d.date()}</span>
                {isToday && <span style={todayBadgeStyle}>Today</span>}
              </div>

              <div style={appointmentsListStyle}>
                {visibleAppts.map((appt) => {
                  const start = moment(appt.startTime);
                  const end = moment(appt.endTime);
                  const showTimes = start.isSame(d, "day") || end.isSame(d, "day");
                  return (
                    <div key={appt.appointmentId} style={apptPillStyle(appt.statusColor)}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {appt.title}
                      </span>
                      {showTimes && (
                        <span style={apptTimeStyle}>
                          {start.format("h:mm A")} - {end.format("h:mm A")}
                        </span>
                      )}
                    </div>
                  );
                })}
                {moreCount > 0 && (
                  <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 600 }}>
                    +{moreCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
