import { TRPCError } from "@trpc/server";
import { userIsAuthorOrSuperAdmin } from "../../../../../trpc";
import { ev } from "../../../../..";

export const deleteGroup = userIsAuthorOrSuperAdmin
  .mutation(async ({ ctx, input }) => {
    const group = await ctx.prisma.channel.findUnique({
      where: {
        id: +input.channelId
      },
      select: {
        id: true,
        group: {
          select: {
            id: true
          }
        },
        users: {
          select: {
            id: true
          }
        }
      }
    })

    if (!group?.group) throw new TRPCError({ code: "NOT_FOUND" });

    await ctx.prisma.groupChannel.delete({
      where: {
        id: group.group.id
      }
    })

    ev.emit("deleteGroup", {
      channelId: input.channelId,
      users: group.users.map(({ id }) => id)
    })

    return undefined
  });
