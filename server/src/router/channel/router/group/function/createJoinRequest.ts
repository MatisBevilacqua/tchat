import { ev } from "../../../../..";
import { groupIsPrivate, userIsAuthorOrSuperAdmin } from "../../../../../trpc";

export const createJoinRequest = userIsAuthorOrSuperAdmin
  .mutation(async ({ ctx, input }) => {
    const joinRequest = await ctx.prisma.joinRequest.create({
      data: {
        userId: ctx.user.id,
        groupId: +input.channelId,
        
      },
    });

    ev.emit("");
  });
