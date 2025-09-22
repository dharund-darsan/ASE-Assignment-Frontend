import moment from 'moment';
import styles from './DateNavigator.module.sass';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFromAndToDate } from '../../store/CalendarSlice';

const DateNavigator = React.memo(({ selectedFrequency, onDateChange }) => {
  const dispatch = useDispatch();

  const fromDate = useSelector((state) => state.calendar.fromDate);
  const toDate = useSelector((state) => state.calendar.toDate);

  const selectedFromDate = fromDate ? moment(fromDate) : moment();
  const selectedToDate = toDate ? moment(toDate) : moment();

  const inputRef = useRef(null);

  const openDatePicker = () => {
    if (inputRef.current) {
      if (inputRef.current.showPicker) {
        inputRef.current.showPicker(); // ✅ Works in Chrome/Edge
      } else {
        inputRef.current.click(); // fallback (Safari/Firefox)
      }
    }
  };

  // Reset when frequency changes
  useEffect(() => {
    let fromDate;
    let toDate;
    if (selectedFrequency === 'day') {
      fromDate = moment().startOf('day');
      toDate = moment().endOf('day');
    } else if (selectedFrequency === 'week') {
      fromDate = moment().startOf('week');
      toDate = moment().endOf('week');
    } else if (selectedFrequency === 'month') {
      fromDate = moment().startOf('month');
      toDate = moment().endOf('month');
    }
    dispatch(setFromAndToDate({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      }));
    // onDateChange?.(fromDate, toDate);
  }, [selectedFrequency, dispatch]);

  


  const handleDateChange = (e) => {
    const pickedDate = moment(e.target.value);
    dispatch(setFromAndToDate({
      fromDate: pickedDate.startOf('day').toISOString(),
      toDate: pickedDate.endOf('day').toISOString(),
    }));
    onDateChange?.(pickedDate.startOf('day'), pickedDate.endOf('day'));
  };

  const handleForwardDateChange = () => {
    let fromDate;
    let toDate;

    if (selectedFrequency === 'day') {
      fromDate = selectedFromDate.clone().add(1, 'day').startOf('day');
      toDate = selectedToDate.clone().add(1, 'day').endOf('day')
    } else if (selectedFrequency === 'week') {
      fromDate = selectedFromDate.clone().add(1, 'week').startOf('week');
      toDate = selectedToDate.clone().add(1, 'week').endOf('week');
    } else if (selectedFrequency === 'month') {
      fromDate = selectedFromDate.clone().add(1, 'month').startOf('month');
      toDate = selectedToDate.clone().add(1, 'month').endOf('month');
    }
    dispatch(setFromAndToDate({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString()
    }));
    onDateChange?.(fromDate, toDate)
  };

  const handleBackwardDateChange = () => {
    let fromDate;
    let toDate;
    if (selectedFrequency === 'day') {
      fromDate = selectedFromDate.clone().subtract(1, 'day').startOf('day');
      toDate = selectedToDate.clone().subtract(1, 'day').endOf('day');
    } else if (selectedFrequency === 'week') {
      fromDate = selectedFromDate.clone().subtract(1, 'week').startOf('week');
      toDate = selectedToDate.clone().subtract(1, 'week').endOf('week');
    } else if (selectedFrequency === 'month') {
      fromDate = selectedFromDate.clone().subtract(1, 'month').startOf('month');
      toDate = selectedToDate.clone().subtract(1, 'month').endOf('month');
    }
    dispatch(setFromAndToDate({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString()
    }));
    onDateChange?.(fromDate, toDate);
  };

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "ArrowLeft") {
      e.preventDefault();
      handleBackwardDateChange();
    } else if (e.ctrlKey && e.key === "ArrowRight") {
      e.preventDefault();
      handleForwardDateChange();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [handleBackwardDateChange, handleForwardDateChange]);

  return (
    <div className={styles.dateNavigator}>
      <div onClick={handleBackwardDateChange} className={styles.arrowContainer}>
        <IoIosArrowBack />
      </div>

      <div className={styles.dateContainer}>
        {selectedFrequency === 'day' ? (
          <p className={styles.dateLabel} onClick={openDatePicker}>
            {selectedFromDate.format('DD MMM YYYY')}
            <input
              type="date"
              value={selectedFromDate.format("YYYY-MM-DD")}
              onChange={handleDateChange}
              className={styles.hiddenDateInput}
              ref={inputRef}
            />
          </p>
        ) : (
          <p>
            {selectedFromDate.format('DD MMM YYYY')} - {selectedToDate.format('DD MMM YYYY')}
          </p>
        )}
      </div>

      <div onClick={handleForwardDateChange} className={styles.arrowContainer}>
        <IoIosArrowForward />
      </div>
    </div>
  );
});

export default DateNavigator;
