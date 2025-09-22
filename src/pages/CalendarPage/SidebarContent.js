import React, {useState} from "react";
import styles from './SidebarContent.module.sass';
import { FiSidebar } from "react-icons/fi";
import AppointmentListItem from "./../../components/AppointmentListItem/AppointmentListItem";
import Divider from "../../components/Divider/Divider";
import { useIsMobile } from "../../hooks/useIsMobile";
import { IoClose } from "react-icons/io5";


export default function SidebarContent({upcomingAppointments, setSidebarOpen, handleAppointmentSelect}) {
    const isMobile = useIsMobile();





    return <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <h3>Upcoming Appointments</h3>
            <button
              type="button"
              className={styles.sidebarToggle}
              aria-label="Collapse sidebar"
              onClick={() => setSidebarOpen(false)}
            >
                {
                    isMobile ?
                        <IoClose /> :
                        <FiSidebar />
                }
            </button>
          </div>
          <Divider />
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
}