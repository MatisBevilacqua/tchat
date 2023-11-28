import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../../trpc";
import { channelsList } from "../schema";

export const retrieveRecentChannels = protectedProcedure
  .output(channelsList)
  .query(async ({ ctx }) => {
    interface QueryRaw {
      channel_id: number;
      message_id: number | null;
      created_at: Date | null;
    }

    const channels = await ctx.prisma.$queryRaw<QueryRaw[] | null>`
        SELECT c.id AS channel_id, m.message_id, m.created_at
        FROM Channel c
        LEFT JOIN (
          SELECT channelId AS message_id, MAX(createdAt) AS created_at
          FROM Message
          GROUP BY channelId
        ) m ON c.id = m.message_id
        WHERE EXISTS (
          SELECT 1
          FROM _ChannelToUser cu
          WHERE cu.A = c.id
          AND cu.B = ${ctx.user.id}
        )
        ORDER BY m.created_at DESC;
      `;

    if (!channels || channels.length < 1) return [];

    const mostRecentChannels = await ctx.prisma.channel.findMany({
      where: {
        id: {
          in: channels
            .filter((channel) => channel.created_at !== null)
            .map((channel) => channel.channel_id),
        },
        users: {
          some: {
            id: ctx.user.id,
          },
        },
      },
      select: {
        id: true,
        users: {
          select: {
            id: true,
          },
        },
        group: {
          select: {
            title: true,
            description: true,
            authorId: true,
            visibility: true,
            Admin: {
              select: {
                id: true,
              },
            },
          },
        },
        private: {
          select: {
            id: true,
          },
        },
      },
    });

    let objectChannel: any = {};

    const arr = mostRecentChannels?.map((channel) => {
      const { group, private: channelPrivate } = channel;

      if (group === null && channelPrivate === null)
        throw new TRPCError({
          message: "Channel not found",
          code: "BAD_REQUEST",
        });

      if (group === null) {
        return {
          type: "private",
          id: channel.id,
          users: channel.users.map((user) => user.id),
        };
      }

      return {
        type: "group",
        id: channel.id,
        users: channel.users.map((user) => user.id),
        title: group.title,
        description: group.description,
        authorId: group.authorId,
        visibility: group.visibility,
        admins: group.Admin.map((admin) => admin.id),
      };
    });

    for (const channel of arr) {
      objectChannel[+channel.id] = channel;
    }

    return [...Array(arr.length)].map(
      (_, i) => objectChannel[channels[i].channel_id]
    );
  });
