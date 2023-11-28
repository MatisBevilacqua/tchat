import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { userIsAuthorOrSuperAdminOrAdmin } from "../../../../../trpc";
import { ev } from "../../../../..";

export const removeMember = userIsAuthorOrSuperAdminOrAdmin
  .input(
    z.object({
      channelId: z.number(),
      memberId: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const group = await ctx.prisma.channel.findUnique({
      where: {
        id: input.channelId,
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

    if (!group?.group) throw new TRPCError({ code: "NOT_FOUND" });
    if (group.group.authorId === input.memberId)
      throw new TRPCError({ code: "BAD_REQUEST" });

    await ctx.prisma.channel.update({
      where: {
        id: group.id,
      },
      data: {
        users: {
          disconnect: {
            id: input.memberId,
          },
        },
      },
    });

    ev.emit("removeMember", {
      channelId: input.channelId,
      memberId: input.memberId,
    });

    return true;
  });
