import { Message } from "../../../../schema";
import { trpc } from "../../utils/trpc";
import { ChannelsState, addChannel } from "../slices/channelsSlice";
import { Me } from "../slices/meSlice";
import { addMessage, removeTempMessage } from "../slices/messagesSlice";
import { addNotification, toFirstPosition } from "../slices/notificationSlice";
import { UsersState, addUsers } from "../slices/usersSlice";
import { AppDispatch } from "../store";

interface createMessageProps {
  dispatch: AppDispatch;
  channels: ChannelsState;
  users: UsersState;
  fetchChannel: ReturnType<typeof trpc.channel.retrieve.useMutation>;
  fetchUsers: ReturnType<typeof trpc.user.retrieve.useMutation>;
  me: Me;
}

export function createMessageEventFactory({
  dispatch,
  channels,
  users,
  fetchChannel,
  fetchUsers,
  me,
}: createMessageProps) {
  return async function event(payload: Message) {
    if (!channels[payload.channelId]) {
      const channel = await fetchChannel.mutateAsync({
        channelId: payload.channelId,
      });

      const toFetch: number[] = [];

      for (const id of channel.users) {
        if (users[id]) continue;

        toFetch.push(id);
      }

      const fetchedUsers = await fetchUsers.mutateAsync(toFetch);
      dispatch(addUsers(fetchedUsers));
      dispatch(addChannel(channel));
    }

    dispatch(
      addMessage({  
        channelId: payload.channelId,
        message: {
          id: payload.id,
          authorId: payload.authorId,
          content: payload.content,
          audioFile: payload.audioFile,
          createdAt: payload.createdAt.toString(),
          updatedAt: payload.updatedAt.toString(),
          system: payload.system,
          invite: payload.invite,
        },
      })
    );

    dispatch(
      removeTempMessage({
        channelId: payload.channelId,
        nonce: payload.nonce,
      })
    );
    
    if (payload.authorId !== me.id) {
      dispatch(addNotification(payload.channelId))
    } else {
      dispatch(toFirstPosition(payload.channelId))
    }
  };
}
