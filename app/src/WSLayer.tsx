import { PropsWithChildren } from "react";
import { useAppDispatch, useAppSelector } from "./store/store";
import { trpc } from "./utils/trpc";
import useWebSocket from "react-use-websocket";
import { host } from "./utils/host";
import { allSchemaEvent } from "../schema";
import { createMessageEventFactory } from "./store/event/messageEvent";
import { addMembersEventFactory, changeVisibilityEventFactory, deleteGroupEventFactory, newGroupTitleEventFactory, putAdminEventFactory, removeMemberEventFactory } from "./store/event/channelEvent";

export default function WSLayer({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const me = useAppSelector((state) => state.me);
  const channels = useAppSelector((state) => state.channels);
  const users = useAppSelector((state) => state.users);
  const fetchChannel = trpc.channel.retrieve.useMutation();
  const fetchUsers = trpc.user.retrieve.useMutation();
  const retrieveUsers = trpc.user.retrieve.useMutation()

  const { sendJsonMessage } = useWebSocket(`ws://${host}:3000/ws?token=${me?.token}`, {
    onClose(event) {
      if (event.code === 1001) {
        console.log("La connexion a été fermée par le client.");
        console.log(event)
      } else {
        console.log(
          "La connexion a été fermée pour une autre raison, code:",
          event
        );
      }
    },
    onOpen() {
      console.log("WS OPEN");

      sendJsonMessage({
        event: "init",
        payload: me?.token,
      });
    },
    onError(event) {
      console.log(event);
    },
    shouldReconnect: () => true,
    async onMessage(ev: MessageEvent<string>) {
      let event = allSchemaEvent.safeParse(JSON.parse(ev.data));

      if (!event.success || me === null) return;

      const { payload } = event.data;

      interface EventsObj {
        [key: string]: (payload: any) => Promise<void> | void;
      }

      const events: EventsObj = {
        createMessage: createMessageEventFactory({
          dispatch,
          channels,
          users,
          fetchChannel,
          fetchUsers,
          me,
        }),
        editGroupTitle: newGroupTitleEventFactory({
          dispatch,
        }),
        removeMember: removeMemberEventFactory({
          dispatch,
          me
        }),
        addMembers: addMembersEventFactory({
          dispatch,
          usersId: Object.keys(users),
          retrieveUsers,
          me,
          fetchChannel,
        }),
        deleteGroup: deleteGroupEventFactory({
          dispatch,
        }),
        changeVisibility: changeVisibilityEventFactory({
          dispatch
        }),
        putAdmin: putAdminEventFactory({
          dispatch,
        })
      } as const;

      const eventFn = events[event.data.event];

      if (eventFn) {
        eventFn(payload);
      }
    },
    heartbeat: {
      message: "ping",
      interval: 15000,
    },
  });

  return children;
}
