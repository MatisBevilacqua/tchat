import { configureStore, ThunkAction, Action, AnyAction, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import logger from "redux-logger";
import loginReducer from "./slices/loginSlice";
import usersReducer from "./slices/usersSlice";
import channelsSlice from "./slices/channelsSlice";
import meSlice from "./slices/meSlice";
import messagesSlice from "./slices/messagesSlice";
import notificationSlice from "./slices/notificationSlice";
import languageSlice from "./slices/languageSlice";

const combinedReducer = combineReducers({
  me: meSlice,
  login: loginReducer,
  users: usersReducer,
  channels: channelsSlice,
  messages: messagesSlice,
  notification: notificationSlice,
  language: languageSlice,
});

const rootReducer = (state: any, action: AnyAction) => {
  if (action.type === "RESET") {
    //We are calling this RESET, but call what you like!
    state = {};
    console.log("RESET");
    
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  // middleware(getDefaultMiddleware) {
  //   return getDefaultMiddleware().concat(logger);
  // },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
