import { trpc } from "../../utils/trpc";
import { addAdmin, addChannel, addMembers, changeVisibility, editGroupTitle, removeChannel, removeMember } from "../slices/channelsSlice";
import { Me } from "../slices/meSlice";
import { addPosition, removeChannelNotification } from "../slices/notificationSlice";
import { addUsers } from "../slices/usersSlice";
import { AppDispatch } from "../store";

interface NewGroupTitleProps {
  dispatch: AppDispatch
}

export function newGroupTitleEventFactory ({
  dispatch,
}: NewGroupTitleProps) {
  return function event(payload: {
    title: string;
    channelId: number;
  }) {
    console.log(payload);
    
    dispatch(editGroupTitle(payload));
  }
}

interface RemoveMemberProps {
  dispatch: AppDispatch
  me: Me
}

export function removeMemberEventFactory ({
  dispatch,
  me
}: RemoveMemberProps) {
  return function event(payload: {
    memberId: number;
    channelId: string;
  }) {
    console.log(payload);
    
    if (me.id == payload.memberId) {
      dispatch(removeChannelNotification(+payload.channelId))
      dispatch(removeChannel(+payload.channelId))
      return
    }

    dispatch(removeMember(payload))
  }
}

interface AddMembersProps {
  dispatch: AppDispatch;
  usersId: string[];
  retrieveUsers: ReturnType<typeof trpc.user.retrieve.useMutation>;
  me: Me;
  fetchChannel: ReturnType<typeof trpc.channel.retrieve.useMutation>;
}

export const addMembersEventFactory = ({
  dispatch,
  usersId,
  retrieveUsers,
  me,
  fetchChannel
}: AddMembersProps) => {
  return async function event(payload: {
    channelId: number;
    membersIds: number[];
  }) {
    let toFetch = [];

    for (const id of payload.membersIds) {
      if (usersId.includes(id.toString())) continue;

      toFetch.push(+id);
    }

    if (toFetch.length > 0) {
      let fetchedUsers = await retrieveUsers.mutateAsync(toFetch);

      dispatch(addUsers(fetchedUsers));
    }

    if (payload.membersIds.includes(me.id)) {
      const channel = await fetchChannel.mutateAsync({
        channelId: payload.channelId
      });

      dispatch(addChannel(channel))
      dispatch(addPosition(channel.id));
    }

    dispatch(addMembers(payload))
  }
}

interface DeleteGroupProps {
  dispatch: AppDispatch
}

export const deleteGroupEventFactory = ({
  dispatch,
}: DeleteGroupProps) => {
  return function event(payload: {
    channelId: number;
    users: number[];
  }) {
    dispatch(removeChannelNotification(+payload.channelId))
    dispatch(removeChannel(+payload.channelId))
  }
}

interface ChangeVisibilityProps {
  dispatch: AppDispatch
}

export const changeVisibilityEventFactory = ({
  dispatch
}: ChangeVisibilityProps) => {
  return function event(payload: {
    channelId: number;
    visibility: 0 | 1;
  }) {
    dispatch(changeVisibility(payload))
  }
}

interface MemberJoinProps {
  dispatch: AppDispatch;
  usersId: string[];
  retrieveUsers: ReturnType<typeof trpc.user.retrieve.useMutation>;
  me: Me;
  fetchChannel: ReturnType<typeof trpc.channel.retrieve.useMutation>;
}

export const memberJoinEventFactory = ({
  dispatch,
  usersId,
  retrieveUsers,
  me,
  fetchChannel,
}: MemberJoinProps) => {
  return async function event(payload: {
    channelId: number;
    userId: number;
  }) {
    if (!usersId.includes(payload.userId.toString())) {
      let fetchedUsers = await retrieveUsers.mutateAsync([payload.userId]);

      dispatch(addUsers(fetchedUsers));
    }

    if (payload.userId === me.id) {
      const channel = await fetchChannel.mutateAsync({
        channelId: payload.channelId,
      });

      dispatch(addChannel(channel));
      dispatch(addPosition(channel.id));
    }

    dispatch(addMembers({
      channelId: payload.channelId,
      membersIds: [payload.userId]
    }));
  };
};

interface PutAdminProps {
  dispatch: AppDispatch
}

export const putAdminEventFactory = ({
  dispatch,
}: PutAdminProps) => {
  return function event(payload: {
    channelId: number;
    memberId: number;
  }) {
    dispatch(addAdmin(payload))
  }
}
