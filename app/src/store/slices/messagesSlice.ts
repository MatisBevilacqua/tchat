import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Message {
  id: number;
  content: string;
  audioFile?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: number | null;
  nonce?: number;
  system: boolean;
  invite?: number | null;
}

export interface MessageStateSchema {
  messages: {
    [key: number | string]: Message;
  };
  position: number[];
  temp: {
    [key: number | string]: Message;
  };
}

interface State {
  [key: number | string]: MessageStateSchema
}

const messagesSlice = createSlice({
  name: "messages",
  initialState: {} as State,
  reducers: {
    init: (
      state,
      action: PayloadAction<{
        channelId: number;
        messages: Message[];
      }>
    ) => {
      const { channelId, messages } = action.payload;
      
      state[channelId] = {
        messages: {},
        position: [],
        temp: {},
      };

      for (const message of messages) {
        state[channelId].messages[+message.id] = message;
        state[channelId].position.push(+message.id);
      }

      return state
    },
    addTemp: (
      state,
      action: PayloadAction<{
        channelId: number;
        nonce: number;
        message: Message;
      }>
    ) => {
      const { channelId, message } = action.payload;
      
      if (!state[channelId] || !message.nonce) return state

      state[channelId].position.unshift(message.nonce);
      state[channelId].temp[message.nonce] = message;
      
      return state;
    },
    removeTemp: (
      state,
      action: PayloadAction<{
        channelId: number;
        nonce: number;
      }>
    ) => {
      const { channelId, nonce } = action.payload;
      
      if (!state[channelId]) return state

      delete state[channelId].temp[nonce];
      
      return state;
    },
    add: (
      state,
      action: PayloadAction<{
        channelId: number;
        nonce?: number;
        message: Message;
      }>
    ) => {
      const { channelId, message } = action.payload;
      
      if (!state[channelId]) return state

      if (message.nonce) {
        delete state[channelId].temp[message.nonce];
      }

      if (state[channelId].messages[+message.id]) return state;

      state[channelId].messages[+message.id] = message;
      state[channelId].position.unshift(+message.id);
      return state;
    }
  },
});

export const {
  init: initMessages,
  add: addMessage,
  addTemp: addTempMessage,
  removeTemp: removeTempMessage,
} = messagesSlice.actions;

export default messagesSlice.reducer;
