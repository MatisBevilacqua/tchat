import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface State {
  positions: number[]
  notifications: {
    [key: number]: number
  }
}

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    positions: [],
    notifications: {}
  } as State,
  reducers: {
    setPositions(state, action: PayloadAction<number[]>) {
      state.positions = action.payload;

      for (const position of action.payload) {
        state.notifications[+position] = 0;
      }

      return state
    },
    addPosition(state, action: PayloadAction<number>) {
      if (state.positions.indexOf(action.payload) !== -1) {
        return state
      }

      state.positions.push(action.payload);
      state.notifications[action.payload] = 0;

      return state
    },
    toFirstPosition(state, action: PayloadAction<number>) {
      const id = action.payload;
      const pos = state.positions.indexOf(id)

      if (pos !== -1) {
        state.positions.splice(pos, 1);
      }

      state.positions.unshift(id);

      return state
    },
    addNotification(state, action: PayloadAction<number>) {
      const id = action.payload;

      if (!state.notifications[id]) {
        state.notifications[id] = 0;
      }

      state.notifications[id] += 1;
      const pos = state.positions.indexOf(id)

      if (pos !== -1) {
        state.positions.splice(pos, 1);
      }

      state.positions.unshift(id);

      return state
    },
    clearNotifications(state, action: PayloadAction<number>) {
      const id = action.payload;

      state.notifications[id] = 0;

      return state
    },
    removeChannelNotification(state, action: PayloadAction<number>) {
      const id = action.payload;

      console.log("removeChannelNotification", id);
      console.log(state.notifications);
      
      if (state.notifications[id] === undefined) {
        return state
      }

      delete state.notifications[id];
      const pos = state.positions.indexOf(id)
console.log("pos", pos);

      if (pos !== -1) {
        state.positions.splice(pos, 1);
      }
      
      return state
    }
  },
});

export const {
  addNotification,
  setPositions,
  addPosition,
  toFirstPosition,
  clearNotifications,
  removeChannelNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
