import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";

const initialStates = {
    fromDate: moment().toISOString(),
    toDate: moment().toISOString(),
}



export const calendarSlice = createSlice({
    name: "calendar",
    initialState: initialStates,
    reducers: {
        setFromAndToDate: (state, action) => {
            state.fromDate = action.payload.fromDate;
            state.toDate = action.payload.toDate;
        }
    },
});

// Export actions
export const { setFromAndToDate } = calendarSlice.actions;


export default calendarSlice.reducer;