import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";

const initialStates = {
    details: {}
}



export const userSlice = createSlice({
    name: "user",
    initialState: initialStates,
    reducers: {
        setUserDetails: (state, action) => {
            state.details = action.payload;
        }
    },
});

// Export actions
export const { setUserDetails } = userSlice.actions;


export default userSlice.reducer;