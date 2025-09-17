import moment from 'moment';
import styles from './DateNavigator.module.sass';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFromAndToDate } from '../../store/CalendarSlice';

const DateNavigator = React.memo(({ selectedFrequency }) => {
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
    if (selectedFrequency === 'day') {
      dispatch(setFromAndToDate({
        fromDate: moment().startOf('day').toISOString(),
        toDate: moment().endOf('day').toISOString(),
      }));
    } else if (selectedFrequency === 'week') {
      dispatch(setFromAndToDate({
        fromDate: moment().startOf('week').toISOString(),
        toDate: moment().endOf('week').toISOString(),
      }));
    } else if (selectedFrequency === 'month') {
      dispatch(setFromAndToDate({
        fromDate: moment().startOf('month').toISOString(),
        toDate: moment().endOf('month').toISOString(),
      }));
    }
  }, [selectedFrequency, dispatch]);

  


  const handleDateChange = (e) => {
    const pickedDate = moment(e.target.value);
    dispatch(setFromAndToDate({
      fromDate: pickedDate.startOf('day').toISOString(),
      toDate: pickedDate.endOf('day').toISOString(),
    }));
  };

  const handleForwardDateChange = () => {
    if (selectedFrequency === 'day') {
      dispatch(setFromAndToDate({
        fromDate: selectedFromDate.clone().add(1, 'day').startOf('day').toISOString(),
        toDate: selectedToDate.clone().add(1, 'day').endOf('day').toISOString(),
      }));
    } else if (selectedFrequency === 'week') {
      dispatch(setFromAndToDate({
        fromDate: selectedFromDate.clone().add(1, 'week').startOf('week').toISOString(),
        toDate: selectedToDate.clone().add(1, 'week').endOf('week').toISOString(),
      }));
    } else if (selectedFrequency === 'month') {
      dispatch(setFromAndToDate({
        fromDate: selectedFromDate.clone().add(1, 'month').startOf('month').toISOString(),
        toDate: selectedToDate.clone().add(1, 'month').endOf('month').toISOString(),
      }));
    }
  };

  const handleBackwardDateChange = () => {
    if (selectedFrequency === 'day') {
      dispatch(setFromAndToDate({
        fromDate: selectedFromDate.clone().subtract(1, 'day').startOf('day').toISOString(),
        toDate: selectedToDate.clone().subtract(1, 'day').endOf('day').toISOString(),
      }));
    } else if (selectedFrequency === 'week') {
      dispatch(setFromAndToDate({
        fromDate: selectedFromDate.clone().subtract(1, 'week').startOf('week').toISOString(),
        toDate: selectedToDate.clone().subtract(1, 'week').endOf('week').toISOString(),
      }));
    } else if (selectedFrequency === 'month') {
      dispatch(setFromAndToDate({
        fromDate: selectedFromDate.clone().subtract(1, 'month').startOf('month').toISOString(),
        toDate: selectedToDate.clone().subtract(1, 'month').endOf('month').toISOString(),
      }));
    }
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
