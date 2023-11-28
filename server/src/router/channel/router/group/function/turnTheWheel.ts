import { randomInt } from 'crypto';
import { TRPCError } from "@trpc/server";
import { userIsAuthorOrSuperAdmin } from '../../../../../trpc';

export const turnTheWheel = userIsAuthorOrSuperAdmin
  .mutation(
    async ({ ctx, input }) => {
      const group = await ctx.prisma.channel.findUnique({
        where: {
          id: +input.channelId,
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

      if (!group) throw new TRPCError({ code: "NOT_FOUND" });

      const users = group.users.map(({ id }) => id);
      const winnerId = users[randomInt(0, users.length - 1)];

      return winnerId;
    }
  );
