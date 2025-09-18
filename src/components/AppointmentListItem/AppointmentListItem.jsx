import React from "react";
import moment from "moment";
import styles from "./AppointmentListItem.module.sass";

const AppointmentListItem = ({ appt, onClick }) => {
  const start = moment(appt.startTime);
  const end = moment(appt.endTime);
  const whenLabel = start.calendar(undefined, {
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    nextWeek: "ddd, MMM D",
    lastDay: "[Yesterday]",
    lastWeek: "ddd, MMM D",
    sameElse: "ddd, MMM D",
  });

  return (
    <div
      className={styles.item}
      onClick={() => onClick && onClick(appt)}
      title={`${appt.title} | ${start.format("h:mm A")} - ${end.format(
        "h:mm A"
      )}`}
      style={{ borderLeftColor: appt.statusColor || "#3b82f6", marginTop: 8 }}
    >
      <div className={styles.title}>{appt.title}</div>
      <div className={styles.meta}>
        <span className={styles.when}>{whenLabel}</span>
        <span className={styles.time}>
          {start.format("h:mm A")} - {end.format("h:mm A")}
        </span>
      </div>
    </div>
  );
};

export default AppointmentListItem;
