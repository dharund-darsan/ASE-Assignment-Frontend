import { configureStore } from "@reduxjs/toolkit";

import calendarReducer from "./CalendarSlice";
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    user: userReducer
  },
});
