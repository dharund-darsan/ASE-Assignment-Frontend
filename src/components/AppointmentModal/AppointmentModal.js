import React, { useMemo, useState, useEffect } from "react";
import moment from "moment";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import TextInput from "../../components/TextInput/TextInput";
import Divider from "../Divider/Divider";
import styles from "./AppointmentModal.module.sass";
import { showToast } from "../Toast/Toast";
import { useIsMobile } from "../../hooks/useIsMobile";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const FREQ_OPTIONS = ["None","Daily","Weekly","Monthly"];
const STATUS_OPTIONS = [
  { id: 1, label: "Scheduled" },
  { id: 2, label: "Cancelled" },
  { id: 3, label: "Completed" },
];

const AppointmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  customers = [],
  mode = "create",
  appointment = null,
  onDelete
}) => {
  const now = useMemo(() => moment(), []);

  const [appointmentId, setAppointmentId] = useState(null);
  const [organizerId,setOrganizerId] = useState(1);
  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [location,setLocation] = useState("");
  const [meetingLink,setMeetingLink] = useState("");
  const [startDate,setStartDate] = useState(now.format("YYYY-MM-DD"));
  const [startTime,setStartTime] = useState(now.clone());
  const [endDate,setEndDate] = useState(now.format("YYYY-MM-DD"));
  const [endTime,setEndTime] = useState(now.clone().add(1,"hour"));
  const [statusId,setStatusId] = useState(1);
  const [participantIds,setParticipantIds] = useState([]);
  const [frequency,setFrequency] = useState("None");
  const [interval,setInterval] = useState(1);
  const [recurrenceStartDate,setRecurrenceStartDate] = useState(now.format("YYYY-MM-DD"));
  const [recurrenceStartTime,setRecurrenceStartTime] = useState(now.clone());
  const [recurrenceEndDate,setRecurrenceEndDate] = useState(now.clone().add(3,"months").format("YYYY-MM-DD"));
  const [recurrenceEndTime,setRecurrenceEndTime] = useState(now.clone().add(3,"months"));
  const [daysOfWeek,setDaysOfWeek] = useState([]);
  const [daysOfMonth,setDaysOfMonth] = useState([]);
  const [errors,setErrors] = useState({});
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonModalVisibility, setCancelReasonModalVisibility] = useState(false);

  const isMobile = useIsMobile();

  const isReadOnly = mode === "view";

  useEffect(()=>{
    if(appointment){
      setAppointmentId(appointment.appointmentId);
      setOrganizerId(appointment.organizerId);
      setTitle(appointment.title);
      setDescription(appointment.description);
      setLocation(appointment.location);
      setMeetingLink(appointment.meetingLink || "");
      setStartDate(moment(appointment.startTime).format("YYYY-MM-DD"));
      setStartTime(moment(appointment.startTime));
      setEndDate(moment(appointment.endTime).format("YYYY-MM-DD"));
      setEndTime(moment(appointment.endTime));
      setStatusId(appointment.statusId);
      setParticipantIds(appointment.participants || []);
      setFrequency(appointment.frequency || "None");
      setInterval(appointment.interval || 1);
      setRecurrenceStartDate(appointment.recurrenceStartDate ? moment(appointment.recurrenceStartDate).format("YYYY-MM-DD") : now.format("YYYY-MM-DD"));
      setRecurrenceStartTime(appointment.recurrenceStartDate ? moment(appointment.recurrenceStartDate) : now.clone());
      setRecurrenceEndDate(appointment.recurrenceEndDate ? moment(appointment.recurrenceEndDate).format("YYYY-MM-DD") : now.clone().add(3,"months").format("YYYY-MM-DD"));
      setRecurrenceEndTime(appointment.recurrenceEndDate ? moment(appointment.recurrenceEndDate) : now.clone().add(3,"months"));
      setDaysOfWeek(appointment.daysOfWeek || []);
      setDaysOfMonth(appointment.daysOfMonth || []);
    }
  },[appointment]);

  useEffect(() => {
    setErrors({});
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    setUserId(userDetails.userId);

  }, []);

  const [userId, setUserId] = useState('');

  const combineDateTime = (dateStr,timeMoment)=>{
    const d = moment(dateStr,"YYYY-MM-DD");
    return d.clone().hour(timeMoment.hour()).minute(timeMoment.minute()).second(0).format("YYYY-MM-DD[T]HH:mm:ss");
  }

  const toggleDay = day=>{
    if(isReadOnly) return;
    setDaysOfWeek(prev=>prev.includes(day)?prev.filter(d=>d!==day):[...prev,day]);
  }

  const toggleDayOfMonth = day=>{
    if(isReadOnly) return;
    setDaysOfMonth(prev=>prev.includes(day)?prev.filter(d=>d!==day):[...prev,day]);
  }

  const validate=()=>{
    if(isReadOnly) return true;
    const newErrors = {};

// Title required
if (!title?.trim()) newErrors.title = "Title is required.";

// Main Start/End validation
const start = moment(combineDateTime(startDate, startTime));
const end = moment(combineDateTime(endDate, endTime));

if (!start.isValid()) newErrors.start = "Start date/time invalid";
if (!end.isValid()) newErrors.end = "End date/time invalid";

if (start.isValid() && end.isValid()) {
  if (!end.isAfter(start)) {
    newErrors.end = "End must be after start";
  }
}

if (frequency !== "None") {
  // Recurrence start/end
  const rStart = moment(combineDateTime(recurrenceStartDate, recurrenceStartTime));
  const rEnd = moment(combineDateTime(recurrenceEndDate, recurrenceEndTime));

  if (!rStart.isValid()) newErrors.recurrenceStart = "Recurrence start invalid";
  if (!rEnd.isValid()) newErrors.recurrenceEnd = "Recurrence end invalid";

  if (rStart.isValid() && rEnd.isValid()) {
    if (!rEnd.isAfter(rStart)) {
      newErrors.recurrenceEnd = "Recurrence end must be after recurrence start";
    }

    // 🔥 ensure recurrence window covers the appointment
    if (start.isValid() && rStart.isAfter(start)) {
      newErrors.recurrenceStart = "Recurrence start cannot be after appointment start";
    }
    if (end.isValid() && rEnd.isBefore(end)) {
      newErrors.recurrenceEnd = "Recurrence end cannot be before appointment end";
    }
  }

  // Interval validation
  if (!Number.isInteger(interval) || interval < 1) {
    newErrors.interval = "Interval must be a whole number ≥ 1";
  }

  // Weekly validation
  if (frequency === "Weekly") {
    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      newErrors.daysOfWeek = "Pick at least one day for weekly recurrence";
    }
  }
}

