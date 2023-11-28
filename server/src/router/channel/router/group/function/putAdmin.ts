import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { userIsAuthorOrSuperAdmin } from "../../../../../trpc";
import { ev } from "../../../../..";

export const putAdmin = userIsAuthorOrSuperAdmin
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

    await ctx.prisma.groupChannel.update({
      where: {
        id: group.group.id,
      },
      data: {
        Admin: {
          connect: {
            id: input.memberId,
          },
        },
      },
    });

    ev.emit("putAdmin", {
      channelId: input.channelId,
      memberId: input.memberId,
    });
  });
