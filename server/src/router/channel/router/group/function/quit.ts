import { TRPCError } from "@trpc/server";
import { userIsInChannel } from "../../../../../trpc";
import { ev } from "../../../../..";

export const quit = userIsInChannel
  .mutation(async ({ ctx, input }) => {
    const channel = await ctx.prisma.channel.findUnique({
      where: {
        id: +input.channelId,
      },
      select: {
        id: true,
        group: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });

    if (!channel?.group) throw new TRPCError({ code: "NOT_FOUND" });
    if (channel.group.authorId === ctx.user.id)
      throw new TRPCError({ code: "BAD_REQUEST" });

    await ctx.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        users: {
          disconnect: {
            id: ctx.user.id,
          },
        },
      },
    });

    ev.emit("removeMember", {
      channelId: input.channelId,
      memberId: ctx.user.id,
    });
  });
