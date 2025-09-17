import React, {useState} from "react";
import styles from "./CalendarPage.module.sass"
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import DateNavigator from "../../components/DateNavigator/DateNavigator";
import Button from "./../../components/Button/Button"
import Divider from "../../components/Divider/DIvider";
import moment from "moment";
import { useSelector } from "react-redux";
import DayView from "../../components/Calendar/DayView";
import MonthView from "../../components/Calendar/MonthView";
import WeekView from "../../components/Calendar/WeekView";
import Modal from "../../components/Modal/Modal";

function CalendarPage() {
  const [selectedView, setSelectedView] = useState("day");

  function changeCalendarView(view) {
    setSelectedView(view.toLowerCase());
  }

  const fromDate = useSelector((state) => state.calendar.fromDate);
  const toDate = useSelector((state) => state.calendar.toDate);

  const selectedFromDate = fromDate ? moment(fromDate) : moment();
  const selectedToDate = toDate ? moment(toDate) : moment();

  const [createAppointmentVisibility, setCreateAppointmentVisibility] = useState(false);

  function openCreateAppointmentModal() {
    setCreateAppointmentVisibility(true);
  }

  function closeCreateAppointmentModal() {
    setCreateAppointmentVisibility(false);
  }


  const [appointments] = useState([
    {
      appointmentId: 4,
      title: "Training Session",
      description: "Skill-building training",
      location: "Room 204",
      meetingLink: null,
      startTime: "2025-09-17T14:00:00",
      endTime: "2025-09-17T15:30:00",
      status: "Scheduled",
      statusColor: "#28a745",
      organizerName: "ashok selvan",
      participants: ["ashok selvan"]
    },
  ]);

  return (
      <div className={styles.calendar}>
          <div className={styles.leftContainer}>
              <p></p>
          </div>
          <div className={styles.rightContainer}>
              <div className={styles.topContainer}>
                  <ButtonGroup items={["Day", "Week", "Month"]} onSelect={changeCalendarView} selectedItem="Day"/>
                  <DateNavigator selectedFrequency={selectedView} />
                  <div>
                      <Button
                        onClick={openCreateAppointmentModal}
                      >
                          Create Appointment
                      </Button>
                  </div>
              </div>
              <div style={{width: '95%', justifySelf: 'center'}}>
                  <Divider />
              </div>

              {selectedView === "day" && (
                <DayView
                  dayDate={selectedFromDate}
                  appointments={appointments}
                />
              )}

              {selectedView === "week" && (
                <WeekView
                  weekDate={selectedFromDate}
                  appointments={appointments}
                />
              )}

              {selectedView === "month" && (
                <MonthView
                  monthDate={selectedFromDate}
                  appointments={appointments}
                />
              )}
          </div>
          <Modal
            isOpen={createAppointmentVisibility}
            title={"Create Appointment"}
            onClose={closeCreateAppointmentModal}
          >

          </Modal>
      </div>
  )
}

export default CalendarPage;