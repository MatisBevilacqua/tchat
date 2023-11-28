import { TRPCError } from "@trpc/server";
import { generateAccessToken } from "../../../jwt";
import { verifyPassword } from "../../../password";
import { publicProcedure } from "../../../trpc";
import { z } from "zod";

export const login = publicProcedure
  .input(
    z.object({
      email: z.string().trim().toLowerCase().email(),
      password: z.string(),
    })
  )
  .output(z.string())
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        email: input.email,
      },
      select: {
        id: true,
        hashedPassword: true,
        email: true,
        name: true,
        surname: true,
      },
    });

    if (!user || !verifyPassword(input.password, user.hashedPassword)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "INVALID_CREDENTIALS",
      });
    }

    return generateAccessToken(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
      user.hashedPassword
    );
  });
