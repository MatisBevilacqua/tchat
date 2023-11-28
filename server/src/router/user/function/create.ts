import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { generateAccessToken } from "../../../jwt";
import { hashPassword } from "../../../password";
import { z } from "zod";
import { countryType, genderType, trimMin } from "../schema";
import { publicProcedure } from "../../../trpc";

export const create = publicProcedure
  .input(
    z.object({
      name: trimMin.max(18),
      surname: trimMin.max(32),
      gender: genderType,
      countryOfResidence: countryType,
      state: trimMin.max(48),
      city: trimMin.max(48),
      originCountry: countryType,
      email: z.string().trim().max(200).toLowerCase().email(),
      password: z.string().min(8).max(64),
    })
  )
  .output(z.string())
  .mutation(async ({ ctx, input }) => {
    const [salt, hashedPassword] = hashPassword(input.password);

    try {
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          surname: input.surname,
          gender: input.gender,
          salt,
          hashedPassword,
          country: input.countryOfResidence,
          state: input.state,
          city: input.city,
          origin: input.originCountry,
        },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
        },
      });

      return generateAccessToken(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname,
        },
        hashedPassword
      );
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "EMAIL_ALREADY_USED",
        });
      }

      throw error;
    }
  });
