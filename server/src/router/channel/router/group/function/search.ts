import { z } from "zod";
import { protectedProcedure } from "../../../../../trpc";

export const search = protectedProcedure
  .input(
    z.object({
      query: z.string().trim().min(2).max(50),
    })
  )
  .output(
    z.array(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        users: z.array(z.number()),
        visibility: z.number().optional(),
      })
    )
  )
  .query(async ({ ctx, input }) => {
    const groups = await ctx.prisma.channel.findMany({
      where: {
        group: {
          title: {
            contains: input.query,
          },
          visibility: 0,
        },
      },
      select: {
        id: true,
        users: {
          select: {
            id: true,
          },
        },
        group: {
          select: {
            visibility: true,
            title: true,
          },
        },
      },
    });

    console.log(groups);

    return groups
      .filter((channel) => channel.group !== null)
      .map(({ id, group, users }) => ({
        id,
        title: group?.title,
        visibility: group?.visibility,
        users: users.map(({ id }) => id),
      }));
  });
