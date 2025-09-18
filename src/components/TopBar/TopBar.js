import React, {useState} from "react";
import { Link } from "react-router-dom";
import styles from './TopBar.module.sass';
import { TbLogout } from "react-icons/tb";
import Modal from "../Modal/Modal";
import Divider from "../Divider/DIvider";
import Button from "../Button/Button";
import { SiQbittorrent } from "react-icons/si";



const TopBar = () => {
  const [confirmationModalVisibility, setconfirmationModalVisibility] = useState(false);


  const handleLogout = () => {
    localStorage.removeItem("userDetails");
    localStorage.removeItem("jwtToken");
    window.location.href = "/";
  };
  

  return (
    <div className={styles.topBar}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <SiQbittorrent style={{width: 25, height: 25}}/>
        <h2>QuickBook</h2>
      </div>
      <div>
        <TbLogout width={30} height={30} style={{width: 25, height: 25}} onClick={() => setconfirmationModalVisibility(true)}/>

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
  );
};

export default TopBar;
