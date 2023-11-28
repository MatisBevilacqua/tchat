import { createSlice } from "@reduxjs/toolkit";

const loginSlice = createSlice({
  name: "login",
  initialState: false,
  reducers: {
    setLogin: (state, action) => {
      return state = action.payload;
    }
  }
})

export const { setLogin } = loginSlice.actions;

export default loginSlice.reducer;
