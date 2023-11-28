import { TRPCError } from "@trpc/server";
import { userIsInChannel } from "../../../trpc";
import { diffChannels } from "../schema";

export const retrieve = userIsInChannel
  .output(diffChannels)
  .mutation(async ({ ctx, input }) => {
    const channel = await ctx.prisma.channel.findFirst({
      where: {
        id: +input.channelId,
      },
      select: {
        id: true,
        private: true,
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
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    if (channel === null)
      throw new TRPCError({
        message: "Channel not found",
        code: "BAD_REQUEST",
      });

    if (!channel.group) {
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
      title: channel.group.title,
      description: channel.group.description,
      authorId: channel.group.authorId,
      visibility: channel.group.visibility,
      admins: channel.group.Admin.map((admin) => admin.id),
    };
  });
