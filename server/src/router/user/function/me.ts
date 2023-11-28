import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../../trpc";

export const me = protectedProcedure
  .query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
      },
    });

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    return user;
  });
