import { TRPCError } from "@trpc/server";
import { ev } from "../../../../..";
import { protectedProcedure } from "../../../../../trpc";
import { z } from "zod";

export const join = protectedProcedure
  .input(z.number())
  .mutation(async ({ ctx, input }) => {
    const channel = await ctx.prisma.channel.findUnique({
      where: {
        id: input,
        group: {
          JoinRequest: {
            some: {
              id: input,
            }
          }
        }
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
            id: true,
            authorId: true,
            visibility: true,
          },
        },
      },
    });

    if (!channel?.group) throw new TRPCError({ code: "NOT_FOUND" });
    if (channel.users.some((user) => user.id === ctx.user.id)) throw new TRPCError({ code: "FORBIDDEN" });
    
    if (channel.group.visibility === 1) {
      
    }

    const updatedChannel = await ctx.prisma.channel.update({
      where: {
        id: input,
      },
      data: {
        users: {
          connect: {
            id: ctx.user.id,
          },
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
            id: true,
            title: true,
            visibility: true,
            authorId: true,
            description: true,
            Admin: {
              select: {
                id: true,
              },
            }
          },
        },
      },
    });

    ev.emit("memberJoin", {
      channelId: input,
      userId: ctx.user.id,
    });

    return updatedChannel
  });
