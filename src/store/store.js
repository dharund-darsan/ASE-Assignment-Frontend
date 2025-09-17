import { configureStore } from "@reduxjs/toolkit";

import calendarReducer from "./CalendarSlice";

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
  },
});
