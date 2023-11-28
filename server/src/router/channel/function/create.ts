import { TRPCError } from "@trpc/server";
import { ev } from "../../..";
import { protectedProcedure } from "../../../trpc";
import { createChannelInput, createChannelOutput, isPrivateOrGroup } from "../schema";

export const create = protectedProcedure
  .input(createChannelInput)
  .output(createChannelOutput)
  .mutation(async ({ ctx, input }) => {
    if (input === ctx.user.id)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You can't create a channel with yourself",
      });

    if (isPrivateOrGroup(input)) {
      let channel = await ctx.prisma.channel.findFirst({
        where: {
          users: {
            every: {
              id: {
                in: [ctx.user.id, input],
              },
            },
          },
          privateId: {
            not: null,
          },
        },
        select: {
          id: true,
          private: true,
        },
      });

      if (channel)
        return {
          type: "private",
          id: channel.id,
          users: [ctx.user.id, input],
        };

      channel = await ctx.prisma.channel.create({
        data: {
          users: {
            connect: [{ id: ctx.user.id }, { id: input }],
          },
          private: {
            create: {},
          },
        },
        select: {
          id: true,
          private: true,
        },
      });

      return {
        type: "private",
        id: channel.id,
        users: [ctx.user.id, input],
      };
    }

    const channel = await ctx.prisma.channel.create({
      data: {
        users: {
          connect: [{ id: ctx.user.id }, ...input.map((id) => ({ id }))],
        },
        group: {
          create: {
            title: `Groupe de ${ctx.user.name}`,
            description: "",
            author: {
              connect: {
                id: ctx.user.id,
              },
            },
            visibility: 1,
          },
        },
      },
      select: {
        group: {
          select: {
            title: true,
            description: true,
            authorId: true,
            visibility: true,
          },
        },
        id: true,
      },
    });

    if (!channel.group) throw new Error("Group not created");

    const message = await ctx.prisma.message.create({
      data: {
        content: `Le groupe ${channel.group.title} a été créé`,
        system: true,
        channelId: channel.id,
      },
    });

    ev.emit("createMessage", message);

    return {
      type: "group",
      id: channel.id,
      users: [ctx.user.id, ...input],
      title: channel.group.title,
      description: channel.group.description,
      authorId: channel.group.authorId,
      visibility: channel.group.visibility,
      admins: [],
    };
  });
