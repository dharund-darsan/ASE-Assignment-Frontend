import { createSlice } from "@reduxjs/toolkit";

const initialStates = {
    value: 0
}




export const counterSlice = createSlice({
    name: "counter",
    initialState: initialStates,
    reducers: {
        increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
    reset: (state) => { state.value = 0; },
  },
});

// Export actions
export const { increment, decrement, reset } = counterSlice.actions;


export default counterSlice.reducer;