import { z } from "zod";
import { userIsInChannel } from "../../../../../trpc";
import { TRPCError } from "@trpc/server";
import { ev } from "../../../../..";
import { messageSchema } from "../../../../../events/schema";

export const create = userIsInChannel
  .input(
    z.object({
      content: z.string().trim().min(1).max(2000),
      channelId: z.number().or(z.string()),
      nonce: z.number(),
      invite: z.undefined()
    }).or(z.object({
      content: z.string().trim().min(0).max(2000),
      channelId: z.number().or(z.string()),
      nonce: z.number(),
      invite: z.number()
    }))
  )
  .mutation(async ({ ctx, input }) => {
    if (input.invite) {
      if (input.invite === input.channelId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const channel = await ctx.prisma.channel.findUnique({
        where: {
          id: +input.invite,
        },
        select: {
          group: {
            select: {
              authorId: true,
              Admin: {
                where: {
                  id: ctx.user.id,
                },
                select: {
                  id: true,
                }
              }
            },
          },
        },
      });

      if (!channel || !channel.group) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      
      if (channel.group.authorId !== ctx.user.id) {
        if (!channel.group.Admin.find((user) => user.id === ctx.user.id)) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
      }
    }

    const message = await ctx.prisma.message.create({
      data: {
        content: input.content,
        author: {
          connect: {
            id: ctx.user.id,
          },
        },
        channel: {
          connect: {
            id: +input.channelId,
          },
        },
        invite: input.invite
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        channelId: true,
        invite: true,
        audioFile: true,
      },
    });

    if (!message.authorId) throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Message authorId is null"
    });

    ev.emit("createMessage", {
      id: message.id,
      content: message.content,
      authorId: message.authorId,
      channelId: message.channelId,
      nonce: input.nonce,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      system: false,
      invite: message.invite,
      audioFile: message.audioFile
    } satisfies z.infer<typeof messageSchema>);

    return message;
  });
