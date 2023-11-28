import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { userIsAuthorOrSuperAdminOrAdmin } from "../../../../../trpc";
import { ev } from "../../../../..";

export const editTitle = userIsAuthorOrSuperAdminOrAdmin
  .input(
    z.object({
      title: z.string().trim().min(2).max(50),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const group = await ctx.prisma.channel.findUnique({
      where: {
        id: +input.channelId,
      },
      select: {
        group: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!group) throw new TRPCError({ code: "NOT_FOUND" });

    const { title } = await ctx.prisma.groupChannel.update({
      where: {
        id: group.group?.id,
      },
      data: {
        title: input.title,
      },
    });

    ev.emit("newGroupTitle", {
      title,
      channelId: input.channelId,
    });

    return undefined;
  });
