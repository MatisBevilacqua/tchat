import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../../../../trpc";

export const getInfo = protectedProcedure
  .input(z.number())
  .query(async ({ ctx, input }) => {
    const group = await ctx.prisma.channel.findUnique({
      where: {
        id: input,
      },
      select: {
        id: true,
        group: {
          select: {
            title: true,
            visibility: true,
          },
        },
      },
    });

    if (!group?.group) throw new TRPCError({ code: "NOT_FOUND" });

    return {
      id: group.id,
      title: group.group.title,
      visibility: group.group.visibility,
    };
  });
