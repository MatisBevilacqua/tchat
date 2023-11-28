import { z } from "zod";
import { protectedProcedure } from "../../../trpc";
import { user } from "../schema";

export const search = protectedProcedure
  .input(
    z.object({
      input: z.string().min(2),
      not: z.array(z.number()).optional(),
    })
  )
  .output(z.array(user))
  .query(async ({ ctx, input: { input, not } }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: input,
            },
          },
          {
            surname: {
              contains: input,
            },
          },
          {
            email: {
              contains: input,
            },
          },
        ],
        NOT: {
          id: {
            in: [ctx.user.id, ...(not || [])],
          },
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
