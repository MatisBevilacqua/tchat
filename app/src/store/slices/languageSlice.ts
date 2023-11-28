import AsyncStorage from "@react-native-async-storage/async-storage";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type Language = "fr" | "en";

const languageSlice = createSlice({
  name: "language",
  initialState: "en" as Language,
  reducers: {
    set: (state, action: PayloadAction<Language>) => {
      AsyncStorage.setItem("language", action.payload);

      return (state = action.payload);
    },
  },
});

export const { set: setLanguage } = languageSlice.actions;

export default languageSlice.reducer;