if (!participantIds.length) newErrors.participantIds = "Select at least one participant";

setErrors(newErrors);

if (Object.keys(newErrors).length > 0) {
    const firstError = Object.values(newErrors)[0];
    console.log(firstError)
    showToast(firstError, 'failure', false);
    return; // stop submission
  }

    return Object.keys(newErrors).length===0;
  }

  const handleSubmit=()=>{
    if(!validate()) return;
    const payload={
      appointmentId:appointmentId,
      organizerId:Number(userId),
      title:title,
      description:description,
      location:location,
      meetingLink:meetingLink||null,
      startTime:combineDateTime(startDate,startTime),
      endTime:combineDateTime(endDate,endTime),
      statusId:Number(statusId),
      participantIds:participantIds.map(Number),
      frequency,
      interval:Number(interval),
      recurrenceStartDate:frequency==="None"?null:combineDateTime(recurrenceStartDate,recurrenceStartTime),
      recurrenceEndDate:frequency==="None"?null:combineDateTime(recurrenceEndDate,recurrenceEndTime),
      daysOfWeek:frequency==="Weekly"?daysOfWeek:[],
      daysOfMonth:frequency==="Monthly"?daysOfMonth:[]
    }
    onSubmit?.(payload);
  }

  if(!isOpen) return null;

  return(
    <Modal isOpen={isOpen} onClose={onClose} title={
      mode==="create"?"Create Appointment":
      mode==="edit"?"Edit Appointment":
      "View Appointment"
    }
    animation="bounceIn"
    fullScreen
    >
      <div className={styles.modalContent} style={{maxHeight: window.innerHeight * (isMobile ? 1 : 0.8) - (isMobile ? 110: 0), overflowY: 'auto'}}>
        {/* <TextInput
          id="organizerId"
          label="Organizer"
          type="select"
          value={organizerId}
          onChange={setOrganizerId}
          options={customers.map(c=>({value:c.value,label:c.label}))}
          placeholder="Select Organizer"
          disabled={isReadOnly}
        /> */}
        <TextInput
          id="title"
          label="Title"
          value={title}
          onChange={e=>setTitle(e.target.value)}
          fullWidth
          // error={!!errors.title}
          // helperText={errors.title}
          disabled={isReadOnly}
        />
        <TextInput
          id="description"
          label="Description"
          type="textarea"
          value={description}
          onChange={e=>setDescription(e.target.value)}
          fullWidth
          rows={3}
          disabled={isReadOnly}
        />
        {/* Start / End Date + Time */}
        <div className={styles.row2}>
          <div className={styles.column}>
            <TextInput
              id="startDate"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={e=>setStartDate(e.target.value)}
              displayValue={moment(startDate).format("MMM DD, YYYY")}
              // helperText={errors.start}
              // error={!!errors.start}
              disabled={isReadOnly}
            />
            <TextInput
              id="startTime"
              label="Start Time"
              type="time"
              value={startTime}
              onChange={setStartTime}
              disabled={isReadOnly}
            />
          </div>
          <div className={styles.column}>
            <TextInput
              id="endDate"
              label="End Date"
              type="date"
              value={endDate}
              onChange={e=>setEndDate(e.target.value)}
              displayValue={moment(endDate).format("MMM DD, YYYY")}
              // helperText={errors.end}
              // error={!!errors.end}
              disabled={isReadOnly}
            />
            <TextInput
              id="endTime"
              label="End Time"
              type="time"
              value={endTime}
              onChange={setEndTime}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <TextInput
          id="participants"
          label="Participants"
          type="select"
          value={participantIds}
          onChange={setParticipantIds}
          options={customers.map(c=>({value:c.value,label:c.label}))}
          multiple
          searchable
          placeholder="Search & select participants"
          disabled={isReadOnly}
        />

        {/* Frequency */}
        <div className={styles.frequencyBlock}>
          <label>Frequency</label>
          <select
            value={frequency}
            onChange={e=>setFrequency(e.target.value)}
            className={styles.selectInput}
            disabled={isReadOnly}
          >
            {FREQ_OPTIONS.map(f=><option key={f} value={f}>{f}</option>)}
          </select>

          {frequency==="Weekly" && (
            <div className={styles.daysOfWeekContainer}>
              {DAYS.map(d=>{
                const selected=daysOfWeek.includes(d);
                return (
                  <button key={d} type="button"
                    onClick={()=>toggleDay(d)}
                    className={`${styles.dayButton} ${selected?styles.selected:''}`}
                    disabled={isReadOnly}
                  >
                    {d.slice(0,3)}
                  </button>
                )
              })}
            </div>
          )}

          {frequency === "Monthly" && (
            <div className={styles.daysOfMonthContainer}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const selected = daysOfMonth.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDayOfMonth(day)}
                    className={`${styles.dayButton} ${selected ? styles.selected : ""}`}
                    disabled={isReadOnly}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}

          {frequency!=="None" && (
            <div className={styles.row2} style={{'grid-template-columns': '1fr'}}>
              {/* <div className={styles.column}>
                <TextInput
                  id="recurrenceStartDate"
                  label="Recurrence Start Date"
                  type="date"
                  value={recurrenceStartDate}
                  onChange={e=>setRecurrenceStartDate(e.target.value)}
                  displayValue={moment(recurrenceStartDate).format("MMM DD, YYYY")}
                  // error={!!errors.recurrenceStart}
                  // helperText={errors.recurrenceStart}
                  disabled={isReadOnly}
                />
              </div> */}
              <div className={styles.column}>
                <TextInput
                  id="recurrenceEndDate"
                  label="Recurrence End Date"
                  type="date"
                  value={recurrenceEndDate}
                  onChange={e=>setRecurrenceEndDate(e.target.value)}
                  displayValue={moment(recurrenceEndDate).format("MMM DD, YYYY")}
                  // error={!!errors.recurrenceEnd}
                  // helperText={errors.recurrenceEnd}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          )}
        </div>
        <div className={styles.row2}>
          <TextInput
            id="location"
            label="Location"
            value={location}
            onChange={e=>setLocation(e.target.value)}
            fullWidth
            disabled={isReadOnly}
          />
          <TextInput
            id="meetingLink"
            label="Meeting Link"
            value={meetingLink}
            onChange={e=>setMeetingLink(e.target.value)}
            fullWidth
            placeholder="https://..."
            disabled={isReadOnly}
          />
        </div>
      </div>

      {mode!=="view" && <Divider/>}

      <div className={styles.modalFooter}>
        <div>
          {
            mode==="edit" && (
              <Button 
                variant="danger"
                onClick={() => setCancelReasonModalVisibility(true)}
                >
                Delete
              </Button>
            )
          }
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {mode!=="view" && <Button onClick={handleSubmit}>{mode==="create"?"Create":"Save"}</Button>}
        </div>
      </div>
      {
        (
          <Modal
            onClose={() => setCancelReasonModalVisibility(false)}
            isOpen={cancelReasonModalVisibility}
            modalBody={styles['cancel-reason-modal']}
            title={"Cancel Appointment"}
          >
            <div style={{maxHeight: window.innerHeight * (0.8), overflowY: 'auto'}} className={styles.cancelModalContent}>
              <TextInput
                id="cancelReason"
                label="Cancel Reason"
                placeholder="Enter cancel reason"
                value={cancelReason}
                onChange={e=>setCancelReason(e.target.value)}
                type="textarea"
                fullWidth
              />  
            </div>
            
            <Divider />
            <div className={styles.modalFooter}>
              <div>
              </div>
              <div style={{display: 'flex', gap: 12}}>
                <Button variant="ghost" onClick={onClose}>Close</Button>
                {mode!=="view" && <Button onClick={() =>{ onDelete(appointment.appointmentId, cancelReason); setCancelReasonModalVisibility(false)}} variant="danger">Cancel</Button>}
              </div>
            </div>
          </Modal>
        )
      }
    </Modal>
  )
}

export default AppointmentModal;
