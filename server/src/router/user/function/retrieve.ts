import { z } from "zod";
import { protectedProcedure } from "../../../trpc";
import { user } from "../schema";

export const retrieve = protectedProcedure
  .input(z.array(z.number()))
  .output(z.array(user))
  .mutation(async ({ ctx, input }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        id: {
          in: input,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        gender: true,
        country: true,
        state: true,
        city: true,
        origin: true,
      },
    });

    return users;
  });
