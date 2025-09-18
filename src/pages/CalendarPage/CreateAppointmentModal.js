import React, { useMemo, useState } from "react";
import moment from "moment";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import TextInput from "../../components/TextInput/TextInput";
import TimePicker from "../../components/TimePicker/TimePicker";
import Divider from "../../components/Divider/DIvider";
import styles from './CreateAppointmentModal.module.sass'

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATUS_OPTIONS = [
  { id: 1, label: "Scheduled" },
  { id: 2, label: "Cancelled" },
  { id: 3, label: "Completed" },
];
const FREQ_OPTIONS = ["None", "Daily", "Weekly", "Monthly"];

const CreateAppointmentModal = ({ isOpen, onClose, onSubmit, customers = [] }) => {
  // Basic fields
  const [organizerId, setOrganizerId] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  // Start/End date + time (separate controls)
  const now = useMemo(() => moment(), []);
  const [startDate, setStartDate] = useState(now.format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState(now.clone());
  const [endDate, setEndDate] = useState(now.format("YYYY-MM-DD"));
  const [endTime, setEndTime] = useState(now.clone().add(1, "hour"));

  // Status and Participants
  const [statusId, setStatusId] = useState(1);
  const [participantIds, setParticipantIds] = useState([]); // array<number>

  // Recurrence
  const [frequency, setFrequency] = useState("None");
  const [interval, setInterval] = useState(1);
  const [recurrenceStartDate, setRecurrenceStartDate] = useState(now.format("YYYY-MM-DD"));
  const [recurrenceStartTime, setRecurrenceStartTime] = useState(now.clone());
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(now.clone().add(3, "months").format("YYYY-MM-DD"));
  const [recurrenceEndTime, setRecurrenceEndTime] = useState(
    now.clone().add(3, "months").hour(now.hour()).minute(now.minute())
  );
  const [daysOfWeek, setDaysOfWeek] = useState([]);

  // Validation
  const [errors, setErrors] = useState({});

  // Time picker modal states
  const [openStartTP, setOpenStartTP] = useState(false);
  const [openEndTP, setOpenEndTP] = useState(false);
  const [openRecurStartTP, setOpenRecurStartTP] = useState(false);
  const [openRecurEndTP, setOpenRecurEndTP] = useState(false);

  const combineDateTime = (dateStr, timeMoment) => {
    const d = moment(dateStr, "YYYY-MM-DD");
    const combined = d.clone().hour(timeMoment.hour()).minute(timeMoment.minute()).second(0);
    // Local ISO-like string "YYYY-MM-DDTHH:mm:ss"
    return combined.format("YYYY-MM-DD[T]HH:mm:ss");
  };

  const toggleDay = (day) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    const start = moment(combineDateTime(startDate, startTime), moment.ISO_8601, true);
    const end = moment(combineDateTime(endDate, endTime), moment.ISO_8601, true);
    if (!start.isValid()) newErrors.start = "Start date/time is invalid.";
    if (!end.isValid()) newErrors.end = "End date/time is invalid.";
    if (start.isValid() && end.isValid() && end.isSameOrBefore(start)) {
      newErrors.end = "End must be after start.";
    }

    if (frequency !== "None") {
      const rStart = moment(combineDateTime(recurrenceStartDate, recurrenceStartTime), moment.ISO_8601, true);
      const rEnd = moment(combineDateTime(recurrenceEndDate, recurrenceEndTime), moment.ISO_8601, true);
      if (!rStart.isValid()) newErrors.recurrenceStart = "Recurrence start is invalid.";
      if (!rEnd.isValid()) newErrors.recurrenceEnd = "Recurrence end is invalid.";
      if (rStart.isValid() && rEnd.isValid() && rEnd.isBefore(rStart)) {
        newErrors.recurrenceEnd = "Recurrence end must be after recurrence start.";
      }
      if (frequency === "Weekly" && daysOfWeek.length === 0) {
        newErrors.daysOfWeek = "Pick at least one day for weekly recurrence.";
      }
      if (interval < 1) {
        newErrors.interval = "Interval must be at least 1.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      organizerId: Number(organizerId),
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      meetingLink: meetingLink.trim() === "" ? null : meetingLink.trim(),
      startTime: combineDateTime(startDate, startTime),
      endTime: combineDateTime(endDate, endTime),
      statusId: Number(statusId),
      participantIds: participantIds.map(Number), // ensure numbers
      frequency,
      interval: Number(interval),
      recurrenceStartDate: frequency === "None" ? null : combineDateTime(recurrenceStartDate, recurrenceStartTime),
      recurrenceEndDate: frequency === "None" ? null : combineDateTime(recurrenceEndDate, recurrenceEndTime),
      daysOfWeek: frequency === "Weekly" ? daysOfWeek : [],
    };

    onSubmit?.(payload);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Appointment" >
      <div style={{ display: "grid", gap: 16, maxHeight: window.innerHeight * 0.8, overflowY: "auto", padding: '16px 12px 16px 16px' }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr", alignItems: "start" }}>
          <TextInput
  id="organizerId"
  label="Organizer"
  type="select"
  value={organizerId}
  onChange={setOrganizerId}
  options={customers.map(c => ({ value: c.value, label: c.label }))}
  placeholder="Select Organizer"
/>
        </div>

        <TextInput
          id="title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          error={!!errors.title}
          helperText={errors.title}
        />

        <TextInput
          id="description"
          label="Description"
          type="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          rows={3}
        />

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <TextInput
            id="location"
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
          />
          <TextInput
            id="meetingLink"
            label="Meeting Link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            fullWidth
            placeholder="https://..."
          />
        </div>

        {/* Start / End */}
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <TextInput
              id="startDate"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              displayValue={moment(startDate).format("MMM DD, YYYY")}
              helperText={errors.start}
              error={!!errors.start}
            />

            {/* Start Time textbox that opens TimePicker */}
            <TextInput
  id="startTime"
  label="Start Time"
  type="time"
  value={startTime}
  onChange={(t) => setStartTime(t)}
  placeholder="Pick a time"
/>

          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <TextInput
              id="endDate"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              displayValue={moment(endDate).format("MMM DD, YYYY")}
              helperText={errors.end}
              error={!!errors.end}
            />

            {/* End Time textbox that opens TimePicker */}
            <div style={{ display: "grid", gap: 8 }}>
    <TextInput
      id="endTime"
      label="End Time"
      type="time"
      value={endTime}
      onChange={(t) => setEndTime(t)}
      placeholder="Pick a time"
    />
  </div>
            <Modal
              isOpen={openEndTP}
              onClose={() => setOpenEndTP(false)}
              title="Pick End Time"
            >
              <div style={{ padding: 8 }}>
                <TimePicker
                  value={endTime}
                  hour12
                  onSave={(t) => {
                    setEndTime(t);
                    setOpenEndTP(false);
                  }}
                  onCancel={() => setOpenEndTP(false)}
                  initialMode="picker"
                />
              </div>
            </Modal>
          </div>
        </div>

        {/* Participants - searchable multi-select via TextInput */}
        <TextInput
  id="participants"
  label="Participants"
  type="select"
  value={participantIds}
  onChange={setParticipantIds}
  options={customers.map(c => ({ value: c.value, label: c.label }))}
  multiple
  searchable
  placeholder="Search & select participants"
/>

        {/* Recurrence */}
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr" }}>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              >
                {FREQ_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            {frequency === "Weekly" && (
  <div>
    <label style={{ display: "block", marginBottom: 6 }}>
      Days of Week 
      {errors.daysOfWeek && (
        <span style={{ color: "#d33", fontWeight: 500 }}> ({errors.daysOfWeek})</span>
      )}
    </label>
    <div className={styles.daysOfWeekContainer}>
      {DAYS.map((d) => {
        const selected = daysOfWeek.includes(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => toggleDay(d)}
            className={`${styles.dayButton} ${selected ? styles.selected : ''}`}
          >
            {d.slice(0,3)}
          </button>
        );
      })}
    </div>
  </div>
)}
          </div>

          {frequency !== "None" && (
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ display: "grid", gap: 8 }}>
                <TextInput
                  id="recurrenceStartDate"
                  label="Recurrence Start Date"
                  type="date"
                  value={recurrenceStartDate}
                  onChange={(e) => setRecurrenceStartDate(e.target.value)}
                  fullWidth
                  displayValue={moment(recurrenceStartDate).format("MMM DD, YYYY")}
                  error={!!errors.recurrenceStart}
                  helperText={errors.recurrenceStart}
                />
                
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <TextInput
                  id="recurrenceEndDate"
                  label="Recurrence End Date"
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  fullWidth
                  displayValue={moment(recurrenceEndDate).format("MMM DD, YYYY")}
                  error={!!errors.recurrenceEnd}
                  helperText={errors.recurrenceEnd}
                />
              </div>
            </div>
          )}
        </div>


        
      </div>
        <Divider />
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", padding: '8px 8px 4px 8px' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </div>
    </Modal>
  );
};

export default CreateAppointmentModal;
