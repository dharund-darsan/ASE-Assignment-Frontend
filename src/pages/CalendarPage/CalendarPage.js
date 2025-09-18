import React, {useState, useEffect, useMemo} from "react";
import styles from "./CalendarPage.module.sass";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import DateNavigator from "../../components/DateNavigator/DateNavigator";
import Button from "./../../components/Button/Button";
import Divider from "../../components/Divider/DIvider";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import DayView from "../../components/Calendar/DayView";
import MonthView from "../../components/Calendar/MonthView";
import WeekView from "../../components/Calendar/WeekView";
import { getUserList, createAppointment, getAppointmentList, updateAppointment, cancelAppointment } from "../../api/api";
import { showToast } from "./../../components/Toast/Toast";
import AppointmentModal from "../../components/AppointmentModal/AppointmentModal";
import AppointmentListItem from "../../components/AppointmentListItem/AppointmentListItem";
import { FiSidebar } from "react-icons/fi";


function CalendarPage() {
  const dispatch = useDispatch();

  const [selectedView, setSelectedView] = useState("day");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function changeCalendarView(view) {
    setSelectedView(view.toLowerCase());
  }

  const fromDate = useSelector((state) => state.calendar.fromDate);
  const toDate = useSelector((state) => state.calendar.toDate);

  const selectedFromDate = fromDate ? moment(fromDate) : moment();
  const selectedToDate = toDate ? moment(toDate) : moment();

  const [createAppointmentVisibility, setCreateAppointmentVisibility] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [mode, setMode] = useState("create");
  const [appointment, setAppointment] = useState([]);

  useEffect(() => {
    getUserList()
      .then((res) => {
        const options = (res?.data || []).map((u) => ({
          value: u.userId,
          label: u.fullName.trim(),
        }));
        setCustomers(options);
      })
      .catch(() => setCustomers([]));

    getAppointmentListForTheDate();
    setUserDetails(JSON.parse(localStorage.getItem("userDetails")) || null);
  }, []);

  function getAppointmentListForTheDate(from_date = "", to_date = "") {
    const from = moment(from_date == "" ? fromDate : from_date)
      .startOf("day")
      .format("YYYY-MM-DDTHH:mm:ss");
    const to = moment(to_date == "" ? toDate : to_date)
      .endOf("day")
      .format("YYYY-MM-DDTHH:mm:ss");

    getAppointmentList(from, to)
      .then((res) => {
        setAppointments(res.data || []);
      })
      .catch((err) => {
        console.error("Error getting appointments:", err);
      });
  }

  function openCreateAppointmentModal() {
    setCreateAppointmentVisibility(true);
  }

  function closeCreateAppointmentModal() {
    setCreateAppointmentVisibility(false);
    setMode("create");
  }

  function onCreateAppointment(data) {
    if (mode === "edit") {
      const filteredAppointment = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) =>
            value !== null && !(Array.isArray(value) && value.length === 0)
        )
      );
      updateAppointment({ ...filteredAppointment, statusId: 1 })
        .then((res) => {
          showToast("success", "Appointment updated successfully!");
          closeCreateAppointmentModal();
          getAppointmentListForTheDate();
        })
        .catch((err) => {
          showToast("error", "Error updating appointment!");
        });
    } else {
      createAppointment({ ...data, statusId: 1 })
        .then((res) => {
          showToast("success", "Appointment created successfully!");
          closeCreateAppointmentModal();
          getAppointmentListForTheDate();
        })
        .catch((err) => {
          showToast("error", "Error creating appointment!");
        });
    }
  }

  const handleAppointmentSelect = (appointment) => {
    if (userDetails?.userId == appointment.organizerId) {
      setMode("edit");
    } else {
      setMode("view");
    }
    setAppointment(appointment);
    setCreateAppointmentVisibility(true);
  };

  const onCancelAppointment = (appointmentId, cancelReason) => {
    cancelAppointment({ appointmentId, cancelReason })
      .then((res) => {
        showToast("success", "Appointment cancelled successfully!");
        getAppointmentListForTheDate();
      })
      .catch((err) => {
        showToast("error", "Error cancelling appointment!");
        closeCreateAppointmentModal();
      });
  };

  const upcomingAppointments = useMemo(() => {
    const now = moment();
    return (appointments || [])
      .filter((a) => moment(a.endTime).isAfter(now))
      .sort((a, b) => moment(a.startTime).diff(moment(b.startTime)))
      .slice(0, 10);
  }, [appointments]);

  return (
    <div className={styles.calendar}>
      {/* Sidebar */}
      <div
        className={`${styles.leftContainer} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        {/* Expanded content */}
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <h3>Upcoming Appointments</h3>
            <button
              type="button"
              className={styles.sidebarToggle}
              aria-label="Collapse sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              <FiSidebar />
            </button>
          </div>
          <div className={styles.sidebarList}>
            {upcomingAppointments.length === 0 ? (
              <div className={styles.noAppointments}>
                No upcoming appointments
              </div>
            ) : (
              upcomingAppointments.map((appt) => (
                <AppointmentListItem
                  key={appt.appointmentId}
                  appt={appt}
                  onClick={handleAppointmentSelect}
                />
              ))
            )}
          </div>
        </div>

        {/* Collapsed minimal content */}
        <div className={styles.sidebarCollapsed}>
          <button
            type="button"
            className={styles.sidebarToggle}
            aria-label="Expand sidebar"
            onClick={() => setSidebarOpen(true)}
            title="Open sidebar"
          >
            <FiSidebar />
          </button>
          <div className={styles.collapsedBadge} title="Upcoming appointments">
            {upcomingAppointments.length}
          </div>
          <div className={styles.collapsedList}>
            {upcomingAppointments.slice(0, 5).map((appt) => (
              <div
                key={appt.appointmentId}
                className={styles.apptDot}
                title={`${moment(appt.startTime).format("MMM D, h:mm A")}`}
                onClick={() => {
                  setSidebarOpen(true);
                  handleAppointmentSelect(appt);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSidebarOpen(true);
                    handleAppointmentSelect(appt);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.rightContainer}>
        <div className={styles.topContainer}>
          <ButtonGroup
            items={["Day", "Week", "Month"]}
            onSelect={changeCalendarView}
            selectedItem="Day"
          />
          <DateNavigator
            selectedFrequency={selectedView}
            onDateChange={getAppointmentListForTheDate}
          />
          <div className={styles.topActions}>
            <Button onClick={openCreateAppointmentModal}>
              Create Appointment
            </Button>
          </div>
        </div>

        <div className={styles.dividerWrapper}>
          <Divider />
        </div>

        <div className={styles.calendarContent}>
          {selectedView === "day" && (
            <DayView
              dayDate={selectedFromDate}
              appointments={appointments}
              onAppointmentClick={handleAppointmentSelect}
            />
          )}

          {selectedView === "week" && (
            <WeekView weekDate={selectedFromDate} appointments={appointments} />
          )}

          {selectedView === "month" && (
            <MonthView
              monthDate={selectedFromDate}
              appointments={appointments}
            />
          )}
        </div>
      </div>

      <AppointmentModal
        isOpen={createAppointmentVisibility}
        mode={mode}
        onClose={closeCreateAppointmentModal}
        onSubmit={(data) => onCreateAppointment(data)}
        customers={customers}
        appointment={mode === "create" ? [] : appointment}
        onDelete={onCancelAppointment}
      />
    </div>
  );
}

export default CalendarPage;
