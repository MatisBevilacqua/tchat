import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Me {
  id: number;
  name: string;
  surname: string;
  email: string;
  iat: number;
  token: string;
}

const meSlice = createSlice({
  name: "me",
  initialState: null as Me | null,
  reducers: {
    set: (state, action: PayloadAction<Me>) => {
      return state = action.payload;
    },
  },
});

export const { set } = meSlice.actions;

export default meSlice.reducer;
