import { retrieve } from './function/retrieve';
import { retrieveRecentChannels } from './function/retrieveRecentChannels';
import { create } from './function/create';
import { router } from "../../trpc";
import { messageRouter } from "./router/message/message";
import { groupRouter } from "./router/group/group";

export const channelRouter = router({
  create,
  retrieveRecentChannels,
  retrieve,
  message: messageRouter,
  group: groupRouter,
});
