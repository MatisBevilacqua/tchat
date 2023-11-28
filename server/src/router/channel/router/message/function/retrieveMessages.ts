import { userIsInChannel } from "../../../../../trpc";

export const retrieveMessages = userIsInChannel
  .mutation(
    async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: {
          channelId: +input.channelId,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          system: true,
          invite: true,
          audioFile: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return messages.reverse();
    }
  );
