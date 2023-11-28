import { prisma } from "../db";
import { ev } from "../.";
import { Args, addMemberSchema, changeVisibilitySchema, deleteGroupSchema, memberJoinSchema, newGroupPicture, newGroupTitleSchema, removeMemberSchema } from "./schema";
import z from "zod"

export const newGroupTitleEvent = async ({
  payload,
  sendToIds,
}: Args<z.infer<typeof newGroupTitleSchema>>) => {
  const message = await prisma.message.create({
    data: {
      content: `Le nom du groupe a été modifié en ${payload.title}`,
      channel: {
        connect: {
          id: payload.channelId,
        },
      },
      system: true,
    },
  });

  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
    },
    select: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  ev.emit("createMessage", {
    channelId: payload.channelId,
    authorId: null,
    content: message.content,
    id: message.id,
    system: message.system,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  })

  if (!channel) return;

  sendToIds(channel.users.map(({ id }) => id), "editGroupTitle", payload);
};

export const removeMemberEvent = async ({
  payload,
  sendToIds,
}: Args<z.infer<typeof removeMemberSchema>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
    },
    select: {
      users: {
        select: {
          id: true
        }
      },
    },
  });

  if (!channel) return;

  sendToIds([...channel.users.map(({ id }) => id), payload.memberId], "removeMember", payload);
}

export const addMembersEvent = async ({
  payload,
  sendToIds,
}: Args<z.infer<typeof addMemberSchema>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
    },
    select: {
      users: {
        select: {
          id: true
        }
      },
    },
  });

  if (!channel) return;

  sendToIds(channel.users.map(({ id }) => id), "addMembers", payload);
}

export const deleteGroupEvent = async ({
  payload,
  sendToIds
}: Args<z.infer<typeof deleteGroupSchema>>) => {
  sendToIds(payload.users, "deleteGroup", {
    channelId: payload.channelId,
  });
};

export const changeVisibilityEvent = async ({
  payload,
  sendToIds,
}: Args<z.infer<typeof changeVisibilitySchema>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
    },
    select: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!channel) return;

  sendToIds(channel.users.map(({ id }) => id), "changeVisibility", payload);
};

export const memberJoinEvent = async ({
  payload,
  sendToIds,
}: Args<z.infer<typeof memberJoinSchema>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
    },
    select: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!channel) return;

  sendToIds(channel.users.map(({ id }) => id), "memberJoin", payload);
}

export const putAdminEvent = async ({
  payload,
  sendToIds,
}: Args<z.infer<typeof memberJoinSchema>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
    },
    select: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!channel) return;

  sendToIds(channel.users.map(({ id }) => id), "putAdmin", payload);
}

export const newGroupPictureEvent = async ({
  payload,
  sendToIds,
}: Args<z.infer<typeof newGroupPicture>>) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id: +payload.channelId,
    },
    select: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!channel) return;

  sendToIds(channel.users.map(({ id }) => id), "newGroupPicture", payload);
}
