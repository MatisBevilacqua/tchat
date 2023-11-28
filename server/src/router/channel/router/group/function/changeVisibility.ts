import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { userIsAuthorOrSuperAdmin } from "../../../../../trpc";
import { ev } from "../../../../..";

export const changeVisibility = userIsAuthorOrSuperAdmin
  .input(
    z.object({
      channelId: z.number(),
      visibility: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const channel = await ctx.prisma.channel.findUnique({
      where: {
        id: input.channelId,
      },
      select: {
        id: true,
        group: {
          select: {
            visibility: true,
          },
        },
      },
    });

    if (!channel || channel?.group === null)
      throw new TRPCError({ code: "NOT_FOUND" });
    if (channel.group.visibility === input.visibility) return undefined;

    await ctx.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        group: {
          update: {
            visibility: input.visibility,
          },
        },
      },
    });

    ev.emit("changeVisibility", {
      channelId: input.channelId,
      visibility: input.visibility,
    });

    return undefined;
  });
