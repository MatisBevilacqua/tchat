import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Private {
  id: number;
  type: "private";
  users: number[];
}

interface Group {
  id: number;
  type: "group";
  users: number[];
  title: string;
  description: string;
  authorId: number;
  visibility: number;
  admins: number[];
}

export type Channel = Private | Group;

export type ChannelsState = Record<number | string, Channel>

const channelsSlice = createSlice({
  name: "channels",
  initialState: {} as ChannelsState,
  reducers: {
    addChannel: (state, action: PayloadAction<Channel>) => {
      const channel = action.payload;
      state[channel.id] = channel;

      return state;
    },
    editGroupTitle: (state, action: PayloadAction<{ channelId: number; title: string }>) => {
      const { channelId, title } = action.payload;
      
      const channel = state[channelId];

      if (channel.type !== "group") return state

      channel.title = title;
      return state;
    },
    removeMember: (
      state,
      action: PayloadAction<{
        channelId: string;
        memberId: number
      }>
    ) => {
      const { channelId, memberId } = action.payload;

      const channel = state[channelId];

      if (channel.type !== "group") return state;

      channel.users = channel.users.filter((id) => id !== memberId);

      return state;
    },
    removeChannel: (state, action: PayloadAction<number>) => {
      delete state[action.payload];

      return state;
    },
    addMembers: (
      state,
      action: PayloadAction<{
        channelId: number;
        membersIds: number[];
      }>
    ) => {
      const { channelId, membersIds } = action.payload;
      const channel = state[channelId];

      if (channel && channel.type !== "group") return state;

      channel.users.push(...membersIds);

      return state;
    },
    changeVisibility: (
      state,
      action: PayloadAction<{
        channelId: number;
        visibility: 0 | 1;
      }>
    ) => {
      const { channelId, visibility } = action.payload;
      const channel = state[channelId];
      
      if (channel && channel.type !== "group") return state;

      channel.visibility = visibility;

      return state;
    },
    addAdmin: (
      state,
      action: PayloadAction<{
        channelId: number;
        memberId: number;
      }>
    ) => {
      const { channelId, memberId } = action.payload;
      const channel = state[channelId];

      if (channel && channel.type !== "group") return state;

      channel.admins.push(memberId);

      return state;
    }
  },
});

export const {
  addChannel,
  editGroupTitle,
  removeMember,
  removeChannel,
  addMembers,
  changeVisibility,
  addAdmin,
} = channelsSlice.actions;

export default channelsSlice.reducer;
