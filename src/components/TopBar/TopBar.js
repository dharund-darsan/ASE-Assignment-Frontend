import React, {useState} from "react";
import { Link } from "react-router-dom";
import styles from './TopBar.module.sass';
import { TbLogout } from "react-icons/tb";
import Modal from "../Modal/Modal";
import Divider from "../Divider/Divider";
import Button from "../Button/Button";
import { FaCalendarCheck } from "react-icons/fa";
import { showToast } from "../Toast/Toast";



const TopBar = () => {
  const [confirmationModalVisibility, setconfirmationModalVisibility] = useState(false);


  const handleLogout = () => {
    const toast = showToast("Logged out successfully", "success", false);
    setTimeout(() => {
      localStorage.removeItem("userDetails");
      localStorage.removeItem("jwtToken");
      window.location.href = "/";
    }, 300)
  };
  

  return (
    <>
    <div className={styles.topBar}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <FaCalendarCheck style={{width: 25, height: 25}}/>
        <h2>QuickBook</h2>
      </div>
      <div>
        <TbLogout className={styles.logoutIcon} onClick={() => setconfirmationModalVisibility(true)}/>

      </div>
      <Modal
        isOpen={confirmationModalVisibility}
        title={"Confirmation"}
        onClose={() => setconfirmationModalVisibility(false)}
      >
        <div className={styles.confirmationModal}>
          <p>
            Are you sure want to log out?
          </p>
        </div>
        <Divider />

        <div className={styles.modalFooter}>
              <div>
              </div>
              <div style={{display: 'flex', gap: 12}}>
                <Button variant="ghost" onClick={() => setconfirmationModalVisibility(false)}>Close</Button>
                <Button onClick={() =>{handleLogout()}} variant="danger">Logout</Button>
              </div>
        </div>
        

      </Modal>
    </div>
    <Divider />
    </>
  );
};

export default TopBar;
