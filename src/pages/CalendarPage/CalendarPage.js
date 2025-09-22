import React, {useState, useEffect, useMemo} from "react";
import styles from "./CalendarPage.module.sass";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import DateNavigator from "../../components/DateNavigator/DateNavigator";
import Button from "./../../components/Button/Button";
import Divider from "../../components/Divider/Divider";
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
import { useIsMobile } from "../../hooks/useIsMobile";
import Sidebar from "../../components/Sidebar/Sidebar";
import SidebarContent from "./SidebarContent";
import { FaPlus } from "react-icons/fa6";


function CalendarPage() {
  const dispatch = useDispatch();

  const [selectedView, setSelectedView] = useState("day");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function changeCalendarView(view) {
    setSelectedView(view.toLowerCase());
    // getAppointmentListForTheDate();
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

    // getAppointmentListForTheDate();
    setUserDetails(JSON.parse(localStorage.getItem("userDetails")) || null);
  }, []);

  

  useEffect(() => {
    getAppointmentListForTheDate();
  }, [fromDate]);

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
    let toast;
    if (mode === "edit") {
      toast = showToast("Editing appointment", null, true);
      const filteredAppointment = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) =>
            value !== null && !(Array.isArray(value) && value.length === 0)
        )
      );
      updateAppointment({ ...filteredAppointment, statusId: 1 })
        .then((res) => {
          // showToast("success", "Appointment updated successfully!");
          closeCreateAppointmentModal();
          getAppointmentListForTheDate();
          toast.update(false, "Appointment updated successfully", "success");
        })
        .catch((err) => {
          toast.update(false, err?.response?.data?.message ?? "Error upadating Appointment", "failure");
        });
    } else {
      toast = showToast("creating appointment", null, true);
      createAppointment({ ...data, statusId: 1 })
        .then((res) => {
          showToast("success", "Appointment created successfully!");
          closeCreateAppointmentModal();
          getAppointmentListForTheDate();
          toast.update(false, "Appointment created successfully", "success");
        })
        .catch((err) => {
          toast.update(false, err?.response?.data?.message ?? "Error creating Appointment", "failure");
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
        showToast("failure", "Error cancelling appointment!");
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

  const isMobile = useIsMobile();

  return (
    <div className={styles.calendar}>
      {/* Sidebar */}
      {!isMobile && <div
        className={`${styles.leftContainer} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}

      >
        {/* Expanded content */}
        {sidebarOpen && <SidebarContent 
          upcomingAppointments={upcomingAppointments}
          setSidebarOpen={setSidebarOpen}
          handleAppointmentSelect={handleAppointmentSelect}
        />}

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
      </div> }

      {/* Main content */}
      <div className={styles.rightContainer}>
        <div className={styles.topContainer}>
          {
            isMobile ?
            <button
              type="button"
              className={styles.sidebarToggle}
              aria-label="Collapse sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <FiSidebar />
            </button> : <></>
          }
          <ButtonGroup
            items={["Day", "Week", "Month"]}
            onSelect={changeCalendarView}
            selectedItem="Day"
            changeResolution={isMobile ? true : false}
          />
          <DateNavigator
            selectedFrequency={selectedView}
            // onDateChange={getAppointmentListForTheDate}
          />
          {!isMobile && <div className={styles.topActions}>
            <Button onClick={openCreateAppointmentModal}>
              Create Appointment
            </Button>
          </div>}
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
            <WeekView 
              weekDate={selectedFromDate} 
              appointments={appointments} 
              onAppointmentClick={handleAppointmentSelect} 
            />
          )}

          {selectedView === "month" && (
            <MonthView
              monthDate={selectedFromDate}
              appointments={appointments}
              onAppointmentClick={handleAppointmentSelect}
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

      {
          sidebarOpen && isMobile && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} side="left">
            <SidebarContent 
              upcomingAppointments={upcomingAppointments}
              setSidebarOpen={setSidebarOpen}
              handleAppointmentSelect={handleAppointmentSelect}
            />
          </Sidebar>
      }
      {
        isMobile && <Button onClick={openCreateAppointmentModal} className={styles.createAppointmentMobile}>
                <FaPlus />
            </Button>
      }
    </div>
  );
}

export default CalendarPage;
