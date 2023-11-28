import { prisma } from '../db';
import { Args, messageSchema } from './schema';
import z from "zod"

export const createMessageEvent = async ({
  payload,
  sendToIds
}: Args<z.infer<typeof messageSchema>>) => {
  console.log(payload.channelId);
  
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
      // users: {
      //   some: {
      //     id: payload.authorId,
      //   },
      // },
    },
    select: {
      id: true,
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!channel) return;
// console.log(channel.users.map((user) => user.id));
console.log(payload);

  sendToIds(
    channel.users.map((user) => user.id),
    "createMessage",
    payload
  )
};
